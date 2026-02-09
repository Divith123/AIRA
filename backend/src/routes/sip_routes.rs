use axum::{routing::{post, get}, Router, middleware};
use crate::handlers::sip;
use crate::utils::jwt::jwt_middleware;

pub fn routes() -> Router<crate::AppState> {
    Router::new()
        .route("/api/sip/trunks", post(sip::create_sip_trunk))
        .route("/api/sip/trunks", get(sip::list_sip_trunks))
        .route("/api/sip/calls", post(sip::create_sip_call))
        .layer(middleware::from_fn(jwt_middleware))
}