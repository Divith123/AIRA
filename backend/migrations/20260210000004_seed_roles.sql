INSERT INTO roles (id, name, description, permissions, is_system) VALUES 
('role_owner', 'Owner', 'Full access to all project resources and settings', '["*"]', true),
('role_admin', 'Administrator', 'Full access to project resources, but cannot manage owners', '["project.*", "agent.*", "room.*", "sip.*", "settings.*", "analytics.*"]', true),
('role_dev', 'Developer', 'Read-write access to rooms and agents, restricted settings', '["room.*", "agent.*", "analytics.*"]', true),
('role_viewer', 'Viewer', 'Read-only access to all project resources', '["*.read"]', true)
ON CONFLICT (name) DO NOTHING;
