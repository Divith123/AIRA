use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct ConfigUpdateRequest {
    pub service_name: String,
    pub config_key: String,
    pub config_value: String,
}

#[derive(Serialize, Deserialize)]
pub struct ConfigResponse {
    pub service_name: String,
    pub config_key: String,
    pub config_value: Option<String>,
    pub is_active: bool,
}

#[derive(Serialize, Deserialize)]
pub struct ApplyConfigRequest {
    pub service_name: String,
}