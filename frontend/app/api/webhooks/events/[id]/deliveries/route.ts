import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/guards";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

function resolveParams(params: RouteContext["params"]) {
  if ("then" in params) return params;
  return Promise.resolve(params);
}

export async function GET(request: NextRequest, context: RouteContext) {
  const claims = requireAuth(request);
  if (claims instanceof NextResponse) return claims;
  const { id } = await resolveParams(context.params);

  const event = await query<{ id: string }>(
    "SELECT id FROM webhook_events WHERE id = $1 LIMIT 1",
    [id],
  );
  if (!event.rows[0]) return NextResponse.json({ error: "Not Found" }, { status: 404 });

  const rows = await query<{
    id: string;
    event_id: string;
    url: string;
    status_code: number | null;
    response_body: string | null;
    error_message: string | null;
    attempted_at: string | Date;
    success: boolean;
  }>(
    `
      SELECT
        id, event_id, url, status_code, response_body, error_message, attempted_at, success
      FROM webhook_deliveries
      WHERE event_id = $1
      ORDER BY attempted_at DESC
    `,
    [id],
  );

  return NextResponse.json({
    event_id: id,
    deliveries: rows.rows.map((row) => ({
      id: row.id,
      event_id: row.event_id,
      url: row.url,
      status_code: row.status_code,
      response_body: row.response_body,
      error_message: row.error_message,
      attempted_at: new Date(row.attempted_at).toISOString(),
      success: row.success,
    })),
  });
}

