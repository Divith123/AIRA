import { query } from "./db";
import { resolveOwnedProjectId } from "./project";

export function parseRangeToHours(range: string | null): number {
  switch ((range || "24h").toLowerCase()) {
    case "1h":
      return 1;
    case "3h":
      return 3;
    case "6h":
      return 6;
    case "12h":
      return 12;
    case "24h":
      return 24;
    case "7d":
      return 24 * 7;
    case "30d":
      return 24 * 30;
    case "60d":
      return 24 * 60;
    default:
      return 24;
  }
}

export async function resolveSessionScopeProjectIds(
  userId: string,
  requestedProjectIdentifier: string | null,
) {
  if (requestedProjectIdentifier) {
    const projectId = await resolveOwnedProjectId(requestedProjectIdentifier, userId);
    if (!projectId) return null;
    return [projectId];
  }

  const projects = await query<{ id: string }>(
    "SELECT id FROM projects WHERE user_id = $1",
    [userId],
  );
  return projects.rows.map((row) => row.id);
}

export function parseSessionFeatures(features: string | null): string[] {
  if (!features) return [];
  try {
    const parsed = JSON.parse(features) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item));
    }
  } catch {
    // Ignore invalid serialized features.
  }
  return [];
}

