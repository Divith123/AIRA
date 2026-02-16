import { randomUUID } from "node:crypto";
import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import {
  extractBearerToken,
  hashPassword,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyPasswordHash,
  verifyRefreshToken,
} from "@/lib/server/auth";
import { authOptions } from "@/lib/server/auth-options";
import { readJson } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";

const nextAuthHandler = NextAuth(authOptions);

const ACCESS_TOKEN_TTL_SECONDS = 24 * 60 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

type RouteContext = {
  params: Promise<{ nextauth?: string[] }> | { nextauth?: string[] };
};

function resolveParams(context: RouteContext["params"]) {
  if ("then" in context) return context;
  return Promise.resolve(context);
}

function getAction(slug: string[] | undefined) {
  return slug?.[0] || "";
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function passwordPolicy(password: string) {
  if (password.length < 12) return "Password must be at least 12 characters long";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
  if (!/\d/.test(password)) return "Password must contain at least one digit";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain at least one special character";
  return null;
}

function isAdminRole(role: { name: string; isSystem: boolean } | null | undefined) {
  const roleName = (role?.name || "").toLowerCase();
  return (
    !!role?.isSystem ||
    roleName === "administrator" ||
    roleName === "admin" ||
    roleName === "owner"
  );
}

async function ensureAdminRoleId() {
  const adminRole = await prisma.role.upsert({
    where: { id: "role_admin" },
    update: {
      name: "Administrator",
      isSystem: true,
    },
    create: {
      id: "role_admin",
      name: "Administrator",
      description: "System administrator role",
      permissions: JSON.stringify(["*"]),
      isSystem: true,
    },
  });
  return adminRole.id;
}

function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string) {
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set("token", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
  });
  response.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  });
}

async function handleRegister(request: NextRequest) {
  const payload = await readJson<{
    email: string;
    password: string;
    name: string;
    phone?: string;
  }>(request);

  const email = (payload.email || "").trim().toLowerCase();
  if (!validEmail(email)) {
    return NextResponse.json(
      { error: "Validation failed", message: "Invalid email format", field: "email" },
      { status: 400 },
    );
  }

  const passwordError = passwordPolicy(payload.password || "");
  if (passwordError) {
    return NextResponse.json(
      { error: "Validation failed", message: passwordError, field: "password" },
      { status: 400 },
    );
  }

  const name = (payload.name || "").trim();
  if (name.length < 2) {
    return NextResponse.json(
      { error: "Validation failed", message: "Name must be at least 2 characters long", field: "name" },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
    },
  });
  if (existing) {
    return NextResponse.json({ error: "Conflict", message: "Email already exists" }, { status: 409 });
  }

  const userId = randomUUID();
  const passwordHash = await hashPassword(payload.password);
  const roleId = await ensureAdminRoleId();

  await prisma.user.create({
    data: {
      id: userId,
      email,
      password: passwordHash,
      name,
      phone: payload.phone?.trim() || null,
      ownerId: userId,
      roleId,
      isActive: true,
    },
  });

  return NextResponse.json({
    success: true,
    message: "User registered successfully",
  });
}

async function handleLogin(request: NextRequest) {
  const payload = await readJson<{ email: string; password: string }>(request);
  const email = (payload.email || "").trim().toLowerCase();

  if (!validEmail(email)) {
    return NextResponse.json(
      { error: "Validation failed", message: "Invalid email format", field: "email" },
      { status: 400 },
    );
  }
  if (!payload.password) {
    return NextResponse.json(
      { error: "Validation failed", message: "Password is required", field: "password" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
    include: {
      role: true,
    },
  });
  if (!user) {
    return NextResponse.json(
      { error: "Authentication failed", message: "Invalid email or password" },
      { status: 401 },
    );
  }
  if (user.isActive === false) {
    return NextResponse.json(
      { error: "Account disabled", message: "Your account has been disabled" },
      { status: 403 },
    );
  }

  const passwordOk = await verifyPasswordHash(user.password, payload.password);
  if (!passwordOk) {
    return NextResponse.json(
      { error: "Authentication failed", message: "Invalid email or password" },
      { status: 401 },
    );
  }

  const isAdmin = isAdminRole(user.role);
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    name: user.name || "",
    is_admin: isAdmin,
  });
  const refreshToken = signRefreshToken(user.id);

  const response = NextResponse.json({
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: "Bearer",
    expires_in: ACCESS_TOKEN_TTL_SECONDS,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      is_admin: isAdmin,
    },
  });
  setAuthCookies(response, accessToken, refreshToken);
  return response;
}

async function handleRefresh(request: NextRequest) {
  let payload: { refresh_token?: string } = {};
  try {
    payload = await readJson<{ refresh_token?: string }>(request);
  } catch {
    payload = {};
  }

  const refreshToken = payload.refresh_token || request.cookies.get("refresh_token")?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "Missing refresh_token" }, { status: 400 });
  }

  const refreshClaims = verifyRefreshToken(refreshToken);
  if (!refreshClaims) {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: refreshClaims.sub },
    include: {
      role: true,
    },
  });
  if (!user || user.isActive === false) {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }

  const isAdmin = isAdminRole(user.role);
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    name: user.name || "",
    is_admin: isAdmin,
  });
  const newRefreshToken = signRefreshToken(user.id);

  const response = NextResponse.json({
    access_token: accessToken,
    refresh_token: newRefreshToken,
    token_type: "Bearer",
    expires_in: ACCESS_TOKEN_TTL_SECONDS,
  });
  setAuthCookies(response, accessToken, newRefreshToken);
  return response;
}

function handleMe(request: NextRequest) {
  const token = extractBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const claims = verifyAccessToken(token);
  if (!claims) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    id: claims.sub,
    email: claims.email,
    name: claims.name,
    is_admin: claims.is_admin,
  });
}

function handleLogout() {
  const secure = process.env.NODE_ENV === "production";
  const response = NextResponse.json({ success: true });
  response.cookies.set("token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 0,
  });
  response.cookies.set("refresh_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { nextauth } = await resolveParams(context.params);
  const action = getAction(nextauth);
  if (action === "me") {
    return handleMe(request);
  }
  return nextAuthHandler(request, context as Parameters<typeof nextAuthHandler>[1]);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { nextauth } = await resolveParams(context.params);
  const action = getAction(nextauth);

  if (action === "register") {
    return handleRegister(request);
  }
  if (action === "login") {
    return handleLogin(request);
  }
  if (action === "refresh") {
    return handleRefresh(request);
  }
  if (action === "logout") {
    return handleLogout();
  }

  return nextAuthHandler(request, context as Parameters<typeof nextAuthHandler>[1]);
}
