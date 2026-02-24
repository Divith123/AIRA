import { query } from "./db";
import { resolveOwnedProjectId } from "./project";
import { parseRangeToHours, parseSessionFeatures, extractProjectIdFromRoom } from "../utils";

export { parseRangeToHours, parseSessionFeatures, extractProjectIdFromRoom };

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

export async function getCountryFromIp(ip: string): Promise<string | null> {
  if (!ip || ip === "::1" || ip === "127.0.0.1") return "Local";
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode`);
    const data = await res.json();
    if (data.status === "success") {
      return data.country || data.countryCode || null;
    }
  } catch (e) {
    console.error("Error fetching country from IP:", e);
  }
  return null;
}
