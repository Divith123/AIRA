import { NextResponse, type NextRequest } from "next/server";
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

  const agent = await query<{ id: string }>(
    `
      SELECT a.id
      FROM agents a
      JOIN projects p ON p.id = a.project_id
      WHERE a.agent_id = $1
        AND p.user_id = $2
      LIMIT 1
    `,
    [agentId, claims.sub],
  );
  const agentDbId = agent.rows[0]?.id;
  if (!agentDbId) return NextResponse.json({ error: "Not Found" }, { status: 404 });

  const [instances, latency, cpu, memory] = await Promise.all([
    query<{ total: string; running: string; succeeded: string }>(
      `
        SELECT
          COUNT(*)::text AS total,
          COUNT(*) FILTER (WHERE status = 'running')::text AS running,
          COUNT(*) FILTER (WHERE status <> 'crashed')::text AS succeeded
        FROM agent_instances
        WHERE agent_id = $1
      `,
      [agentDbId],
    ),
    query<{ avg_latency: string }>(
      `
        SELECT COALESCE(AVG(metric_value), 0)::text AS avg_latency
        FROM agent_metrics
        WHERE agent_id = $1
          AND metric_name = 'latency_ms'
      `,
      [agentDbId],
    ),
    query<{ value: string }>(
      `
        SELECT COALESCE(metric_value, 0)::text AS value
        FROM agent_metrics
        WHERE agent_id = $1
          AND metric_name = 'cpu_percent'
        ORDER BY timestamp DESC
        LIMIT 1
      `,
      [agentDbId],
    ),
    query<{ value: string }>(
      `
        SELECT COALESCE(metric_value, 0)::text AS value
        FROM agent_metrics
        WHERE agent_id = $1
          AND metric_name = 'memory_usage_mb'
        ORDER BY timestamp DESC
        LIMIT 1
      `,
      [agentDbId],
    ),
  ]);

  const total = Number(instances.rows[0]?.total || 0);
  const running = Number(instances.rows[0]?.running || 0);
  const succeeded = Number(instances.rows[0]?.succeeded || 0);
  const uptimePercent = total ? (running / total) * 100 : 0;
  const successRate = total ? (succeeded / total) * 100 : 100;

  return NextResponse.json({
    total_sessions: total,
    avg_latency_ms: Number(latency.rows[0]?.avg_latency || 0),
    uptime_percent: uptimePercent,
    success_rate_percent: successRate,
    cpu_usage: Number(cpu.rows[0]?.value || 0),
    memory_usage: Number(memory.rows[0]?.value || 0),
  });
}

