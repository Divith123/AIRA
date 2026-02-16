import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/guards";
import { resolveOwnedProjectId } from "@/lib/server/project";

export async function GET(request: NextRequest) {
  const claims = requireAuth(request, { admin: true });
  if (claims instanceof NextResponse) return claims;

  const projectIdentifier = request.nextUrl.searchParams.get("project_id");
  let whereSql = "";
  let values: unknown[] = [claims.sub];

  if (projectIdentifier) {
    const projectId = await resolveOwnedProjectId(projectIdentifier, claims.sub);
    if (!projectId) return NextResponse.json({ error: "Not Found" }, { status: 404 });
    whereSql = "AND p.id = $2";
    values = [claims.sub, projectId];
  }

  const rows = await query<{
    id: string;
    instance_id: string;
    agent_id: string;
    status: string;
    container_id: string | null;
    process_pid: number | null;
    last_heartbeat: string | Date | null;
    exit_code: number | null;
    crash_reason: string | null;
    started_at: string | Date | null;
    stopped_at: string | Date | null;
  }>(
    `
      SELECT
        ai.id,
        ai.instance_id,
        ai.agent_id,
        ai.status,
        ai.container_id,
        ai.process_pid,
        ai.last_heartbeat,
        ai.exit_code,
        ai.crash_reason,
        ai.started_at,
        ai.stopped_at
      FROM agent_instances ai
      JOIN agents a ON a.id = ai.agent_id
      JOIN projects p ON p.id = a.project_id
      WHERE p.user_id = $1
      ${whereSql}
      ORDER BY ai.created_at DESC
    `,
    values,
  );

  return NextResponse.json(
    rows.rows.map((row) => ({
      id: row.id,
      instance_id: row.instance_id,
      agent_id: row.agent_id,
      status: row.status,
      container_id: row.container_id,
      process_pid: row.process_pid,
      last_heartbeat: row.last_heartbeat ? new Date(row.last_heartbeat).toISOString() : null,
      exit_code: row.exit_code,
      crash_reason: row.crash_reason,
      started_at: row.started_at ? new Date(row.started_at).toISOString() : null,
      stopped_at: row.stopped_at ? new Date(row.stopped_at).toISOString() : null,
    })),
  );
}

