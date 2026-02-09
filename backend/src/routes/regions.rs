use axum::{routing::get, Router, middleware};
use crate::handlers::regions;
use crate::utils::jwt::jwt_middleware;

pub fn routes() -> Router<crate::AppState> {
    Router::new()
        .route("/api/regions", get(regions::list_regions))
        .layer(middleware::from_fn(jwt_middleware))
}
