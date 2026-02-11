CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action TEXT NOT NULL,
    actor_id TEXT,
    actor_email TEXT,
    target_type TEXT,
    target_id TEXT,
    metadata TEXT, -- JSON blob
    ip_address TEXT,
    project_id TEXT,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);
