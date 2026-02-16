import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/guards";

export async function GET(request: NextRequest) {
  const claims = requireAuth(request, { admin: true });
  if (claims instanceof NextResponse) return claims;

  const page = Math.max(
    1,
    Number.parseInt(request.nextUrl.searchParams.get("page") || "1", 10) || 1,
  );
  const limit = Math.max(
    1,
    Math.min(
      500,
      Number.parseInt(request.nextUrl.searchParams.get("limit") || "50", 10) || 50,
    ),
  );
  const projectId = request.nextUrl.searchParams.get("project_id");
  const action = request.nextUrl.searchParams.get("action");
  const targetType = request.nextUrl.searchParams.get("target_type");

  const where: string[] = [];
  const values: unknown[] = [];
  if (projectId) {
    values.push(projectId);
    where.push(`project_id = $${values.length}`);
  }
  if (action) {
    values.push(action);
    where.push(`action = $${values.length}`);
  }
  if (targetType) {
    values.push(targetType);
    where.push(`target_type = $${values.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const offset = (page - 1) * limit;

  const rows = await query<{
    id: string;
    timestamp: string | Date;
    action: string;
    actor_id: string | null;
    actor_email: string | null;
    target_type: string | null;
    target_id: string | null;
    metadata: string | null;
    ip_address: string | null;
    project_id: string | null;
  }>(
    `
      SELECT
        id, timestamp, action, actor_id, actor_email, target_type,
        target_id, metadata, ip_address, project_id
      FROM audit_logs
      ${whereSql}
      ORDER BY timestamp DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `,
    [...values, limit, offset],
  );

  return NextResponse.json(
    rows.rows.map((row) => ({
      id: row.id,
      timestamp: new Date(row.timestamp).toISOString(),
      action: row.action,
      actor_id: row.actor_id,
      actor_email: row.actor_email,
      target_type: row.target_type,
      target_id: row.target_id,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
      ip_address: row.ip_address,
      project_id: row.project_id,
    })),
  );
}

