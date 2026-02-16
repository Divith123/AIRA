import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/guards";
import { resolveOwnedProjectId } from "@/lib/server/project";
import { parseRangeToHours } from "@/lib/server/session-utils";

type RouteContext = {
  params: Promise<{ projectId: string }> | { projectId: string };
};

function resolveParams(params: RouteContext["params"]) {
  if ("then" in params) return params;
  return Promise.resolve(params);
}

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  const { projectId } = await resolveParams(context.params);

  const resolvedProjectId = await resolveOwnedProjectId(projectId, auth.sub);
  if (!resolvedProjectId) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const range = request.nextUrl.searchParams.get("range");
  const hours = parseRangeToHours(range);
  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const totals = await query<{ total_rooms: string; unique_participants: string }>(
    `
      SELECT
        COUNT(*)::text AS total_rooms,
        COALESCE(SUM(total_participants), 0)::text AS unique_participants
      FROM sessions
      WHERE project_id = $1
        AND start_time >= $2::timestamptz
    `,
    [resolvedProjectId, startTime],
  );

  const timelineRows = await query<{
    bucket: string | Date;
    rooms: number;
    participants: number;
  }>(
    `
      SELECT
        date_trunc('hour', start_time) AS bucket,
        COUNT(*)::int AS rooms,
        COALESCE(SUM(total_participants), 0)::int AS participants
      FROM sessions
      WHERE project_id = $1
        AND start_time >= $2::timestamptz
      GROUP BY bucket
      ORDER BY bucket ASC
    `,
    [resolvedProjectId, startTime],
  );

  return NextResponse.json({
    unique_participants: Number(totals.rows[0]?.unique_participants || 0),
    total_rooms: Number(totals.rows[0]?.total_rooms || 0),
    timeseries: timelineRows.rows.map((row) => ({
      timestamp: new Date(row.bucket).toISOString().slice(0, 16).replace("T", " "),
      rooms: row.rooms || 0,
      participants: row.participants || 0,
    })),
  });
}

