-- Create agents table
CREATE TABLE agents (
    id TEXT PRIMARY KEY,
    agent_id TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    image TEXT NOT NULL, -- Docker image or binary path
    entrypoint TEXT, -- Command to run
    env_vars TEXT DEFAULT '{}', -- Environment variables
    livekit_permissions TEXT DEFAULT '{}', -- LiveKit permissions
    default_room_behavior TEXT DEFAULT 'auto_join', -- auto_join, manual, none
    auto_restart_policy TEXT DEFAULT 'always', -- always, on_failure, never
    resource_limits TEXT DEFAULT '{}', -- CPU, memory limits
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create agent_instances table for running instances
CREATE TABLE agent_instances (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    instance_id TEXT UNIQUE NOT NULL,
    container_id TEXT, -- Docker container ID
    process_pid INTEGER, -- Process ID for local processes
    status TEXT NOT NULL DEFAULT 'stopped', -- deploying, running, stopped, crashed, unhealthy
    last_heartbeat TIMESTAMP,
    exit_code INTEGER,
    crash_reason TEXT,
    started_at TIMESTAMP,
    stopped_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create agent_logs table
CREATE TABLE agent_logs (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    instance_id TEXT NOT NULL REFERENCES agent_instances(id) ON DELETE CASCADE,
    log_level TEXT DEFAULT 'info', -- debug, info, warn, error
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create agent_metrics table
CREATE TABLE agent_metrics (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    instance_id TEXT NOT NULL REFERENCES agent_instances(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_value REAL,
    unit TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create agent_rooms table for room assignments
CREATE TABLE agent_rooms (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    instance_id TEXT REFERENCES agent_instances(id) ON DELETE CASCADE,
    room_name TEXT NOT NULL,
    joined_at TIMESTAMP,
    left_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_agents_agent_id ON agents(agent_id);
CREATE INDEX idx_agent_instances_agent_id ON agent_instances(agent_id);
CREATE INDEX idx_agent_instances_status ON agent_instances(status);
CREATE INDEX idx_agent_logs_agent_id ON agent_logs(agent_id);
CREATE INDEX idx_agent_logs_instance_id ON agent_logs(instance_id);
CREATE INDEX idx_agent_logs_timestamp ON agent_logs(timestamp);
CREATE INDEX idx_agent_metrics_agent_id ON agent_metrics(agent_id);
CREATE INDEX idx_agent_metrics_instance_id ON agent_metrics(instance_id);
CREATE INDEX idx_agent_metrics_timestamp ON agent_metrics(timestamp);
CREATE INDEX idx_agent_rooms_agent_id ON agent_rooms(agent_id);
CREATE INDEX idx_agent_rooms_room_name ON agent_rooms(room_name);