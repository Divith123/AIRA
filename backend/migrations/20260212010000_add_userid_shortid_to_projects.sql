-- Add user_id and short_id to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS short_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_short_id ON projects (short_id);
