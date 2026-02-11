use axum::{routing::get, Router, middleware};
use crate::handlers::transcripts;
use crate::utils::jwt::jwt_middleware;

pub fn routes() -> Router<crate::AppState> {
    Router::new()
        .route("/api/transcripts", get(transcripts::list_transcripts))
        .layer(middleware::from_fn(jwt_middleware))
}
