use axum::{routing::get, Router, middleware};
use crate::handlers::audit_logs;
use crate::utils::jwt::jwt_middleware;

pub fn routes() -> Router<crate::AppState> {
    Router::new()
        .route("/api/audit-logs", get(audit_logs::list_audit_logs))
        .layer(middleware::from_fn(jwt_middleware))
}
