use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct RoomTemplateResponse {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub config: String,
    pub is_default: bool,
    pub created_at: String,
}

#[derive(Deserialize)]
pub struct CreateRoomTemplateRequest {
    pub name: String,
    pub description: Option<String>,
    pub config: serde_json::Value,
    pub is_default: Option<bool>,
}

#[derive(Serialize)]
pub struct LayoutTemplateResponse {
    pub id: String,
    pub name: String,
    pub layout_type: String,
    pub config: Option<String>,
    pub is_default: bool,
    pub created_at: String,
}

#[derive(Deserialize)]
pub struct CreateLayoutTemplateRequest {
    pub name: String,
    pub layout_type: String,
    pub config: Option<serde_json::Value>,
    pub is_default: Option<bool>,
}
