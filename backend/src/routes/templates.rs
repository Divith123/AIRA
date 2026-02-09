use axum::{routing::{get, post}, Router, middleware};
use crate::handlers::templates;
use crate::utils::jwt::jwt_middleware;

pub fn routes() -> Router<crate::AppState> {
    Router::new()
        .route("/api/room-templates", get(templates::list_room_templates).post(templates::create_room_template))
        .route("/api/layout-templates", get(templates::list_layout_templates).post(templates::create_layout_template))
        .layer(middleware::from_fn(jwt_middleware))
}
