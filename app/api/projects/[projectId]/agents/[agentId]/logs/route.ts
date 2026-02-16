import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/guards";
import { resolveOwnedProjectId } from "@/lib/server/project";

type RouteContext = {
  params:
    | Promise<{ projectId: string; agentId: string }>
    | { projectId: string; agentId: string };
};

function resolveParams(params: RouteContext["params"]) {
  if ("then" in params) return params;
  return Promise.resolve(params);
}

export async function GET(request: NextRequest, context: RouteContext) {
  const claims = requireAuth(request, { admin: true });
  if (claims instanceof NextResponse) return claims;

  const { projectId, agentId } = await resolveParams(context.params);
  const resolvedProjectId = await resolveOwnedProjectId(projectId, claims.sub);
  if (!resolvedProjectId) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const agent = await query<{ id: string }>(
    "SELECT id FROM agents WHERE project_id = $1 AND agent_id = $2 LIMIT 1",
    [resolvedProjectId, agentId],
  );
  const agentDbId = agent.rows[0]?.id;
  if (!agentDbId) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const limit = Math.max(
    1,
    Math.min(
      500,
      Number.parseInt(request.nextUrl.searchParams.get("limit") || "100", 10) || 100,
    ),
  );
  const offset = Math.max(
    0,
    Number.parseInt(request.nextUrl.searchParams.get("offset") || "0", 10) || 0,
  );

  const rows = await query<{
    id: string;
    agent_id: string;
    instance_id: string;
    log_level: string;
    message: string;
    timestamp: string | Date | null;
  }>(
    `
      SELECT id, agent_id, instance_id, log_level, message, timestamp
      FROM agent_logs
      WHERE agent_id = $1
      ORDER BY timestamp DESC
      LIMIT $2
      OFFSET $3
    `,
    [agentDbId, limit, offset],
  );

  return NextResponse.json(
    rows.rows.map((row) => ({
      id: row.id,
      agent_id: row.agent_id,
      instance_id: row.instance_id,
      log_level: row.log_level,
      message: row.message,
      timestamp: row.timestamp ? new Date(row.timestamp).toISOString() : "",
    })),
  );
}

