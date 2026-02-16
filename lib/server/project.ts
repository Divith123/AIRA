import { query } from "./db";

export interface ProjectRow {
  id: string;
  user_id: string;
  short_id: string | null;
  name: string;
  description: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

export async function resolveOwnedProjectId(
  projectIdentifier: string,
  userId: string,
): Promise<string | null> {
  const result = await query<{ id: string }>(
    `
      SELECT id
      FROM projects
      WHERE user_id = $1
        AND (id = $2 OR short_id = $2)
      LIMIT 1
    `,
    [userId, projectIdentifier],
  );
  return result.rows[0]?.id ?? null;
}

export async function listOwnedProjects(userId: string) {
  const result = await query<ProjectRow>(
    `
      SELECT id, user_id, short_id, name, description, status, created_at, updated_at
      FROM projects
      WHERE user_id = $1
      ORDER BY created_at DESC NULLS LAST
    `,
    [userId],
  );
  return result.rows;
}
