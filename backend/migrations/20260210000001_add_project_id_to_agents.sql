ALTER TABLE agents ADD COLUMN project_id TEXT REFERENCES projects(id) ON DELETE CASCADE;
CREATE INDEX idx_agents_project_id ON agents(project_id);
