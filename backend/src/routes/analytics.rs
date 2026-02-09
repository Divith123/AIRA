use axum::{routing::get, Router, middleware};
use crate::handlers::analytics;
use crate::utils::jwt::jwt_middleware;

pub fn routes() -> Router<crate::AppState> {
    Router::new()
        .route("/api/analytics/summary", get(analytics::get_analytics_summary))
        .route("/api/analytics/dashboard", get(analytics::get_dashboard_data))
        .route("/api/analytics/timeseries", get(analytics::get_analytics_timeseries))
        .layer(middleware::from_fn(jwt_middleware))
}
