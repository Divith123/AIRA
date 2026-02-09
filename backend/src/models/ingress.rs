use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct CreateIngressRequest {
    pub name: String,
    pub room_name: String,
    pub participant_identity: String,
    pub participant_name: String,
    pub input_type: String, // RTMP_INPUT, WHIP_INPUT
}

#[derive(Serialize, Deserialize)]
pub struct IngressResponse {
    pub ingress_id: String,
    pub name: String,
    pub input_type: String,
    pub room_name: String,
    pub stream_key: Option<String>,
    pub url: Option<String>,
    pub state: String,
}