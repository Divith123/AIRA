import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/guards";

export async function GET(request: NextRequest) {
  const claims = requireAuth(request);
  if (claims instanceof NextResponse) return claims;

  const rows = await query<{
    id: string;
    region_name: string;
    region_code: string;
    livekit_url: string | null;
    is_default: boolean;
    created_at: string | Date | null;
  }>(
    `
      SELECT id, region_name, region_code, livekit_url, is_default, created_at
      FROM regions
      ORDER BY created_at DESC NULLS LAST
    `,
  );
  return NextResponse.json(
    rows.rows.map((row) => ({
      id: row.id,
      region_name: row.region_name,
      region_code: row.region_code,
      livekit_url: row.livekit_url,
      is_default: row.is_default,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : "",
    })),
  );
}

export async function POST(request: NextRequest) {
  const claims = requireAuth(request);
  if (claims instanceof NextResponse) return claims;
  const payload = (await request.json()) as Record<string, unknown>;
  const regionName = String(payload.region_name || "").trim();
  const regionCode = String(payload.region_code || "").trim().toUpperCase();
  if (!regionName || !regionCode) {
    return NextResponse.json(
      { error: "region_name and region_code are required" },
      { status: 400 },
    );
  }

  const existing = await query<{ id: string }>(
    "SELECT id FROM regions WHERE region_code = $1 LIMIT 1",
    [regionCode],
  );
  if (existing.rowCount) {
    return NextResponse.json(
      { error: "Conflict", message: "region_code already exists" },
      { status: 409 },
    );
  }

  const isDefault = payload.is_default === true;
  if (isDefault) {
    await query("UPDATE regions SET is_default = false WHERE is_default = true");
  }

  const created = await query<{
    id: string;
    region_name: string;
    region_code: string;
    livekit_url: string | null;
    is_default: boolean;
    created_at: string | Date | null;
  }>(
    `
      INSERT INTO regions (
        id, region_name, region_code, livekit_url, is_default, created_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, region_name, region_code, livekit_url, is_default, created_at
    `,
    [
      randomUUID(),
      regionName,
      regionCode,
      payload.livekit_url ? String(payload.livekit_url) : null,
      isDefault,
    ],
  );

  const row = created.rows[0];
  return NextResponse.json(
    {
      id: row.id,
      region_name: row.region_name,
      region_code: row.region_code,
      livekit_url: row.livekit_url,
      is_default: row.is_default,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : "",
    },
    { status: 201 },
  );
}
