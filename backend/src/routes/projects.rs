use axum::{routing::get, Router, middleware};
use crate::handlers::projects;
use crate::utils::jwt::jwt_middleware;

pub fn routes() -> Router<crate::AppState> {
    Router::new()
        .route("/api/projects", get(projects::list_projects).post(projects::create_project))
        .route("/api/projects/:id", get(projects::get_project).put(projects::update_project).delete(projects::delete_project))
        .route("/api/projects/:project_id/ai-config", get(projects::get_ai_config).put(projects::update_ai_config))
        .layer(middleware::from_fn(jwt_middleware))
}
