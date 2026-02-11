use axum::{routing::{get, delete, put}, Router, middleware};
use crate::handlers::settings;
use crate::utils::jwt::jwt_middleware;

pub fn routes() -> Router<crate::AppState> {
    Router::new()
        .route("/api/settings/service-accounts", get(settings::list_service_accounts).post(settings::create_service_account))
        .route("/api/settings/roles", get(settings::list_roles).post(settings::create_role))
        .route("/api/settings/roles/:id", put(settings::update_role).delete(settings::delete_role))
        .route("/api/settings/storage", get(settings::list_storage_configs).post(settings::create_storage_config))
        .route("/api/settings/storage/:id", delete(settings::delete_storage_config))
        .route("/api/settings/members", get(settings::list_team_members).post(settings::create_team_member))
        .route("/api/settings/members/:id", delete(settings::delete_team_member))
        .route("/api/settings/webhooks", get(settings::list_webhooks).post(settings::create_webhook))
        .route("/api/settings/webhooks/:id", delete(settings::delete_webhook))
        .route("/api/settings/roles/:id/permissions", get(settings::get_role_permissions))
        .layer(middleware::from_fn(jwt_middleware))
}
