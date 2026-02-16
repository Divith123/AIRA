import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/guards";

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

export async function GET(request: NextRequest) {
  const claims = requireAuth(request);
  if (claims instanceof NextResponse) return claims;

  const q = (request.nextUrl.searchParams.get("q") || "").trim();
  if (!q) {
    return NextResponse.json({ results: [], query: q });
  }

  const roomSid = request.nextUrl.searchParams.get("room_sid");
  const speakerType = request.nextUrl.searchParams.get("speaker_type");
  const limit = Math.max(
    1,
    Math.min(
      200,
      Number.parseInt(request.nextUrl.searchParams.get("limit") || "50", 10) || 50,
    ),
  );

  const where = ["text ILIKE $1"];
  const values: unknown[] = [`%${q}%`];

  if (roomSid) {
    values.push(roomSid);
    where.push(`session_id = $${values.length}`);
  }
  if (speakerType) {
    values.push(speakerType);
    where.push(`participant_identity = $${values.length}`);
  }

  const rows = await query<{
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
      WHERE ${where.join(" AND ")}
      ORDER BY timestamp DESC
      LIMIT $${values.length + 1}
    `,
    [...values, limit],
  );

  return NextResponse.json({
    results: rows.rows.map(mapTranscript),
    query: q,
  });
}

