import { NextResponse, type NextRequest } from "next/server";
import { extractBearerToken, verifyAccessToken, type Claims } from "./auth";
import { resolveOwnedProjectId } from "./project";

export function requireAuth(
  request: NextRequest,
  options: { admin?: boolean } = {},
): Claims | NextResponse {
  const token = extractBearerToken(request);
  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Missing access token" },
      { status: 401 },
    );
  }

  const claims = verifyAccessToken(token);
  if (!claims) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Invalid access token" },
      { status: 401 },
    );
  }

  if (options.admin && !claims.is_admin) {
    return NextResponse.json(
      { error: "Forbidden", message: "Admin access required" },
      { status: 403 },
    );
  }

  return claims;
}

export async function resolveOptionalProjectScope(
  request: NextRequest,
  claims: Claims,
): Promise<string | null | NextResponse> {
  const projectIdentifier = request.nextUrl.searchParams.get("project_id");
  if (!projectIdentifier) return null;

  const resolved = await resolveOwnedProjectId(projectIdentifier, claims.sub);
  if (!resolved) {
    return NextResponse.json(
      { error: "Not Found", message: "Project not found" },
      { status: 404 },
    );
  }
  return resolved;
}

export async function resolveRequiredProjectScope(
  request: NextRequest,
  claims: Claims,
): Promise<string | NextResponse> {
  const projectIdentifier = request.nextUrl.searchParams.get("project_id");
  if (!projectIdentifier) {
    return NextResponse.json(
      { error: "Bad Request", message: "project_id is required" },
      { status: 400 },
    );
  }

  const resolved = await resolveOwnedProjectId(projectIdentifier, claims.sub);
  if (!resolved) {
    return NextResponse.json(
      { error: "Not Found", message: "Project not found" },
      { status: 404 },
    );
  }
  return resolved;
}

