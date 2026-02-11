use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AuditLogResponse {
    pub id: String,
    pub timestamp: String,
    pub action: String,
    pub actor_id: Option<String>,
    pub actor_email: Option<String>,
    pub target_type: Option<String>,
    pub target_id: Option<String>,
    pub metadata: Option<serde_json::Value>,
    pub ip_address: Option<String>,
    pub project_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ListAuditLogsQuery {
    pub project_id: Option<String>,
    pub action: Option<String>,
    pub target_type: Option<String>,
    pub page: Option<u64>,
    pub limit: Option<u64>,
}
