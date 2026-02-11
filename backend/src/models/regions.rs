use serde::Serialize;

#[derive(Serialize)]
pub struct RegionResponse {
    pub id: String,
    pub region_name: String,
    pub region_code: String,
    pub livekit_url: Option<String>,
    pub is_default: bool,
    pub created_at: String,
}
