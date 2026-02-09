use axum::{routing::{post, get}, Router, middleware};
use crate::handlers::ingress;
use crate::utils::jwt::jwt_middleware;

pub fn routes() -> Router<crate::AppState> {
    Router::new()
        .route("/api/ingress", post(ingress::create_ingress))
        .route("/api/ingress", get(ingress::list_ingress))
        .layer(middleware::from_fn(jwt_middleware))
}