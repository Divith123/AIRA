CREATE TABLE IF NOT EXISTS transcripts (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    room_name TEXT NOT NULL,
    participant_identity TEXT,
    text TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    language TEXT,
    is_final BOOLEAN DEFAULT TRUE,
    project_id TEXT,
    FOREIGN KEY(session_id) REFERENCES sessions(sid) ON DELETE CASCADE,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);
