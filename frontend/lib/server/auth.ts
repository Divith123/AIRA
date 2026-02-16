import jwt from "jsonwebtoken";
import { compare, hash } from "bcryptjs";
import type { NextRequest } from "next/server";
import { serverEnv } from "./env";

export interface Claims {
  sub: string;
  email: string;
  name: string;
  is_admin: boolean;
  exp: number;
  iat: number;
}

interface RefreshClaims {
  sub: string;
  type: "refresh";
  exp: number;
  iat: number;
}

function extractCookieToken(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((part) => part.trim());
  for (const part of parts) {
    const [key, rawValue] = part.split("=");
    if (key === "token" && rawValue) {
      try {
        return decodeURIComponent(rawValue);
      } catch {
        return rawValue;
      }
    }
  }
  return null;
}

export function extractBearerToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    const token = header.slice("Bearer ".length).trim();
    if (token) return token;
  }

  const cookieToken = extractCookieToken(request.headers.get("cookie"));
  if (cookieToken) return cookieToken;

  const queryToken = request.nextUrl.searchParams.get("token");
  if (queryToken) return queryToken;

  return null;
}

export function signAccessToken(payload: {
  sub: string;
  email: string;
  name: string;
  is_admin: boolean;
}) {
  return jwt.sign(payload, serverEnv.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "24h",
  });
}

export function signRefreshToken(sub: string) {
  return jwt.sign({ sub, type: "refresh" }, serverEnv.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "30d",
  });
}

export function verifyAccessToken(token: string): Claims | null {
  try {
    return jwt.verify(token, serverEnv.JWT_SECRET) as Claims;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): RefreshClaims | null {
  try {
    const payload = jwt.verify(token, serverEnv.JWT_SECRET) as RefreshClaims;
    if (payload.type !== "refresh") return null;
    return payload;
  } catch {
    return null;
  }
}

export async function verifyPasswordHash(hash: string, password: string) {
  try {
    return await compare(password, hash);
  } catch {
    return false;
  }
}

export async function hashPassword(password: string) {
  return hash(password, 12);
}
