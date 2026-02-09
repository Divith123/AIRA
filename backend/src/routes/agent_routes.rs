use axum::{routing::{post, get, put, delete}, Router, middleware};
use crate::handlers::agents::{deploy, lifecycle, logs, metrics, rooms};
use crate::utils::jwt::jwt_middleware;

pub fn routes() -> Router<crate::AppState> {
    Router::new()
        // Agent definition management
        .route("/api/agents", post(deploy::create_agent))
        .route("/api/agents", get(deploy::list_agents))
        .route("/api/agents/:agent_id", put(deploy::update_agent))

        // Agent deployment
        .route("/api/agents/:agent_id/deploy", post(deploy::deploy_agent))

        // Agent lifecycle management
        .route("/api/agent-instances", get(lifecycle::list_agent_instances))
        .route("/api/agent-instances/:instance_id/start", post(lifecycle::start_agent))
        .route("/api/agent-instances/:instance_id/stop", post(lifecycle::stop_agent))
        .route("/api/agent-instances/:instance_id/restart", post(lifecycle::restart_agent))

        // Agent logs
        .route("/api/agent-instances/:instance_id/logs", get(logs::get_agent_logs))
        .route("/api/agent-instances/:instance_id/logs/stream", get(logs::stream_agent_logs))

        // Agent metrics
        .route("/api/agent-instances/:instance_id/metrics", get(metrics::get_agent_metrics))
        .route("/api/agent-instances/:instance_id/metrics/collect", post(metrics::collect_agent_metrics))

        // Agent room management
        .route("/api/agents/:agent_id/rooms", get(rooms::get_agent_room_assignments))
        .route("/api/agents/assign-room", post(rooms::assign_agent_to_room))
        .route("/api/agents/:agent_id/rooms/:room_name", delete(rooms::remove_agent_from_room))
        .route("/api/rooms/:room_name/agents", get(rooms::get_room_agents))
        .layer(middleware::from_fn(jwt_middleware))
}