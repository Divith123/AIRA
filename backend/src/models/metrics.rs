use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct MetricResponse {
    pub name: String,
    pub value: Option<f64>,
    pub labels: serde_json::Value,
    pub timestamp: String,
}

#[derive(Serialize, Deserialize)]
pub struct MetricsSummary {
    pub total_rooms: i64,
    pub total_participants: i64,
    pub active_egress: i64,
    pub active_ingress: i64,
}