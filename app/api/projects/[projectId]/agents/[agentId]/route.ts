import { NextResponse, type NextRequest } from "next/server";
import { mapAgentRow } from "@/lib/server/agent-utils";
import { query } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/guards";
import { resolveOwnedProjectId } from "@/lib/server/project";

type RouteContext = {
  params:
    | Promise<{ projectId: string; agentId: string }>
    | { projectId: string; agentId: string };
};

function resolveParams(params: RouteContext["params"]) {
  if ("then" in params) return params;
  return Promise.resolve(params);
}

function normalizeUpdatePayload(payload: Record<string, unknown>) {
  const status = payload.status ? String(payload.status).toLowerCase() : null;
  let enabled =
    payload.is_enabled !== undefined ? payload.is_enabled === true : undefined;
  if (status) {
    if (["active", "running", "enabled"].includes(status)) enabled = true;
    if (["paused", "inactive", "disabled"].includes(status)) enabled = false;
  }
  return {
    display_name:
      payload.name !== undefined || payload.display_name !== undefined
        ? String(payload.display_name || payload.name || "")
        : null,
    image: payload.image !== undefined ? String(payload.image || "") : null,
    entrypoint:
      payload.entrypoint !== undefined
        ? payload.entrypoint === null
          ? null
          : String(payload.entrypoint)
        : undefined,
    instructions:
      payload.instructions !== undefined
        ? payload.instructions === null
          ? null
          : String(payload.instructions)
        : undefined,
    welcome_message:
      payload.welcome_message !== undefined
        ? payload.welcome_message === null
          ? null
          : String(payload.welcome_message)
        : undefined,
    voice:
      payload.voice !== undefined
        ? payload.voice === null
          ? null
          : String(payload.voice)
        : undefined,
    model:
      payload.model !== undefined
        ? payload.model === null
          ? null
          : String(payload.model)
        : undefined,
    env_vars:
      payload.environment !== undefined || payload.env_vars !== undefined
        ? JSON.stringify(
            payload.environment && typeof payload.environment === "object"
              ? payload.environment
              : payload.env_vars && typeof payload.env_vars === "object"
                ? payload.env_vars
                : {},
          )
        : null,
    livekit_permissions:
      payload.livekit_permissions !== undefined
        ? JSON.stringify(
            payload.livekit_permissions && typeof payload.livekit_permissions === "object"
              ? payload.livekit_permissions
              : {},
          )
        : null,
    default_room_behavior:
      payload.default_room_behavior !== undefined
        ? String(payload.default_room_behavior || "")
        : null,
    auto_restart_policy:
      payload.auto_restart_policy !== undefined
        ? String(payload.auto_restart_policy || "")
        : null,
    resource_limits:
      payload.resource_limits !== undefined
        ? JSON.stringify(
            payload.resource_limits && typeof payload.resource_limits === "object"
              ? payload.resource_limits
              : {},
          )
        : null,
    config:
      payload.config !== undefined
        ? JSON.stringify(
            payload.config && typeof payload.config === "object"
              ? payload.config
              : {},
          )
        : null,
    is_enabled: enabled,
  };
}

async function resolveScope(request: NextRequest, context: RouteContext) {
  const claims = requireAuth(request, { admin: true });
  if (claims instanceof NextResponse) return claims;
  const { projectId, agentId } = await resolveParams(context.params);
  const resolvedProjectId = await resolveOwnedProjectId(projectId, claims.sub);
  if (!resolvedProjectId) return NextResponse.json({ error: "Not Found" }, { status: 404 });

  const row = await query<{
    id: string;
    agent_id: string;
    display_name: string;
    image: string;
    entrypoint: string | null;
    instructions: string | null;
    welcome_message: string | null;
    voice: string | null;
    model: string | null;
    config: string | null;
    env_vars: string | null;
    livekit_permissions: string | null;
    default_room_behavior: string | null;
    auto_restart_policy: string | null;
    resource_limits: string | null;
    is_enabled: boolean;
    created_at: string | Date;
    updated_at: string | Date;
  }>(
    `
      SELECT
        id,
        agent_id,
        display_name,
        image,
        entrypoint,
        instructions,
        welcome_message,
        voice,
        model,
        config,
        env_vars,
        livekit_permissions,
        default_room_behavior,
        auto_restart_policy,
        resource_limits,
        is_enabled,
        created_at,
        updated_at
      FROM agents
      WHERE project_id = $1
        AND agent_id = $2
      LIMIT 1
    `,
    [resolvedProjectId, agentId],
  );
  if (!row.rows[0]) return NextResponse.json({ error: "Not Found" }, { status: 404 });

  return { claims, projectId: resolvedProjectId, agentId, agent: row.rows[0] };
}

export async function GET(request: NextRequest, context: RouteContext) {
  const scope = await resolveScope(request, context);
  if (scope instanceof NextResponse) return scope;
  return NextResponse.json(mapAgentRow(scope.agent));
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const scope = await resolveScope(request, context);
  if (scope instanceof NextResponse) return scope;
  const payload = (await request.json()) as Record<string, unknown>;
  const update = normalizeUpdatePayload(payload);

  const updated = await query<{
    id: string;
    agent_id: string;
    display_name: string;
    image: string;
    entrypoint: string | null;
    instructions: string | null;
    welcome_message: string | null;
    voice: string | null;
    model: string | null;
    config: string | null;
    env_vars: string | null;
    livekit_permissions: string | null;
    default_room_behavior: string | null;
    auto_restart_policy: string | null;
    resource_limits: string | null;
    is_enabled: boolean;
    created_at: string | Date;
    updated_at: string | Date;
  }>(
    `
      UPDATE agents
      SET
        display_name = COALESCE($2, display_name),
        image = COALESCE($3, image),
        entrypoint = $4,
        instructions = COALESCE($5, instructions),
        welcome_message = COALESCE($6, welcome_message),
        voice = COALESCE($7, voice),
        model = COALESCE($8, model),
        config = COALESCE($9, config),
        env_vars = COALESCE($10, env_vars),
        livekit_permissions = COALESCE($11, livekit_permissions),
        default_room_behavior = COALESCE($12, default_room_behavior),
        auto_restart_policy = COALESCE($13, auto_restart_policy),
        resource_limits = COALESCE($14, resource_limits),
        is_enabled = COALESCE($15, is_enabled),
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        agent_id,
        display_name,
        image,
        entrypoint,
        instructions,
        welcome_message,
        voice,
        model,
        config,
        env_vars,
        livekit_permissions,
        default_room_behavior,
        auto_restart_policy,
        resource_limits,
        is_enabled,
        created_at,
        updated_at
    `,
    [
      scope.agent.id,
      update.display_name,
      update.image,
      update.entrypoint === undefined ? scope.agent.entrypoint : update.entrypoint,
      update.instructions === undefined ? scope.agent.instructions : update.instructions,
      update.welcome_message === undefined ? scope.agent.welcome_message : update.welcome_message,
      update.voice === undefined ? scope.agent.voice : update.voice,
      update.model === undefined ? scope.agent.model : update.model,
      update.config === undefined ? scope.agent.config : update.config,
      update.env_vars,
      update.livekit_permissions,
      update.default_room_behavior,
      update.auto_restart_policy,
      update.resource_limits,
      update.is_enabled ?? null,
    ],
  );

  return NextResponse.json(mapAgentRow(updated.rows[0]));
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const scope = await resolveScope(request, context);
  if (scope instanceof NextResponse) return scope;

  await query("DELETE FROM agents WHERE id = $1", [scope.agent.id]);
  return new NextResponse(null, { status: 204 });
}
