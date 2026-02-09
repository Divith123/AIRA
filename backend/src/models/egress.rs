use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct CreateEgressRequest {
    pub room_name: String,
    pub output: EgressOutput,
}

#[derive(Serialize, Deserialize)]
pub enum EgressOutput {
    File { filepath: String, disable_manifest: Option<bool> },
    Stream { protocol: String, urls: Vec<String> },
    Segments { playlist_name: String, live_playlist_name: Option<String>, segment_duration: Option<u32> },
    Images { filename_prefix: String, image_interval: Option<u32> },
}

#[derive(Serialize, Deserialize)]
pub struct EgressResponse {
    pub egress_id: String,
    pub room_name: String,
    pub status: String,
    pub started_at: Option<u64>,
    pub ended_at: Option<u64>,
    pub error: Option<String>,
}