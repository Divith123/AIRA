use axum::{Router, routing::{post, get}};
use crate::AppState;

use crate::handlers::auth::{register, login, me};

pub fn routes() -> Router<AppState> {

    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/api/auth/me", get(me))
}
