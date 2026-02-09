use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct SessionResponse {
    pub sid: String,
    pub room_name: String,
    pub status: String,
    pub start_time: String,
    pub end_time: Option<String>,
    pub duration: i32,
    pub total_participants: i32,
    pub active_participants: i32,
    pub project_id: Option<String>,
    pub features: Vec<String>,
}

#[derive(Serialize)]
pub struct SessionsListResponse {
    pub data: Vec<SessionResponse>,
    pub total: u64,
    pub page: u64,
    pub limit: u64,
}

#[derive(Deserialize)]
pub struct ListSessionsQuery {
    pub page: Option<u64>,
    pub limit: Option<u64>,
    pub status: Option<String>,
    pub search: Option<String>,
}

#[derive(Serialize)]
pub struct SessionStatsResponse {
    pub unique_participants: i64,
    pub total_rooms: i64,
    pub timeseries: Vec<SessionTimeSeriesPoint>,
}

#[derive(Serialize)]
pub struct SessionTimeSeriesPoint {
    pub timestamp: String,
    pub rooms: i32,
    pub participants: i32,
}
