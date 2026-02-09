use axum::{routing::{post, get, delete}, Router, middleware};
use crate::handlers::ingress;
use crate::utils::jwt::jwt_middleware;

pub fn routes() -> Router<crate::AppState> {
    Router::new()
        .route("/api/livekit/ingresses", get(ingress::list_ingress))
        .route("/api/livekit/ingress", post(ingress::create_ingress))
        .route("/api/livekit/ingress/url", post(ingress::create_url_ingress))
        .route("/api/livekit/ingress/:ingress_id", delete(ingress::delete_ingress))
        .layer(middleware::from_fn(jwt_middleware))
}