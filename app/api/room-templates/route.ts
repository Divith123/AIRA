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
    description: string | null;
    config: string;
    is_default: boolean;
    created_at: string | Date | null;
  }>(
    `
      SELECT id, name, description, config, is_default, created_at
      FROM room_templates
      ORDER BY created_at DESC NULLS LAST
    `,
  );

  return NextResponse.json(
    rows.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      config: row.config,
      is_default: row.is_default,
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
    description: string | null;
    config: string;
    is_default: boolean;
    created_at: string | Date | null;
  }>(
    `
      INSERT INTO room_templates (id, name, description, config, is_default, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, name, description, config, is_default, created_at
    `,
    [
      randomUUID(),
      String(payload.name || ""),
      payload.description ? String(payload.description) : null,
      JSON.stringify(payload.config || {}),
      payload.is_default === true,
    ],
  );
  const row = created.rows[0];
  return NextResponse.json(
    {
      id: row.id,
      name: row.name,
      description: row.description,
      config: row.config,
      is_default: row.is_default,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : "",
    },
    { status: 201 },
  );
}

