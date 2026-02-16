export interface ScopeMetadata {
  owner_user_id?: string;
  project_id?: string;
  client_metadata?: string | null;
}

export function projectPrefix(projectId: string) {
  return `prj-${projectId}-`;
}

export function scopeName(value: string, projectId: string) {
  const prefix = projectPrefix(projectId);
  return value.startsWith(prefix) ? value : `${prefix}${value}`;
}

export function unscopeName(value: string, projectId: string) {
  const prefix = projectPrefix(projectId);
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

export function encodeScopeMetadata(input: ScopeMetadata) {
  return JSON.stringify({
    owner_user_id: input.owner_user_id || null,
    project_id: input.project_id || null,
    client_metadata: input.client_metadata || null,
  });
}

export function parseScopeMetadata(metadata: string | null | undefined): ScopeMetadata {
  if (!metadata) return {};
  try {
    const parsed = JSON.parse(metadata) as ScopeMetadata;
    return parsed || {};
  } catch {
    return {};
  }
}

export function metadataInScope(
  metadata: string | null | undefined,
  userId: string,
  projectId?: string | null,
) {
  const parsed = parseScopeMetadata(metadata);
  if (parsed.owner_user_id !== userId) return false;
  if (projectId && parsed.project_id !== projectId) return false;
  return true;
}

