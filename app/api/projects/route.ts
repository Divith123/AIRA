import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/guards";

function shortProjectId() {
  return randomUUID().replace(/-/g, "").slice(0, 8);
}

function mapProject(row: {
  id: string;
  short_id: string | null;
  user_id: string | null;
  name: string;
  description: string | null;
  status: string | null;
  created_at: string | Date | null;
  updated_at: string | Date | null;
}) {
  return {
    id: row.id,
    short_id: row.short_id,
    user_id: row.user_id,
    name: row.name,
    description: row.description,
    status: row.status || "active",
    created_at: row.created_at ? new Date(row.created_at).toISOString() : "",
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : "",
  };
}

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const result = await query<{
    id: string;
    short_id: string | null;
    user_id: string | null;
    name: string;
    description: string | null;
    status: string | null;
    created_at: string | Date | null;
    updated_at: string | Date | null;
  }>(
    `
      SELECT id, short_id, user_id, name, description, status, created_at, updated_at
      FROM projects
      WHERE user_id = $1
      ORDER BY created_at DESC NULLS LAST
    `,
    [auth.sub],
  );

  return NextResponse.json(result.rows.map(mapProject));
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const payload = (await request.json()) as {
    name?: string;
    description?: string;
  };
  const name = (payload.name || "").trim();
  if (!name) {
    return NextResponse.json(
      { error: "Validation failed", message: "Project name is required" },
      { status: 400 },
    );
  }

  const id = randomUUID();
  const shortId = shortProjectId();

  const created = await query<{
    id: string;
    short_id: string | null;
    user_id: string | null;
    name: string;
    description: string | null;
    status: string | null;
    created_at: string | Date | null;
    updated_at: string | Date | null;
  }>(
    `
      INSERT INTO projects (id, short_id, user_id, name, description, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, 'active', NOW(), NOW())
      RETURNING id, short_id, user_id, name, description, status, created_at, updated_at
    `,
    [id, shortId, auth.sub, name, payload.description?.trim() || null],
  );

  await query(
    `
      INSERT INTO project_ai_configs (
        project_id,
        stt_mode,
        stt_provider,
        tts_mode,
        tts_provider,
        llm_mode,
        llm_provider
      ) VALUES ($1, 'cloud', 'google', 'cloud', 'google', 'cloud', 'openai')
      ON CONFLICT (project_id) DO NOTHING
    `,
    [id],
  );

  return NextResponse.json(mapProject(created.rows[0]), { status: 201 });
}

