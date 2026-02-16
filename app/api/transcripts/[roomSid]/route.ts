import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/guards";

type RouteContext = {
  params: Promise<{ roomSid: string }> | { roomSid: string };
};

function resolveParams(params: RouteContext["params"]) {
  if ("then" in params) return params;
  return Promise.resolve(params);
}

function mapTranscript(row: {
  id: string;
  session_id: string;
  room_name: string;
  participant_identity: string | null;
  text: string;
  timestamp: string | Date;
  language: string | null;
  is_final: boolean;
  project_id: string | null;
}) {
  return {
    id: row.id,
    session_id: row.session_id,
    room_name: row.room_name,
    participant_identity: row.participant_identity,
    text: row.text,
    timestamp: new Date(row.timestamp).toISOString(),
    language: row.language || "en",
    is_final: row.is_final,
    project_id: row.project_id,
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  const claims = requireAuth(request);
  if (claims instanceof NextResponse) return claims;
  const { roomSid } = await resolveParams(context.params);

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

  const [rows, total] = await Promise.all([
    query<{
      id: string;
      session_id: string;
      room_name: string;
      participant_identity: string | null;
      text: string;
      timestamp: string | Date;
      language: string | null;
      is_final: boolean;
      project_id: string | null;
    }>(
      `
        SELECT
          id, session_id, room_name, participant_identity, text, timestamp, language, is_final, project_id
        FROM transcripts
        WHERE session_id = $1
        ORDER BY timestamp ASC
        LIMIT $2
        OFFSET $3
      `,
      [roomSid, limit, offset],
    ),
    query<{ total: string }>(
      "SELECT COUNT(*)::text AS total FROM transcripts WHERE session_id = $1",
      [roomSid],
    ),
  ]);

  return NextResponse.json({
    transcripts: rows.rows.map(mapTranscript),
    total: Number(total.rows[0]?.total || 0),
    room_sid: roomSid,
  });
}

