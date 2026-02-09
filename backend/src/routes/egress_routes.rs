use axum::{routing::{post, get, delete}, Router, middleware};
use crate::handlers::egress;
use crate::utils::jwt::jwt_middleware;

pub fn routes() -> Router<crate::AppState> {
    Router::new()
        .route("/api/egress", post(egress::create_egress))
        .route("/api/egress", get(egress::list_egress))
        .route("/api/egress/:egress_id", delete(egress::stop_egress))
        .layer(middleware::from_fn(jwt_middleware))
}