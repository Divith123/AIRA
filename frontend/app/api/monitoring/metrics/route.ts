import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/guards";

export async function GET(request: NextRequest) {
  const claims = requireAuth(request);
  if (claims instanceof NextResponse) return claims;

  const hours = Math.max(
    1,
    Math.min(
      24 * 30,
      Number.parseInt(request.nextUrl.searchParams.get("hours") || "24", 10) || 24,
    ),
  );
  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const rows = await query<{
    metric_name: string;
    metric_value: number | null;
    timestamp: string | Date;
  }>(
    `
      SELECT metric_name, metric_value, timestamp
      FROM metrics
      WHERE timestamp >= $1::timestamptz
      ORDER BY timestamp DESC
      LIMIT 1000
    `,
    [startTime],
  );

  return NextResponse.json(
    rows.rows.map((row) => ({
      metric_name: row.metric_name,
      metric_value: row.metric_value || 0,
      timestamp: new Date(row.timestamp).toISOString(),
    })),
  );
}

