import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/guards";
import { resolveOwnedProjectId } from "@/lib/server/project";

type RouteContext = {
  params: Promise<{ projectId: string }> | { projectId: string };
};

function resolveParams(params: RouteContext["params"]) {
  if ("then" in params) return params;
  return Promise.resolve(params);
}

export async function GET(request: NextRequest, context: RouteContext) {
  const claims = requireAuth(request, { admin: true });
  if (claims instanceof NextResponse) return claims;

  const { projectId } = await resolveParams(context.params);
  const resolvedProjectId = await resolveOwnedProjectId(projectId, claims.sub);
  if (!resolvedProjectId) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const agents = await query<{ id: string }>(
    "SELECT id FROM agents WHERE project_id = $1",
    [resolvedProjectId],
  );
  const agentIds = agents.rows.map((row) => row.id);
  if (!agentIds.length) {
    return NextResponse.json({
      active_sessions: 0,
      total_minutes: 0,
      quota_minutes: -1,
    });
  }

  const active = await query<{ count: string }>(
    `
      SELECT COUNT(*)::text AS count
      FROM agent_instances
      WHERE status = 'running'
        AND agent_id = ANY($1::text[])
    `,
    [agentIds],
  );
  const total = await query<{ total_minutes: string }>(
    `
      SELECT
        COALESCE(
          SUM(
            EXTRACT(
              EPOCH FROM (
                COALESCE(stopped_at, started_at) - started_at
              )
            ) / 60
          ),
          0
        )::text AS total_minutes
      FROM agent_instances
      WHERE agent_id = ANY($1::text[])
        AND started_at IS NOT NULL
    `,
    [agentIds],
  );

  return NextResponse.json({
    active_sessions: Number(active.rows[0]?.count || 0),
    total_minutes: Math.max(0, Math.floor(Number(total.rows[0]?.total_minutes || 0))),
    quota_minutes: -1,
  });
}

