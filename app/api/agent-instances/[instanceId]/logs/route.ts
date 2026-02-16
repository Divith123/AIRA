import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/guards";

type RouteContext = {
  params: Promise<{ instanceId: string }> | { instanceId: string };
};

function resolveParams(params: RouteContext["params"]) {
  if ("then" in params) return params;
  return Promise.resolve(params);
}

export async function GET(request: NextRequest, context: RouteContext) {
  const claims = requireAuth(request, { admin: true });
  if (claims instanceof NextResponse) return claims;
  const { instanceId } = await resolveParams(context.params);

  const instance = await query<{ id: string }>(
    `
      SELECT ai.id
      FROM agent_instances ai
      JOIN agents a ON a.id = ai.agent_id
      JOIN projects p ON p.id = a.project_id
      WHERE ai.instance_id = $1
        AND p.user_id = $2
      LIMIT 1
    `,
    [instanceId, claims.sub],
  );
  const instanceDbId = instance.rows[0]?.id;
  if (!instanceDbId) return NextResponse.json({ error: "Not Found" }, { status: 404 });

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

  const logs = await query<{
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
      WHERE instance_id = $1
      ORDER BY timestamp DESC
      LIMIT $2
      OFFSET $3
    `,
    [instanceDbId, limit, offset],
  );

  return NextResponse.json(
    logs.rows.map((row: {
      id: string;
      agent_id: string;
      instance_id: string;
      log_level: string;
      message: string;
      timestamp: string | Date | null;
    }) => ({
      id: row.id,
      agent_id: row.agent_id,
      instance_id: row.instance_id,
      log_level: row.log_level,
      message: row.message,
      timestamp: row.timestamp ? new Date(row.timestamp).toISOString() : "",
    })),
  );
}
