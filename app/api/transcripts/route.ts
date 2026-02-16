import { randomUUID } from "node:crypto";
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

  const page = Math.max(
    1,
    Number.parseInt(request.nextUrl.searchParams.get("page") || "1", 10) || 1,
  );
  const limit = Math.max(
    1,
    Math.min(
      500,
      Number.parseInt(request.nextUrl.searchParams.get("limit") || "100", 10) || 100,
    ),
  );
  const sessionId = request.nextUrl.searchParams.get("session_id");
  const roomName = request.nextUrl.searchParams.get("room_name");
  const projectId = request.nextUrl.searchParams.get("project_id");

  const where: string[] = [];
  const values: unknown[] = [];

  if (sessionId) {
    values.push(sessionId);
    where.push(`session_id = $${values.length}`);
  }
  if (roomName) {
    values.push(roomName);
    where.push(`room_name = $${values.length}`);
  }
  if (projectId) {
    values.push(projectId);
    where.push(`project_id = $${values.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const offset = (page - 1) * limit;
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
      ${whereSql}
      ORDER BY timestamp ASC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `,
    [...values, limit, offset],
  );

  return NextResponse.json(rows.rows.map(mapTranscript));
}

export async function POST(request: NextRequest) {
  const claims = requireAuth(request);
  if (claims instanceof NextResponse) return claims;
  const payload = (await request.json()) as Record<string, unknown>;

  const sessionId = String(payload.session_id || payload.room_sid || "").trim();
  const roomName = String(payload.room_name || "").trim();
  const text = String(payload.text || payload.content || "").trim();
  if (!sessionId || !roomName || !text) {
    return NextResponse.json(
      { error: "session_id/room_sid, room_name and text/content are required" },
      { status: 400 },
    );
  }

  const id = randomUUID();
  await query(
    `
      INSERT INTO sessions (
        sid,
        room_name,
        status,
        start_time,
        project_id
      )
      VALUES ($1, $2, 'active', NOW(), $3)
      ON CONFLICT (sid) DO NOTHING
    `,
    [
      sessionId,
      roomName,
      payload.project_id ? String(payload.project_id) : null,
    ],
  );

  await query(
    `
      INSERT INTO transcripts (
        id, session_id, room_name, participant_identity, text, timestamp, language, is_final, project_id
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8)
    `,
    [
      id,
      sessionId,
      roomName,
      payload.participant_identity ? String(payload.participant_identity) : null,
      text,
      payload.language ? String(payload.language) : "en",
      payload.is_final !== false,
      payload.project_id ? String(payload.project_id) : null,
    ],
  );

  return NextResponse.json(
    {
      id,
      created_at: new Date().toISOString(),
    },
    { status: 201 },
  );
}
