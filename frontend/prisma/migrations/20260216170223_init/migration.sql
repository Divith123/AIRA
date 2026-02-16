-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "email_verified" TIMESTAMP(6),
    "image" TEXT,
    "phone" TEXT,
    "owner_id" TEXT,
    "role_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "auth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(6) NOT NULL
);

-- CreateTable
CREATE TABLE "authenticators" (
    "credential_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "credential_public_key" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "credential_device_type" TEXT NOT NULL,
    "credential_backed_up" BOOLEAN NOT NULL,
    "transports" TEXT,

    CONSTRAINT "authenticators_pkey" PRIMARY KEY ("user_id","credential_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "short_id" TEXT,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_ai_configs" (
    "project_id" TEXT NOT NULL,
    "stt_mode" TEXT,
    "stt_provider" TEXT,
    "stt_model" TEXT,
    "tts_mode" TEXT,
    "tts_provider" TEXT,
    "tts_model" TEXT,
    "tts_voice" TEXT,
    "llm_mode" TEXT,
    "llm_provider" TEXT,
    "llm_model" TEXT,

    CONSTRAINT "project_ai_configs_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "sid" TEXT NOT NULL,
    "room_name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "start_time" TIMESTAMP(6) NOT NULL,
    "end_time" TIMESTAMP(6),
    "duration" INTEGER NOT NULL DEFAULT 0,
    "total_participants" INTEGER NOT NULL DEFAULT 0,
    "active_participants" INTEGER NOT NULL DEFAULT 0,
    "project_id" TEXT,
    "features" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("sid")
);

-- CreateTable
CREATE TABLE "analytics_snapshots" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active_rooms" INTEGER NOT NULL DEFAULT 0,
    "total_participants" INTEGER NOT NULL DEFAULT 0,
    "cpu_load" DOUBLE PRECISION,
    "memory_usage" DOUBLE PRECISION,

    CONSTRAINT "analytics_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sip_trunks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "numbers" TEXT,
    "sip_uri" TEXT,
    "sip_server" TEXT,
    "username" TEXT,
    "password" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sip_trunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispatch_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rule_type" TEXT NOT NULL,
    "trunk_id" TEXT,
    "agent_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispatch_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_templates" (
    "id" TEXT NOT NULL,
    "project_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "config" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "layout_templates" (
    "id" TEXT NOT NULL,
    "project_id" TEXT,
    "name" TEXT NOT NULL,
    "layout_type" TEXT NOT NULL,
    "config" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "layout_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auto_recording_rules" (
    "id" TEXT NOT NULL,
    "project_id" TEXT,
    "name" TEXT NOT NULL,
    "room_pattern" TEXT,
    "egress_type" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auto_recording_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_accounts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_secret_hash" TEXT NOT NULL,
    "permissions" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storage_configs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "storage_type" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "region" TEXT,
    "endpoint" TEXT,
    "access_key" TEXT,
    "secret_key" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "storage_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" TEXT NOT NULL,
    "region_name" TEXT NOT NULL,
    "region_code" TEXT NOT NULL,
    "livekit_url" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "entrypoint" TEXT,
    "env_vars" TEXT DEFAULT '{}',
    "livekit_permissions" TEXT DEFAULT '{}',
    "default_room_behavior" TEXT DEFAULT 'auto',
    "auto_restart_policy" TEXT DEFAULT 'always',
    "resource_limits" TEXT DEFAULT '{}',
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "project_id" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_instances" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "instance_id" TEXT NOT NULL,
    "container_id" TEXT,
    "process_pid" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'stopped',
    "last_heartbeat" TIMESTAMP(6),
    "exit_code" INTEGER,
    "crash_reason" TEXT,
    "started_at" TIMESTAMP(6),
    "stopped_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_logs" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "instance_id" TEXT NOT NULL,
    "log_level" TEXT DEFAULT 'info',
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_metrics" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "instance_id" TEXT NOT NULL,
    "metric_name" TEXT NOT NULL,
    "metric_value" DOUBLE PRECISION,
    "unit" TEXT,
    "timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_rooms" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "instance_id" TEXT,
    "room_name" TEXT NOT NULL,
    "joined_at" TIMESTAMP(6),
    "left_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "project_id" TEXT,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "secret" TEXT,
    "secret_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "room_name" TEXT NOT NULL,
    "room_sid" TEXT,
    "max_participants" INTEGER,
    "empty_timeout" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingress" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "input_type" TEXT NOT NULL,
    "room_name" TEXT,
    "stream_key" TEXT,
    "url" TEXT,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "egress" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "egress_type" TEXT NOT NULL,
    "room_name" TEXT,
    "output_type" TEXT,
    "output_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "egress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sip" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trunk_id" TEXT,
    "phone_number" TEXT,
    "room_name" TEXT,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "project_id" TEXT,
    "service_name" TEXT NOT NULL,
    "config_key" TEXT NOT NULL,
    "config_value" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metrics" (
    "id" TEXT NOT NULL,
    "metric_name" TEXT NOT NULL,
    "metric_value" DOUBLE PRECISION,
    "labels" TEXT,
    "timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcripts" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "room_name" TEXT NOT NULL,
    "participant_identity" TEXT,
    "text" TEXT NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "language" TEXT,
    "is_final" BOOLEAN NOT NULL DEFAULT true,
    "project_id" TEXT,

    CONSTRAINT "transcripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "actor_id" TEXT,
    "actor_email" TEXT,
    "target_type" TEXT,
    "target_id" TEXT,
    "metadata" TEXT,
    "ip_address" TEXT,
    "project_id" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" VARCHAR(36) NOT NULL,
    "project_id" TEXT,
    "event_type" VARCHAR(100) NOT NULL,
    "payload" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "delivery_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_deliveries" (
    "id" VARCHAR(36) NOT NULL,
    "event_id" VARCHAR(36) NOT NULL,
    "webhook_id" VARCHAR(36) NOT NULL,
    "url" TEXT NOT NULL,
    "status_code" INTEGER,
    "response_body" TEXT,
    "error_message" TEXT,
    "attempted_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "webhook_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "error_logs" (
    "id" VARCHAR(36) NOT NULL,
    "error_type" VARCHAR(100) NOT NULL,
    "message" TEXT NOT NULL,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_logs" (
    "id" TEXT NOT NULL,
    "call_id" TEXT NOT NULL,
    "from_number" TEXT,
    "to_number" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "started_at" TIMESTAMP(6) NOT NULL,
    "ended_at" TIMESTAMP(6),
    "duration_seconds" INTEGER DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ringing',
    "trunk_id" TEXT,
    "room_name" TEXT,
    "participant_identity" TEXT,
    "project_id" TEXT,
    "metadata" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "call_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_owner_id" ON "users"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_accounts_provider_provider_account_id_key" ON "auth_accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_sessions_session_token_key" ON "auth_sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "auth_verification_tokens_identifier_token_key" ON "auth_verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "authenticators_credential_id_key" ON "authenticators"("credential_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "idx_projects_short_id" ON "projects"("short_id");

-- CreateIndex
CREATE INDEX "idx_projects_user_id" ON "projects"("user_id");

-- CreateIndex
CREATE INDEX "idx_sessions_project_id" ON "sessions"("project_id");

-- CreateIndex
CREATE INDEX "idx_sessions_room_name" ON "sessions"("room_name");

-- CreateIndex
CREATE INDEX "idx_sessions_start_time" ON "sessions"("start_time");

-- CreateIndex
CREATE INDEX "idx_analytics_snapshots_timestamp" ON "analytics_snapshots"("timestamp");

-- CreateIndex
CREATE INDEX "idx_room_templates_project_id" ON "room_templates"("project_id");

-- CreateIndex
CREATE INDEX "idx_layout_templates_project_id" ON "layout_templates"("project_id");

-- CreateIndex
CREATE INDEX "idx_auto_recording_rules_project_id" ON "auto_recording_rules"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_accounts_client_id_key" ON "service_accounts"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "regions_region_code_key" ON "regions"("region_code");

-- CreateIndex
CREATE UNIQUE INDEX "agents_agent_id_key" ON "agents"("agent_id");

-- CreateIndex
CREATE INDEX "idx_agents_project_id" ON "agents"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "agent_instances_instance_id_key" ON "agent_instances"("instance_id");

-- CreateIndex
CREATE INDEX "idx_agent_instances_agent_id" ON "agent_instances"("agent_id");

-- CreateIndex
CREATE INDEX "idx_agent_instances_status" ON "agent_instances"("status");

-- CreateIndex
CREATE INDEX "idx_agent_logs_agent_id" ON "agent_logs"("agent_id");

-- CreateIndex
CREATE INDEX "idx_agent_logs_instance_id" ON "agent_logs"("instance_id");

-- CreateIndex
CREATE INDEX "idx_agent_logs_timestamp" ON "agent_logs"("timestamp");

-- CreateIndex
CREATE INDEX "idx_agent_metrics_agent_id" ON "agent_metrics"("agent_id");

-- CreateIndex
CREATE INDEX "idx_agent_metrics_instance_id" ON "agent_metrics"("instance_id");

-- CreateIndex
CREATE INDEX "idx_agent_metrics_timestamp" ON "agent_metrics"("timestamp");

-- CreateIndex
CREATE INDEX "idx_agent_rooms_agent_id" ON "agent_rooms"("agent_id");

-- CreateIndex
CREATE INDEX "idx_agent_rooms_room_name" ON "agent_rooms"("room_name");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "api_keys"("key");

-- CreateIndex
CREATE INDEX "idx_api_keys_key" ON "api_keys"("key");

-- CreateIndex
CREATE INDEX "idx_api_keys_user_id" ON "api_keys"("user_id");

-- CreateIndex
CREATE INDEX "idx_api_keys_project_id" ON "api_keys"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_room_name_key" ON "rooms"("room_name");

-- CreateIndex
CREATE INDEX "idx_rooms_name" ON "rooms"("room_name");

-- CreateIndex
CREATE INDEX "idx_ingress_room" ON "ingress"("room_name");

-- CreateIndex
CREATE INDEX "idx_egress_room" ON "egress"("room_name");

-- CreateIndex
CREATE INDEX "idx_sip_room" ON "sip"("room_name");

-- CreateIndex
CREATE INDEX "idx_configs_service" ON "configs"("service_name");

-- CreateIndex
CREATE INDEX "idx_configs_user_id" ON "configs"("user_id");

-- CreateIndex
CREATE INDEX "idx_configs_project_id" ON "configs"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "configs_service_name_config_key_key" ON "configs"("service_name", "config_key");

-- CreateIndex
CREATE INDEX "idx_metrics_name" ON "metrics"("metric_name");

-- CreateIndex
CREATE INDEX "idx_metrics_timestamp" ON "metrics"("timestamp");

-- CreateIndex
CREATE INDEX "idx_transcripts_session_id" ON "transcripts"("session_id");

-- CreateIndex
CREATE INDEX "idx_transcripts_timestamp" ON "transcripts"("timestamp");

-- CreateIndex
CREATE INDEX "idx_audit_logs_timestamp" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "idx_audit_logs_action" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "idx_audit_logs_project_id" ON "audit_logs"("project_id");

-- CreateIndex
CREATE INDEX "idx_webhook_events_created_at" ON "webhook_events"("created_at");

-- CreateIndex
CREATE INDEX "idx_webhook_events_processed" ON "webhook_events"("processed");

-- CreateIndex
CREATE INDEX "idx_webhook_events_event_type" ON "webhook_events"("event_type");

-- CreateIndex
CREATE INDEX "idx_webhook_events_project_id" ON "webhook_events"("project_id");

-- CreateIndex
CREATE INDEX "idx_webhook_deliveries_event_id" ON "webhook_deliveries"("event_id");

-- CreateIndex
CREATE INDEX "idx_webhook_deliveries_attempted_at" ON "webhook_deliveries"("attempted_at");

-- CreateIndex
CREATE INDEX "idx_webhook_deliveries_success" ON "webhook_deliveries"("success");

-- CreateIndex
CREATE INDEX "idx_error_logs_created_at" ON "error_logs"("created_at");

-- CreateIndex
CREATE INDEX "idx_error_logs_is_resolved" ON "error_logs"("is_resolved");

-- CreateIndex
CREATE INDEX "idx_error_logs_error_type" ON "error_logs"("error_type");

-- CreateIndex
CREATE INDEX "idx_call_logs_call_id" ON "call_logs"("call_id");

-- CreateIndex
CREATE INDEX "idx_call_logs_direction" ON "call_logs"("direction");

-- CreateIndex
CREATE INDEX "idx_call_logs_started_at" ON "call_logs"("started_at");

-- CreateIndex
CREATE INDEX "idx_call_logs_trunk_id" ON "call_logs"("trunk_id");

-- CreateIndex
CREATE INDEX "idx_call_logs_project_id" ON "call_logs"("project_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_accounts" ADD CONSTRAINT "auth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authenticators" ADD CONSTRAINT "authenticators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_ai_configs" ADD CONSTRAINT "project_ai_configs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_templates" ADD CONSTRAINT "room_templates_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layout_templates" ADD CONSTRAINT "layout_templates_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_recording_rules" ADD CONSTRAINT "auto_recording_rules_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_instances" ADD CONSTRAINT "agent_instances_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_logs" ADD CONSTRAINT "agent_logs_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_logs" ADD CONSTRAINT "agent_logs_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "agent_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_metrics" ADD CONSTRAINT "agent_metrics_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_metrics" ADD CONSTRAINT "agent_metrics_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "agent_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_rooms" ADD CONSTRAINT "agent_rooms_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_rooms" ADD CONSTRAINT "agent_rooms_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "agent_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configs" ADD CONSTRAINT "configs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configs" ADD CONSTRAINT "configs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("sid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "webhook_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
