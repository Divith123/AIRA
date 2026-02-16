import { NextResponse, type NextRequest } from "next/server";
import { mapAgentRow } from "@/lib/server/agent-utils";
import { query } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/guards";

type RouteContext = {
  params: Promise<{ agentId: string }> | { agentId: string };
};

function resolveParams(params: RouteContext["params"]) {
  if ("then" in params) return params;
  return Promise.resolve(params);
}

export async function GET(request: NextRequest, context: RouteContext) {
  const claims = requireAuth(request, { admin: true });
  if (claims instanceof NextResponse) return claims;
  const { agentId } = await resolveParams(context.params);

  const result = await query<{
    id: string;
    agent_id: string;
    display_name: string;
    image: string;
    entrypoint: string | null;
    env_vars: string | null;
    livekit_permissions: string | null;
    default_room_behavior: string | null;
    auto_restart_policy: string | null;
    resource_limits: string | null;
    is_enabled: boolean;
    created_at: string | Date;
    updated_at: string | Date;
  }>(
    `
      SELECT
        a.id,
        a.agent_id,
        a.display_name,
        a.image,
        a.entrypoint,
        a.env_vars,
        a.livekit_permissions,
        a.default_room_behavior,
        a.auto_restart_policy,
        a.resource_limits,
        a.is_enabled,
        a.created_at,
        a.updated_at
      FROM agents a
      JOIN projects p ON p.id = a.project_id
      WHERE a.agent_id = $1
        AND p.user_id = $2
      LIMIT 1
    `,
    [agentId, claims.sub],
  );

  const row = result.rows[0];
  if (!row) return NextResponse.json({ error: "Not Found" }, { status: 404 });
  return NextResponse.json(mapAgentRow(row));
}

