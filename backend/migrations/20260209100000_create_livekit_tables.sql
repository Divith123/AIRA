-- Create API keys table
CREATE TABLE api_keys (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    key TEXT UNIQUE NOT NULL,
    secret TEXT, -- Store the actual secret for livekit.yaml
    secret_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

-- Create rooms table
CREATE TABLE rooms (
    id TEXT PRIMARY KEY,
    room_name TEXT UNIQUE NOT NULL,
    room_sid TEXT,
    max_participants INTEGER,
    empty_timeout INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

-- Create ingress table
CREATE TABLE ingress (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    input_type TEXT NOT NULL, -- RTMP, WHIP, etc.
    room_name TEXT,
    stream_key TEXT,
    url TEXT,
    is_enabled BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create egress table
CREATE TABLE egress (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    egress_type TEXT NOT NULL, -- ROOM_COMPOSITE, TRACK, etc.
    room_name TEXT,
    output_type TEXT, -- FILE, STREAM
    output_url TEXT,
    is_active BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create SIP table
CREATE TABLE sip (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    trunk_id TEXT,
    phone_number TEXT,
    room_name TEXT,
    is_enabled BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create configs table
CREATE TABLE configs (
    id TEXT PRIMARY KEY,
    service_name TEXT NOT NULL, -- livekit-server, ingress, egress, sip
    config_key TEXT NOT NULL,
    config_value TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(service_name, config_key)
);

-- Create metrics table
CREATE TABLE metrics (
    id TEXT PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value REAL,
    labels TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_api_keys_key ON api_keys(key);
CREATE INDEX idx_rooms_name ON rooms(room_name);
CREATE INDEX idx_ingress_room ON ingress(room_name);
CREATE INDEX idx_egress_room ON egress(room_name);
CREATE INDEX idx_sip_room ON sip(room_name);
CREATE INDEX idx_configs_service ON configs(service_name);
CREATE INDEX idx_metrics_name ON metrics(metric_name);
CREATE INDEX idx_metrics_timestamp ON metrics(timestamp);