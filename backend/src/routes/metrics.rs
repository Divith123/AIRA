use axum::{routing::get, Router, middleware};
use crate::handlers::metrics;
use crate::utils::jwt::jwt_middleware;

pub fn routes() -> Router<crate::AppState> {
    Router::new()
        .route("/api/metrics/summary", get(metrics::get_metrics_summary))
        .route("/api/metrics", get(metrics::get_recent_metrics))
        .layer(middleware::from_fn(jwt_middleware))
}