use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct CreateEgressRequest {
    pub room_name: String,
    pub output: Option<EgressOutput>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum EgressOutput {
    File { filepath: String, disable_manifest: Option<bool> },
    Stream { protocol: String, urls: Vec<String> },
    Segments { playlist_name: String, live_playlist_name: Option<String>, segment_duration: Option<u32> },
    Images { filename_prefix: String, image_interval: Option<u32> },
}

#[derive(Serialize, Deserialize, Clone)]
pub struct EgressResponse {
    pub egress_id: String,
    pub room_id: Option<String>,
    pub room_name: String,
    pub status: String,
    pub started_at: Option<i64>,
    pub ended_at: Option<i64>,
    pub error: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct RoomCompositeEgressRequest {
    pub room_name: String,
    pub layout: Option<String>,
    pub file: Option<EncodedFileOut>,
    pub stream: Option<StreamOut>,
    pub segments: Option<SegmentedFileOut>,
    pub audio_only: Option<bool>,
    pub video_only: Option<bool>,
}

#[derive(Serialize, Deserialize)]
pub struct ParticipantEgressRequest {
    pub room_name: String,
    pub identity: String,
    pub file: Option<EncodedFileOut>,
    pub stream: Option<StreamOut>,
    pub segments: Option<SegmentedFileOut>,
    pub screenshare: Option<bool>,
    pub encoding: Option<serde_json::Value>, // Changed to Value to avoid serialization issues
}

#[derive(Serialize, Deserialize)]
pub struct EncodedFileOut {
    pub filepath: String,
    pub file_type: Option<i32>,
    pub disable_manifest: Option<bool>,
    pub encryption: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct StreamOut {
    pub protocol: Option<i32>,
    pub urls: Vec<String>,
}

#[derive(Serialize, Deserialize)]
pub struct SegmentedFileOut {
    pub playlist_name: String,
    pub segment_duration: Option<u32>,
    pub filepath: Option<String>,
    pub disable_manifest: Option<bool>,
}

#[derive(Serialize, Deserialize)]
pub struct WebEgressRequest {
    pub url: String,
    pub audio_only: Option<bool>,
    pub video_only: Option<bool>,
    pub output_format: Option<String>,
    pub file: Option<EncodedFileOut>,
    pub stream: Option<StreamOut>,
    pub segments: Option<SegmentedFileOut>,
    pub width: Option<i32>,
    pub height: Option<i32>,
    pub scale: Option<f32>,
    pub encoding: Option<serde_json::Value>, // Changed to Value to avoid serialization issues
    pub await_start_signal: Option<bool>,
}

#[derive(Serialize, Deserialize)]
pub struct TrackEgressRequest {
    pub room_name: String,
    pub track_sid: String,
    pub output_format: Option<String>,
    pub filepath: Option<String>,
    pub disable_manifest: Option<bool>,
}

#[derive(Serialize, Deserialize)]
pub struct ImageEgressRequest {
    pub room_name: String,
    pub width: i32,
    pub height: i32,
    pub filename_prefix: Option<String>,
    pub capture_interval: Option<u32>,
    pub audio_only: Option<bool>,
    pub video_only: Option<bool>,
    pub encoding: Option<serde_json::Value>, // Changed to Value to avoid serialization issues
    pub audio_track_id: Option<String>,
    pub video_track_id: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct StopEgressRequest {
    pub egress_id: String,
}

#[derive(Serialize, Deserialize)]
pub struct ListEgressResponse {
    pub items: Vec<EgressResponse>,
}