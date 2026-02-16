import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/guards";
import { resolveOwnedProjectId } from "@/lib/server/project";

type RouteContext = {
  params: Promise<{ projectId: string }> | { projectId: string };
};

function resolveParams(params: RouteContext["params"]) {
  if ("then" in params) return params;
  return Promise.resolve(params);
}

async function resolveProject(
  request: NextRequest,
  context: RouteContext,
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { projectId } = await resolveParams(context.params);
  const resolved = await resolveOwnedProjectId(projectId, auth.sub);
  if (!resolved) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }
  return { auth, projectId: resolved };
}

export async function GET(request: NextRequest, context: RouteContext) {
  const scope = await resolveProject(request, context);
  if (scope instanceof NextResponse) return scope;

  const result = await query<{
    project_id: string;
    stt_mode: string | null;
    stt_provider: string | null;
    stt_model: string | null;
    tts_mode: string | null;
    tts_provider: string | null;
    tts_model: string | null;
    tts_voice: string | null;
    llm_mode: string | null;
    llm_provider: string | null;
    llm_model: string | null;
  }>(
    `
      SELECT
        project_id,
        stt_mode,
        stt_provider,
        stt_model,
        tts_mode,
        tts_provider,
        tts_model,
        tts_voice,
        llm_mode,
        llm_provider,
        llm_model
      FROM project_ai_configs
      WHERE project_id = $1
      LIMIT 1
    `,
    [scope.projectId],
  );

  const config = result.rows[0];
  if (!config) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  return NextResponse.json(config);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const scope = await resolveProject(request, context);
  if (scope instanceof NextResponse) return scope;
  const payload = (await request.json()) as Record<string, string | undefined>;

  await query(
    `
      INSERT INTO project_ai_configs (
        project_id,
        stt_mode,
        stt_provider,
        stt_model,
        tts_mode,
        tts_provider,
        tts_model,
        tts_voice,
        llm_mode,
        llm_provider,
        llm_model
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      )
      ON CONFLICT (project_id) DO UPDATE SET
        stt_mode = COALESCE(EXCLUDED.stt_mode, project_ai_configs.stt_mode),
        stt_provider = COALESCE(EXCLUDED.stt_provider, project_ai_configs.stt_provider),
        stt_model = COALESCE(EXCLUDED.stt_model, project_ai_configs.stt_model),
        tts_mode = COALESCE(EXCLUDED.tts_mode, project_ai_configs.tts_mode),
        tts_provider = COALESCE(EXCLUDED.tts_provider, project_ai_configs.tts_provider),
        tts_model = COALESCE(EXCLUDED.tts_model, project_ai_configs.tts_model),
        tts_voice = COALESCE(EXCLUDED.tts_voice, project_ai_configs.tts_voice),
        llm_mode = COALESCE(EXCLUDED.llm_mode, project_ai_configs.llm_mode),
        llm_provider = COALESCE(EXCLUDED.llm_provider, project_ai_configs.llm_provider),
        llm_model = COALESCE(EXCLUDED.llm_model, project_ai_configs.llm_model)
    `,
    [
      scope.projectId,
      payload.stt_mode ?? null,
      payload.stt_provider ?? null,
      payload.stt_model ?? null,
      payload.tts_mode ?? null,
      payload.tts_provider ?? null,
      payload.tts_model ?? null,
      payload.tts_voice ?? null,
      payload.llm_mode ?? null,
      payload.llm_provider ?? null,
      payload.llm_model ?? null,
    ],
  );

  const result = await query<{
    project_id: string;
    stt_mode: string | null;
    stt_provider: string | null;
    stt_model: string | null;
    tts_mode: string | null;
    tts_provider: string | null;
    tts_model: string | null;
    tts_voice: string | null;
    llm_mode: string | null;
    llm_provider: string | null;
    llm_model: string | null;
  }>(
    `
      SELECT
        project_id,
        stt_mode,
        stt_provider,
        stt_model,
        tts_mode,
        tts_provider,
        tts_model,
        tts_voice,
        llm_mode,
        llm_provider,
        llm_model
      FROM project_ai_configs
      WHERE project_id = $1
      LIMIT 1
    `,
    [scope.projectId],
  );

  return NextResponse.json(result.rows[0]);
}

