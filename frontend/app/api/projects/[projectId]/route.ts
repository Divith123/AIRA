import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/guards";

type RouteContext = {
  params: Promise<{ projectId: string }> | { projectId: string };
};

function resolveParams(params: RouteContext["params"]) {
  if ("then" in params) return params;
  return Promise.resolve(params);
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

async function resolveOwnedProject(identifier: string, userId: string) {
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
        AND (id = $2 OR short_id = $2)
      LIMIT 1
    `,
    [userId, identifier],
  );
  return result.rows[0] || null;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  const { projectId } = await resolveParams(context.params);

  const project = await resolveOwnedProject(projectId, auth.sub);
  if (!project) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  return NextResponse.json(mapProject(project));
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  const { projectId } = await resolveParams(context.params);

  const project = await resolveOwnedProject(projectId, auth.sub);
  if (!project) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const payload = (await request.json()) as {
    name?: string;
    description?: string;
    status?: string;
  };

  const updated = await query<{
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
      UPDATE projects
      SET
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        status = COALESCE($4, status),
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, short_id, user_id, name, description, status, created_at, updated_at
    `,
    [
      project.id,
      payload.name?.trim() || null,
      payload.description !== undefined ? payload.description?.trim() || null : null,
      payload.status?.trim() || null,
    ],
  );

  return NextResponse.json(mapProject(updated.rows[0]));
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  const { projectId } = await resolveParams(context.params);

  const project = await resolveOwnedProject(projectId, auth.sub);
  if (!project) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  await query("DELETE FROM projects WHERE id = $1", [project.id]);
  return new NextResponse(null, { status: 204 });
}
