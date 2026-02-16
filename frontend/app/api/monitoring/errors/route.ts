import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/guards";

export async function GET(request: NextRequest) {
  const claims = requireAuth(request);
  if (claims instanceof NextResponse) return claims;

  const unresolvedOnly = request.nextUrl.searchParams.get("unresolved_only") === "true";
  const rows = await query<{
    id: string;
    error_type: string;
    message: string;
    is_resolved: boolean;
    created_at: string | Date;
  }>(
    `
      SELECT id, error_type, message, is_resolved, created_at
      FROM error_logs
      ${unresolvedOnly ? "WHERE is_resolved = false" : ""}
      ORDER BY created_at DESC
      LIMIT 1000
    `,
  );

  return NextResponse.json(
    rows.rows.map((row) => ({
      id: row.id,
      error_type: row.error_type,
      message: row.message,
      is_resolved: row.is_resolved,
      created_at: new Date(row.created_at).toISOString(),
    })),
  );
}

