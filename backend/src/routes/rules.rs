use axum::{routing::{get, delete}, Router, middleware};
use crate::handlers::rules;
use crate::utils::jwt::jwt_middleware;

pub fn routes() -> Router<crate::AppState> {
    Router::new()
        .route("/api/auto-recording-rules", get(rules::list_auto_recording_rules).post(rules::create_auto_recording_rule))
        .route("/api/auto-recording-rules/:id", delete(rules::delete_auto_recording_rule))
        .route("/api/rules/dispatch-rules", get(rules::list_dispatch_rules).post(rules::create_dispatch_rule))
        .route("/api/rules/dispatch-rules/:id", delete(rules::delete_dispatch_rule))
        .layer(middleware::from_fn(jwt_middleware))
}
