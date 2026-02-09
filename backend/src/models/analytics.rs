use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct AnalyticsSummaryResponse {
    pub active_rooms: i32,
    pub total_participants: i32,
    pub status: String,
    pub last_updated: String,
}

#[derive(Serialize)]
pub struct AnalyticsMetricsResponse {
    pub timeseries: Vec<AnalyticsDataPoint>,
    pub summary: AnalyticsSummaryResponse,
}

#[derive(Serialize)]
pub struct AnalyticsDataPoint {
    pub timestamp: String,
    pub active_rooms: i32,
    pub total_participants: i32,
    pub cpu_load: Option<f32>,
    pub memory_usage: Option<f32>,
}

#[derive(Serialize)]
pub struct DashboardDataResponse {
    pub overview: DashboardOverview,
    pub platforms: std::collections::HashMap<String, i32>,
    pub participants: DashboardParticipants,
    pub agents: DashboardAgents,
    pub telephony: DashboardTelephony,
    pub rooms: DashboardRooms,
}

#[derive(Serialize)]
pub struct DashboardOverview {
    pub connection_success: f32,
    pub connection_type: ConnectionTypeStats,
    pub top_countries: Vec<TopCountry>,
}

#[derive(Serialize)]
pub struct ConnectionTypeStats {
    pub udp: i32,
    pub tcp: i32,
}

#[derive(Serialize)]
pub struct TopCountry {
    pub name: String,
    pub count: i32,
}

#[derive(Serialize)]
pub struct DashboardParticipants {
    pub webrtc_minutes: i32,
    pub agent_minutes: i32,
    pub sip_minutes: i32,
    pub total_minutes: i32,
}

#[derive(Serialize)]
pub struct DashboardAgents {
    pub session_minutes: i32,
    pub concurrent: i32,
}

#[derive(Serialize)]
pub struct DashboardTelephony {
    pub inbound: i32,
    pub outbound: i32,
}

#[derive(Serialize)]
pub struct DashboardRooms {
    pub total_sessions: i32,
    pub avg_size: f32,
    pub avg_duration: f32,
}
