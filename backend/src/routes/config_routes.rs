use axum::{routing::post, Router, middleware};
use crate::handlers::config;
use crate::utils::jwt::jwt_middleware;

pub fn routes() -> Router<crate::AppState> {
    Router::new()
        .route("/api/config", post(config::update_config))
        .route("/api/config/apply", post(config::apply_config))
        .layer(middleware::from_fn(jwt_middleware))
}