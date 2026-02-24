import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { hashPassword } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { serverEnv } from "@/lib/server/env";
import { requireAuth } from "@/lib/server/guards";
import { resolveOwnedProjectId } from "@/lib/server/project";

type Claims = {
  sub: string;
  email: string;
  name: string;
  is_admin: boolean;
};

type RouteContext = {
  params: Promise<{ slug: string[] }> | { slug: string[] };
};

const AVAILABLE_PERMISSIONS = [
  "project.read",
  "project.write",
  "project.create",
  "project.delete",
  "agent.read",
  "agent.write",
  "agent.deploy",
  "room.read",
  "room.create",
  "room.record",
  "sip.read",
  "sip.write",
  "settings.read",
  "settings.write",
  "analytics.read",
];

function resolveParams(params: RouteContext["params"]) {
  if ("then" in params) return params;
  return Promise.resolve(params);
}

async function requireAdmin(request: NextRequest): Promise<Claims | NextResponse> {
  const claims = requireAuth(request, { admin: true });
  if (claims instanceof NextResponse) return claims;
  return claims;
}

async function resolveProjectFromQuery(request: NextRequest, claims: Claims) {
  const identifier = request.nextUrl.searchParams.get("project_id");
  if (!identifier) return null;
  const projectId = await resolveOwnedProjectId(identifier, claims.sub);
  if (!projectId) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }
  return projectId;
}

async function resolveProjectFromPayload(payload: Record<string, unknown>, claims: Claims) {
  const identifier =
    payload.project_id !== undefined && payload.project_id !== null
      ? String(payload.project_id)
      : null;
  if (!identifier) return null;
  const projectId = await resolveOwnedProjectId(identifier, claims.sub);
  if (!projectId) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }
  return projectId;
}

function parsePermissions(value: string | null) {
  if (!value) return [] as string[];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) return parsed.map((item) => String(item));
  } catch {
    // Ignore malformed permission payloads.
  }
  return [] as string[];
}

export async function GET(request: NextRequest, context: RouteContext) {
  const claims = await requireAdmin(request);
  if (claims instanceof NextResponse) return claims;
  const { slug } = await resolveParams(context.params);

  if (slug.length === 1 && slug[0] === "roles") {
    const roles = await query<{
      id: string;
      name: string;
      description: string | null;
      permissions: string | null;
      is_system: boolean;
    }>("SELECT id, name, description, permissions, is_system FROM roles ORDER BY name ASC");

    return NextResponse.json(
      roles.rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description || "",
        permissions: parsePermissions(row.permissions),
        is_system: row.is_system,
      })),
    );
  }

  if (slug.length === 3 && slug[0] === "roles" && slug[2] === "permissions") {
    const roleId = slug[1];
    const roleResult = await query<{
      id: string;
      name: string;
      description: string | null;
      permissions: string | null;
      is_system: boolean;
    }>(
      "SELECT id, name, description, permissions, is_system FROM roles WHERE id = $1 LIMIT 1",
      [roleId],
    );
    const role = roleResult.rows[0];
    if (!role) return NextResponse.json({ error: "Not Found" }, { status: 404 });
    const assigned = parsePermissions(role.permissions);
    return NextResponse.json({
      role: {
        id: role.id,
        name: role.name,
        description: role.description || "",
        permissions: assigned,
        is_system: role.is_system,
      },
      assigned_permissions: assigned,
      available_permissions: AVAILABLE_PERMISSIONS,
    });
  }

  if (slug.length === 1 && slug[0] === "service-accounts") {
    const rows = await query<{
      id: string;
      name: string;
      client_id: string;
      permissions: string | null;
      is_active: boolean;
      created_at: string | Date | null;
    }>(
      `
        SELECT id, name, client_id, permissions, is_active, created_at
        FROM service_accounts
        ORDER BY created_at DESC NULLS LAST
      `,
    );
    return NextResponse.json(
      rows.rows.map((row) => ({
        id: row.id,
        name: row.name,
        client_id: row.client_id,
        permissions: parsePermissions(row.permissions),
        is_active: row.is_active,
        created_at: row.created_at ? new Date(row.created_at).toISOString() : "",
      })),
    );
  }

  if (slug.length === 1 && slug[0] === "storage") {
    const rows = await query<{
      id: string;
      name: string;
      storage_type: string;
      bucket: string;
      region: string | null;
      endpoint: string | null;
      is_default: boolean;
      created_at: string | Date | null;
    }>(
      `
        SELECT id, name, storage_type, bucket, region, endpoint, is_default, created_at
        FROM storage_configs
        ORDER BY created_at DESC NULLS LAST
      `,
    );
    return NextResponse.json(
      rows.rows.map((row) => ({
        id: row.id,
        name: row.name,
        storage_type: row.storage_type,
        bucket: row.bucket,
        region: row.region,
        endpoint: row.endpoint,
        is_default: row.is_default,
        created_at: row.created_at ? new Date(row.created_at).toISOString() : "",
      })),
    );
  }

  if (slug.length === 1 && slug[0] === "members") {
    const rows = await query<{
      id: string;
      email: string;
      name: string | null;
      is_active: boolean;
      created_at: string | Date | null;
      role_name: string | null;
    }>(
      `
        SELECT
          u.id,
          u.email,
          u.name,
          u.is_active,
          u.created_at,
          r.name AS role_name
        FROM users u
        LEFT JOIN roles r ON r.id = u.role_id
        WHERE u.owner_id = $1 OR u.id = $1
        ORDER BY u.created_at DESC NULLS LAST
      `,
      [claims.sub],
    );

    return NextResponse.json(
      rows.rows.map((row) => ({
        id: row.id,
        email: row.email,
        name: row.name || "",
        role: row.role_name || "Member",
        is_active: row.is_active,
        created_at: row.created_at ? new Date(row.created_at).toISOString() : "",
      })),
    );
  }

  if (slug.length === 1 && slug[0] === "webhooks") {
    const projectScope = await resolveProjectFromQuery(request, claims);
    if (projectScope instanceof NextResponse) return projectScope;

    const rows = await query<{
      config_value: string | null;
    }>(
      `
        SELECT config_value
        FROM configs
        WHERE service_name = 'webhooks'
          AND user_id = $1
          ${projectScope ? "AND project_id = $2" : ""}
        ORDER BY created_at DESC
      `,
      projectScope ? [claims.sub, projectScope] : [claims.sub],
    );

    return NextResponse.json(
      rows.rows
        .map((row) => {
          if (!row.config_value) return null;
          try {
            return JSON.parse(row.config_value);
          } catch {
            return null;
          }
        })
        .filter(Boolean),
    );
  }

  if (slug.length === 1 && slug[0] === "livekit-config") {
    return NextResponse.json({
      LIVEKIT_URL: serverEnv.LIVEKIT_HOST,
      LIVEKIT_API_URL: serverEnv.LIVEKIT_HOST,
      LIVEKIT_API_KEY: serverEnv.LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET: serverEnv.LIVEKIT_API_SECRET,
      provider: "LiveKit",
      status: "active",
    });
  }

  return NextResponse.json({ error: "Not Found" }, { status: 404 });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const claims = await requireAdmin(request);
  if (claims instanceof NextResponse) return claims;
  const { slug } = await resolveParams(context.params);
  const payload = (await request.json()) as Record<string, unknown>;

  if (slug.length === 1 && slug[0] === "roles") {
    const name = String(payload.name || "").trim();
    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
    const created = await query<{
      id: string;
      name: string;
      description: string | null;
      permissions: string | null;
      is_system: boolean;
    }>(
      `
        INSERT INTO roles (id, name, description, permissions, is_system)
        VALUES ($1, $2, $3, $4, false)
        RETURNING id, name, description, permissions, is_system
      `,
      [
        randomUUID(),
        name,
        String(payload.description || ""),
        JSON.stringify(Array.isArray(payload.permissions) ? payload.permissions : []),
      ],
    );
    const role = created.rows[0];
    return NextResponse.json(
      {
        id: role.id,
        name: role.name,
        description: role.description || "",
        permissions: parsePermissions(role.permissions),
        is_system: role.is_system,
      },
      { status: 201 },
    );
  }

  if (slug.length === 1 && slug[0] === "service-accounts") {
    const name = String(payload.name || "").trim();
    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
    const clientId = `sa_${randomUUID().replace(/-/g, "")}`;
    const clientSecret = `${randomUUID().replace(/-/g, "")}${randomUUID().replace(/-/g, "")}`;
    const clientSecretHash = await hashPassword(clientSecret);

    const created = await query<{
      id: string;
      name: string;
      client_id: string;
      created_at: string | Date | null;
    }>(
      `
        INSERT INTO service_accounts (
          id, name, client_id, client_secret_hash, permissions, is_active, created_at
        )
        VALUES ($1, $2, $3, $4, $5, true, NOW())
        RETURNING id, name, client_id, created_at
      `,
      [
        randomUUID(),
        name,
        clientId,
        clientSecretHash,
        payload.permissions ? JSON.stringify(payload.permissions) : null,
      ],
    );

    return NextResponse.json(
      {
        id: created.rows[0].id,
        name: created.rows[0].name,
        client_id: created.rows[0].client_id,
        client_secret: clientSecret,
        created_at: created.rows[0].created_at
          ? new Date(created.rows[0].created_at).toISOString()
          : "",
      },
      { status: 201 },
    );
  }

  if (slug.length === 1 && slug[0] === "storage") {
    const isDefault = payload.is_default === true;
    if (isDefault) {
      await query("UPDATE storage_configs SET is_default = false WHERE is_default = true");
    }
    const created = await query<{
      id: string;
      name: string;
      storage_type: string;
      bucket: string;
      region: string | null;
      endpoint: string | null;
      is_default: boolean;
      created_at: string | Date | null;
    }>(
      `
        INSERT INTO storage_configs (
          id, name, storage_type, bucket, region, endpoint, access_key, secret_key,
          is_default, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING id, name, storage_type, bucket, region, endpoint, is_default, created_at
      `,
      [
        randomUUID(),
        String(payload.name || ""),
        String(payload.storage_type || ""),
        String(payload.bucket || ""),
        payload.region ? String(payload.region) : null,
        payload.endpoint ? String(payload.endpoint) : null,
        payload.access_key ? String(payload.access_key) : null,
        payload.secret_key ? String(payload.secret_key) : null,
        isDefault,
      ],
    );
    const row = created.rows[0];
    return NextResponse.json(
      {
        id: row.id,
        name: row.name,
        storage_type: row.storage_type,
        bucket: row.bucket,
        region: row.region,
        endpoint: row.endpoint,
        is_default: row.is_default,
        created_at: row.created_at ? new Date(row.created_at).toISOString() : "",
      },
      { status: 201 },
    );
  }

  if (slug.length === 1 && slug[0] === "members") {
    const email = String(payload.email || "").trim().toLowerCase();
    const password = String(payload.password || "");
    const name = String(payload.name || "").trim();
    const roleName = String(payload.role || "").trim();
    if (!email || !password || !name || !roleName) {
      return NextResponse.json(
        { error: "email, password, name and role are required" },
        { status: 400 },
      );
    }

    let role = await query<{ id: string; name: string }>(
      "SELECT id, name FROM roles WHERE lower(name) = lower($1) LIMIT 1",
      [roleName],
    );
    if (!role.rows[0]) {
      role = await query<{ id: string; name: string }>(
        `
          INSERT INTO roles (id, name, description, permissions, is_system)
          VALUES ($1, $2, $3, $4, false)
          RETURNING id, name
        `,
        [
          randomUUID(),
          roleName,
          `Auto-created role: ${roleName}`,
          JSON.stringify(["project.read"]),
        ],
      );
    }

    const passwordHash = await hashPassword(password);
    const created = await query<{
      id: string;
      email: string;
      name: string | null;
      is_active: boolean;
      created_at: string | Date | null;
    }>(
      `
        INSERT INTO users (
          id, email, password, owner_id, name, role_id, is_active, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
        RETURNING id, email, name, is_active, created_at
      `,
      [randomUUID(), email, passwordHash, claims.sub, name, role.rows[0].id],
    );
    const row = created.rows[0];
    return NextResponse.json(
      {
        id: row.id,
        email: row.email,
        name: row.name || "",
        role: role.rows[0].name,
        is_active: row.is_active,
        created_at: row.created_at ? new Date(row.created_at).toISOString() : "",
      },
      { status: 201 },
    );
  }

  if (slug.length === 1 && slug[0] === "webhooks") {
    const projectScope = await resolveProjectFromPayload(payload, claims);
    if (projectScope instanceof NextResponse) return projectScope;
    const id = randomUUID();
    const webhook = {
      id,
      name: String(payload.name || ""),
      url: String(payload.url || ""),
      events: Array.isArray(payload.events)
        ? payload.events.map((item) => String(item))
        : [],
      created_at: new Date().toISOString(),
    };

    await query(
      `
        INSERT INTO configs (
          id, user_id, project_id, service_name, config_key, config_value, is_active, created_at, updated_at
        )
        VALUES ($1, $2, $3, 'webhooks', $4, $5, true, NOW(), NOW())
      `,
      [randomUUID(), claims.sub, projectScope, id, JSON.stringify(webhook)],
    );

    return NextResponse.json(webhook, { status: 201 });
  }

  return NextResponse.json({ error: "Not Found" }, { status: 404 });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const claims = await requireAdmin(request);
  if (claims instanceof NextResponse) return claims;
  const { slug } = await resolveParams(context.params);
  const payload = (await request.json()) as Record<string, unknown>;

  if (slug.length === 2 && slug[0] === "roles") {
    const roleId = slug[1];
    const existing = await query<{ is_system: boolean }>(
      "SELECT is_system FROM roles WHERE id = $1 LIMIT 1",
      [roleId],
    );
    if (!existing.rows[0]) return NextResponse.json({ error: "Not Found" }, { status: 404 });
    if (existing.rows[0].is_system) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await query<{
      id: string;
      name: string;
      description: string | null;
      permissions: string | null;
      is_system: boolean;
    }>(
      `
        UPDATE roles
        SET
          name = COALESCE($2, name),
          description = COALESCE($3, description),
          permissions = COALESCE($4, permissions)
        WHERE id = $1
        RETURNING id, name, description, permissions, is_system
      `,
      [
        roleId,
        payload.name !== undefined ? String(payload.name) : null,
        payload.description !== undefined ? String(payload.description) : null,
        payload.permissions !== undefined ? JSON.stringify(payload.permissions) : null,
      ],
    );
    const role = updated.rows[0];
    return NextResponse.json({
      id: role.id,
      name: role.name,
      description: role.description || "",
      permissions: parsePermissions(role.permissions),
      is_system: role.is_system,
    });
  }

  return NextResponse.json({ error: "Not Found" }, { status: 404 });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const claims = await requireAdmin(request);
  if (claims instanceof NextResponse) return claims;
  const { slug } = await resolveParams(context.params);

  if (slug.length === 2 && slug[0] === "roles") {
    const roleId = slug[1];
    const existing = await query<{ is_system: boolean }>(
      "SELECT is_system FROM roles WHERE id = $1 LIMIT 1",
      [roleId],
    );
    if (!existing.rows[0]) return NextResponse.json({ error: "Not Found" }, { status: 404 });
    if (existing.rows[0].is_system) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await query("DELETE FROM roles WHERE id = $1", [roleId]);
    return new NextResponse(null, { status: 204 });
  }

  if (slug.length === 2 && slug[0] === "storage") {
    await query("DELETE FROM storage_configs WHERE id = $1", [slug[1]]);
    return new NextResponse(null, { status: 204 });
  }

  if (slug.length === 2 && slug[0] === "members") {
    const userId = slug[1];
    if (userId === claims.sub) {
      return NextResponse.json(
        { error: "Bad Request", message: "Cannot delete your own account" },
        { status: 400 },
      );
    }
    const existing = await query<{ id: string }>(
      "SELECT id FROM users WHERE id = $1 AND owner_id = $2 LIMIT 1",
      [userId, claims.sub],
    );
    if (!existing.rows[0]) return NextResponse.json({ error: "Not Found" }, { status: 404 });
    await query("DELETE FROM users WHERE id = $1", [userId]);
    return new NextResponse(null, { status: 204 });
  }

  if (slug.length === 2 && slug[0] === "webhooks") {
    const projectScope = await resolveProjectFromQuery(request, claims);
    if (projectScope instanceof NextResponse) return projectScope;
    await query(
      `
        DELETE FROM configs
        WHERE service_name = 'webhooks'
          AND user_id = $1
          AND config_key = $2
          ${projectScope ? "AND project_id = $3" : ""}
      `,
      projectScope ? [claims.sub, slug[1], projectScope] : [claims.sub, slug[1]],
    );
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({ error: "Not Found" }, { status: 404 });
}
