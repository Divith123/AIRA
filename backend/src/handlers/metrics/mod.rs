use axum::{extract::State, http::StatusCode, Json};
use sea_orm::EntityTrait;
use reqwest;
use serde_json;

use crate::entity::prelude::*;
use crate::models::metrics::{MetricResponse, MetricsSummary};
use crate::utils::jwt::Claims;
use crate::AppState;

pub async fn get_metrics_summary(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
) -> Result<Json<MetricsSummary>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    // Query Prometheus for metrics
    let client = reqwest::Client::new();

    // Total rooms
    let rooms_query = client
        .get("http://localhost:9090/api/v1/query")
        .query(&[("query", "livekit_room_count")])
        .send()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let rooms_data: serde_json::Value = rooms_query.json().await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let total_rooms = rooms_data["data"]["result"][0]["value"][1]
        .as_str()
        .unwrap_or("0")
        .parse()
        .unwrap_or(0);

    // Total participants
    let participants_query = client
        .get("http://localhost:9090/api/v1/query")
        .query(&[("query", "livekit_participant_count")])
        .send()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let participants_data: serde_json::Value = participants_query.json().await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let total_participants = participants_data["data"]["result"][0]["value"][1]
        .as_str()
        .unwrap_or("0")
        .parse()
        .unwrap_or(0);

    // Active egress
    let egress_query = client
        .get("http://localhost:9090/api/v1/query")
        .query(&[("query", "livekit_egress_active")])
        .send()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let egress_data: serde_json::Value = egress_query.json().await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let active_egress = egress_data["data"]["result"][0]["value"][1]
        .as_str()
        .unwrap_or("0")
        .parse()
        .unwrap_or(0);

    // Active ingress
    let ingress_query = client
        .get("http://localhost:9090/api/v1/query")
        .query(&[("query", "livekit_ingress_active")])
        .send()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let ingress_data: serde_json::Value = ingress_query.json().await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let active_ingress = ingress_data["data"]["result"][0]["value"][1]
        .as_str()
        .unwrap_or("0")
        .parse()
        .unwrap_or(0);

    Ok(Json(MetricsSummary {
        total_rooms,
        total_participants,
        active_egress,
        active_ingress,
    }))
}

pub async fn get_recent_metrics(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
) -> Result<Json<Vec<MetricResponse>>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let metrics = Metrics::find().all(&state.db).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let response = metrics.into_iter().map(|m| MetricResponse {
        name: m.metric_name,
        value: m.metric_value.map(|v| v.to_string().parse().unwrap_or(0.0)),
        labels: m.labels,
        timestamp: m.timestamp.to_string(),
    }).collect();

    Ok(Json(response))
}