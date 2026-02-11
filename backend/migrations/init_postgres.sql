-- Users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    role_id TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project AI Config
CREATE TABLE IF NOT EXISTS project_ai_configs (
    project_id TEXT PRIMARY KEY,
    stt_mode TEXT,
    stt_provider TEXT,
    stt_model TEXT,
    tts_mode TEXT,
    tts_provider TEXT,
    tts_model TEXT,
    tts_voice TEXT,
    llm_mode TEXT,
    llm_provider TEXT,
    llm_model TEXT,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Sessions (History)
CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    room_name TEXT NOT NULL,
    status TEXT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration INTEGER DEFAULT 0,
    total_participants INTEGER DEFAULT 0,
    active_participants INTEGER DEFAULT 0,
    project_id TEXT,
    features TEXT, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics Snapshots
CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active_rooms INTEGER DEFAULT 0,
    total_participants INTEGER DEFAULT 0,
    cpu_load REAL,
    memory_usage REAL
);

-- Telephony: SIP Trunks
CREATE TABLE IF NOT EXISTS sip_trunks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    numbers TEXT, 
    sip_uri TEXT,
    sip_server TEXT,
    username TEXT,
    password TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Telephony: Dispatch Rules
CREATE TABLE IF NOT EXISTS dispatch_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    rule_type TEXT NOT NULL,
    trunk_id TEXT,
    agent_id TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Room Templates
CREATE TABLE IF NOT EXISTS room_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    config TEXT NOT NULL, 
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Layout Templates
CREATE TABLE IF NOT EXISTS layout_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    layout_type TEXT NOT NULL,
    config TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auto Recording Rules
CREATE TABLE IF NOT EXISTS auto_recording_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    room_pattern TEXT,
    egress_type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service Accounts
CREATE TABLE IF NOT EXISTS service_accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    client_id TEXT UNIQUE NOT NULL,
    client_secret_hash TEXT NOT NULL,
    permissions TEXT, 
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Storage Configs
CREATE TABLE IF NOT EXISTS storage_configs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    storage_type TEXT NOT NULL,
    bucket TEXT NOT NULL,
    region TEXT,
    endpoint TEXT,
    access_key TEXT,
    secret_key TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Regions
CREATE TABLE IF NOT EXISTS regions (
    id TEXT PRIMARY KEY,
    region_name TEXT NOT NULL,
    region_code TEXT UNIQUE NOT NULL,
    livekit_url TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    permissions TEXT,
    is_system BOOLEAN DEFAULT FALSE
);

-- Agents (Merged from create_agents_tables.sql and add_project_id logic)
CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'offline',
    config TEXT,
    project_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Metrics (Assuming needed)
CREATE TABLE IF NOT EXISTS agent_metrics (
    id TEXT PRIMARY KEY,
    agent_id TEXT REFERENCES agents(id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cpu_usage REAL,
    memory_usage REAL,
    active_sessions INTEGER
);

CREATE TABLE IF NOT EXISTS agent_logs (
    id TEXT PRIMARY KEY,
    agent_id TEXT REFERENCES agents(id),
    level TEXT,
    message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
