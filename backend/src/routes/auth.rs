use axum::{Router, routing::{post, get}, middleware};
use crate::AppState;

use crate::handlers::auth::{register, login, me};
use crate::utils::jwt::jwt_middleware;

pub fn routes() -> Router<AppState> {

    Router::new()
        .route("/api/auth/register", post(register))
        .route("/api/auth/login", post(login))
        .route("/api/auth/me", get(me).layer(middleware::from_fn(jwt_middleware)))
}
