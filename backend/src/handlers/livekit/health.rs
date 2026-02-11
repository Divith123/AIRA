use axum::{extract::State, http::StatusCode, Json};
use serde::Serialize;
use crate::AppState;

#[derive(Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub server_url: String,
    pub ws_url: String,
    pub timestamp: String,
}

#[derive(Serialize)]
pub struct ApiInfoResponse {
    pub message: String,
    pub endpoints: Vec<String>,
}

pub async fn check_health(
    State(state): State<AppState>,
) -> Result<Json<HealthResponse>, StatusCode> {
    let server_url = std::env::var("LIVEKIT_URL").unwrap_or_else(|_| "http://localhost:7880".to_string());
    let ws_url = server_url.replace("http://", "ws://").replace("https://", "wss://");

    let healthy = state.lk_service.check_health().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let status = if healthy { "healthy" } else { "unhealthy" };

    Ok(Json(HealthResponse {
        status: status.to_string(),
        server_url,
        ws_url,
        timestamp: chrono::Utc::now().to_rfc3339(),
    }))
}

pub async fn api_info() -> Json<ApiInfoResponse> {
    Json(ApiInfoResponse {
        message: "LiveKit Admin API".to_string(),
        endpoints: vec![
            "GET /api/livekit/api-keys - List API keys".to_string(),
            "POST /api/livekit/api-keys - Create API key".to_string(),
            "GET /api/livekit/health - Check server health".to_string(),
            "GET /api/livekit/rooms - List all rooms".to_string(),
            "POST /api/livekit/rooms - Create a room".to_string(),
            "DELETE /api/livekit/rooms/{name} - Delete a room".to_string(),
            "GET /api/livekit/rooms/{name}/participants - List participants".to_string(),
            "DELETE /api/livekit/rooms/{name}/participants/{identity} - Remove participant".to_string(),
            "GET /api/livekit/stats - Get server statistics".to_string(),
            "GET /api/livekit/token - Generate access token".to_string(),
            "POST /api/livekit/token - Generate access token".to_string(),
        ],
    })
}