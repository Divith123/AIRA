use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct AutoRecordingRuleResponse {
    pub id: String,
    pub name: String,
    pub room_pattern: Option<String>,
    pub egress_type: String,
    pub is_active: bool,
    pub created_at: String,
}

#[derive(Deserialize)]
pub struct CreateAutoRecordingRuleRequest {
    pub name: String,
    pub room_pattern: Option<String>,
    pub egress_type: String,
    pub is_active: Option<bool>,
}

#[derive(Serialize)]
pub struct DispatchRuleResponse {
    pub id: String,
    pub name: String,
    pub rule_type: String,
    pub trunk_id: Option<String>,
    pub agent_id: Option<String>,
    pub is_active: bool,
    pub created_at: String,
}

#[derive(Deserialize)]
pub struct CreateDispatchRuleRequest {
    pub name: String,
    pub rule_type: String,
    pub trunk_id: Option<String>,
    pub agent_id: Option<String>,
}
