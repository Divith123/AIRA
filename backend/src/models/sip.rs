use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct CreateSipTrunkRequest {
    pub name: Option<String>,
    pub metadata: Option<String>,
    pub inbound_addresses: Option<Vec<String>>,
    pub inbound_numbers_regex: Option<Vec<String>>,
    pub inbound_username: Option<String>,
    pub inbound_password: Option<String>,
    pub outbound_address: Option<String>,
    pub outbound_username: Option<String>,
    pub outbound_password: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct SipTrunkResponse {
    pub sip_trunk_id: String,
    pub name: Option<String>,
    pub metadata: Option<String>,
    pub inbound_addresses: Vec<String>,
    pub inbound_numbers_regex: Vec<String>,
    pub outbound_address: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct ListSipTrunkResponse {
    pub items: Vec<SipTrunkResponse>,
}

#[derive(Serialize, Deserialize)]
pub struct CreateSipDispatchRuleRequest {
    pub name: Option<String>,
    pub metadata: Option<String>,
    pub rule: Option<SipDispatchRule>,
    pub trunk_ids: Option<Vec<String>>,
    pub hide_phone_number: Option<bool>,
}

#[derive(Serialize, Deserialize)]
pub struct SipDispatchRuleResponse {
    pub sip_dispatch_rule_id: String,
    pub name: Option<String>,
    pub metadata: Option<String>,
    pub rule: Option<SipDispatchRule>,
    pub trunk_ids: Vec<String>,
    pub hide_phone_number: bool,
}

#[derive(Serialize, Deserialize)]
pub struct SipDispatchRule {
    #[serde(rename = "dispatchRule")]
    pub dispatch_rule: Option<DispatchRuleType>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum DispatchRuleType {
    Individual(IndividualRule),
    Recursive(RecursiveRule),
}

#[derive(Serialize, Deserialize)]
pub struct IndividualRule {
    pub room_name_prefix: String,
    pub pin: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct RecursiveRule {
    pub room_name: String,
    pub pin: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct ListSipDispatchRuleResponse {
    pub items: Vec<SipDispatchRuleResponse>,
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