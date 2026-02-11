-- Seed admin user
INSERT INTO users (id, email, password, name, role_id, is_active)
VALUES (
    'admin-user-id',
    'admin@example.com',
    '$argon2id$v=19$m=19456,t=2,p=1$YWJjZGVmZ2hpams$aGVsbG93b3JsZA', -- password: admin123
    'Admin User',
    'role_admin',
    true
) ON CONFLICT (email) DO NOTHING;