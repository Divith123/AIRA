use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct RoleResponse {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub permissions: Vec<String>,
    pub is_system: bool,
}

#[derive(Deserialize)]
pub struct CreateRoleRequest {
    pub name: String,
    pub description: Option<String>,
    pub permissions: Vec<String>,
}

#[derive(Serialize)]
pub struct ServiceAccountResponse {
    pub id: String,
    pub name: String,
    pub client_id: String,
    pub permissions: Vec<String>,
    pub is_active: bool,
    pub created_at: String,
}

#[derive(Serialize)]
pub struct ServiceAccountSecretsResponse {
    pub id: String,
    pub name: String,
    pub client_id: String,
    pub client_secret: String,
    pub created_at: String,
}

#[derive(Deserialize)]
pub struct CreateServiceAccountRequest {
    pub name: String,
    pub permissions: Option<Vec<String>>,
}

#[derive(Serialize)]
pub struct StorageConfigResponse {
    pub id: String,
    pub name: String,
    pub storage_type: String,
    pub bucket: String,
    pub region: Option<String>,
    pub endpoint: Option<String>,
    pub is_default: bool,
    pub created_at: String,
}

#[derive(Deserialize)]
pub struct CreateStorageConfigRequest {
    pub name: String,
    pub storage_type: String,
    pub bucket: String,
    pub region: Option<String>,
    pub endpoint: Option<String>,
    pub access_key: Option<String>,
    pub secret_key: Option<String>,
    pub is_default: Option<bool>,
}
#[derive(Serialize)]
pub struct TeamMemberResponse {
    pub id: String,
    pub email: String,
    pub name: String,
    pub role: String,
    pub is_active: bool,
    pub created_at: String,
}

#[derive(Deserialize)]
pub struct CreateTeamMemberRequest {
    pub email: String,
    pub name: String,
    pub password: String,
    pub role: String,
}

#[derive(Serialize)]
pub struct RolePermissionsResponse {
    pub role: RoleResponse,
    pub assigned_permissions: Vec<String>,
    pub available_permissions: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct WebhookResponse {
    pub id: String,
    pub name: String,
    pub url: String,
    pub events: Vec<String>,
    pub created_at: String,
}

#[derive(Deserialize)]
pub struct CreateWebhookRequest {
    pub name: String,
    pub url: String,
    pub events: Vec<String>,
}
