import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/guards";
import {
  parseRangeToHours,
  resolveSessionScopeProjectIds,
} from "@/lib/server/session-utils";

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const range = request.nextUrl.searchParams.get("range");
  const projectIdentifier = request.nextUrl.searchParams.get("project_id");
  const scopeProjectIds = await resolveSessionScopeProjectIds(auth.sub, projectIdentifier);

  if (scopeProjectIds === null) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }
  if (scopeProjectIds.length === 0) {
    return NextResponse.json({
      unique_participants: 0,
      total_rooms: 0,
      timeseries: [],
    });
  }

  const hours = parseRangeToHours(range);
  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const totals = await query<{ total_rooms: string; unique_participants: string }>(
    `
      SELECT
        COUNT(*)::text AS total_rooms,
        COALESCE(SUM(total_participants), 0)::text AS unique_participants
      FROM sessions
      WHERE project_id = ANY($1::text[])
        AND start_time >= $2::timestamptz
    `,
    [scopeProjectIds, startTime],
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
      WHERE project_id = ANY($1::text[])
        AND start_time >= $2::timestamptz
      GROUP BY bucket
      ORDER BY bucket ASC
    `,
    [scopeProjectIds, startTime],
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

