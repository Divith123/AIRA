use axum::{routing::post, Router};
use crate::handlers::webhook;

pub fn routes() -> Router<crate::AppState> {
    Router::new()
        .route("/webhook", post(webhook::handle_webhook))
}