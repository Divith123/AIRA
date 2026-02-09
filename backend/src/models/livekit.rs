use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct CreateApiKeyRequest {
    pub name: String,
}

#[derive(Serialize, Deserialize)]
pub struct ApiKeyResponse {
    pub id: String,
    pub name: String,
    pub key: String,
    pub created_at: String,
    pub is_active: bool,
}

#[derive(Serialize, Deserialize)]
pub struct ListRoomsResponse {
    pub rooms: Vec<RoomResponse>,
}

#[derive(Serialize, Deserialize)]
pub struct CreateRoomRequest {
    pub name: String,
    #[serde(rename = "emptyTimeout")]
    pub empty_timeout: Option<u32>,
    #[serde(rename = "maxParticipants")]
    pub max_participants: Option<u32>,
    pub metadata: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct RoomResponse {
    pub name: String,
    pub sid: String,
    pub empty_timeout: u32,
    pub max_participants: u32,
    pub creation_time: String,
}

#[derive(Serialize, Deserialize)]
pub struct CodecInfo {
    pub mime: String,
}

#[derive(Serialize, Deserialize)]
pub struct ParticipantResponse {
    pub identity: String,
    pub name: Option<String>,
    pub state: String,
    pub joined_at: u64,
    pub tracks: Vec<TrackInfo>,
}

#[derive(Serialize, Deserialize)]
pub struct TrackInfo {
    pub sid: String,
    pub name: String,
    pub kind: String,
}