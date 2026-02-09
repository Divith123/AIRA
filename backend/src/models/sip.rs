use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct CreateSipTrunkRequest {
    pub name: String,
    pub outbound_address: String,
    pub outbound_username: Option<String>,
    pub outbound_password: Option<String>,
    pub phone_numbers: Vec<String>,
}

#[derive(Serialize, Deserialize)]
pub struct SipTrunkResponse {
    pub sip_trunk_id: String,
    pub name: String,
    pub outbound_address: String,
    pub phone_numbers: Vec<String>,
}

#[derive(Serialize, Deserialize)]
pub struct CreateSipCallRequest {
    pub trunk_id: String,
    pub to_number: String,
    pub from_number: String,
    pub room_name: String,
}

#[derive(Serialize, Deserialize)]
pub struct SipCallResponse {
    pub call_id: String,
    pub trunk_id: String,
    pub to_number: String,
    pub from_number: String,
    pub room_name: String,
    pub status: String,
}