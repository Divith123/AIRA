import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/guards";

export async function GET(request: NextRequest) {
  const claims = requireAuth(request);
  if (claims instanceof NextResponse) return claims;

  const rows = await query<{
    id: string;
    name: string;
    room_pattern: string | null;
    egress_type: string;
    is_active: boolean;
    created_at: string | Date | null;
  }>(
    `
      SELECT id, name, room_pattern, egress_type, is_active, created_at
      FROM auto_recording_rules
      ORDER BY created_at DESC NULLS LAST
    `,
  );

  return NextResponse.json(
    rows.rows.map((row) => ({
      id: row.id,
      name: row.name,
      room_pattern: row.room_pattern,
      egress_type: row.egress_type,
      is_active: row.is_active,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : "",
    })),
  );
}

export async function POST(request: NextRequest) {
  const claims = requireAuth(request);
  if (claims instanceof NextResponse) return claims;
  const payload = (await request.json()) as Record<string, unknown>;

  const created = await query<{
    id: string;
    name: string;
    room_pattern: string | null;
    egress_type: string;
    is_active: boolean;
    created_at: string | Date | null;
  }>(
    `
      INSERT INTO auto_recording_rules (id, name, room_pattern, egress_type, is_active, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, name, room_pattern, egress_type, is_active, created_at
    `,
    [
      randomUUID(),
      String(payload.name || ""),
      payload.room_pattern ? String(payload.room_pattern) : null,
      String(payload.egress_type || "room_composite"),
      payload.is_active !== false,
    ],
  );

  const row = created.rows[0];
  return NextResponse.json(
    {
      id: row.id,
      name: row.name,
      room_pattern: row.room_pattern,
      egress_type: row.egress_type,
      is_active: row.is_active,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : "",
    },
    { status: 201 },
  );
}

