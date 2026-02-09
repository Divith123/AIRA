use axum::{routing::get, Router, middleware};
use crate::handlers::sessions;
use crate::utils::jwt::jwt_middleware;

pub fn routes() -> Router<crate::AppState> {
    Router::new()
        .route("/api/sessions/list", get(sessions::list_sessions))
        .route("/api/sessions/stats", get(sessions::get_session_stats))
        .layer(middleware::from_fn(jwt_middleware))
}
