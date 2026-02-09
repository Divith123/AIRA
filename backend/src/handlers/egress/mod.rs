use axum::{extract::State, http::StatusCode, Json};
use sea_orm::{ActiveModelTrait, EntityTrait, Set};
use reqwest;
use serde_json::json;
use std::env;
use base64::{engine::general_purpose::STANDARD, Engine};

use crate::entity::{egress as db_egress, prelude::*};
use crate::models::egress::{CreateEgressRequest, EgressResponse};
use crate::utils::jwt::{Claims, create_livekit_api_jwt};
use crate::AppState;

fn get_livekit_url() -> String {
    env::var("LIVEKIT_URL").unwrap_or_else(|_| "http://localhost:7880".to_string())
}

fn get_egress_url() -> String {
    env::var("LIVEKIT_EGRESS_URL").unwrap_or_else(|_| "http://localhost:8083".to_string())
}

fn get_auth_header() -> String {
    let api_key = env::var("LIVEKIT_API_KEY").expect("LIVEKIT_API_KEY must be set");
    let api_secret = env::var("LIVEKIT_API_SECRET").expect("LIVEKIT_API_SECRET must be set");
    format!("Basic {}", STANDARD.encode(format!("{}:{}", api_key, api_secret)))
}

pub async fn create_egress(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    Json(req): Json<CreateEgressRequest>,
) -> Result<Json<EgressResponse>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let client = reqwest::Client::new();
    let egress_url = get_egress_url();

    let video_grants = json!({});
    let ingress_grants = json!({});
    let egress_grants = json!({
        "room": req.room_name.clone(),
        "can_publish": true
    });
    let sip_grants = json!({});

    let token = create_livekit_api_jwt(json!({}), json!({}), json!({"admin": true}), json!({}))
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let auth_header = format!("Bearer {}", token);

    let url = format!("{}/egress/start", egress_url);
    let response = client
        .post(&url)
        .header("Authorization", auth_header)
        .header("Content-Type", "application/json")
        .json(&req)
        .send()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if !response.status().is_success() {
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    }

    let egress: EgressResponse = response.json().await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Store in DB
    let egress_model = db_egress::ActiveModel {
        name: Set(req.room_name.clone()),
        egress_type: Set("stream".to_string()), // Default type
        room_name: Set(Some(req.room_name)),
        output_type: Set("rtmp".to_string()), // Default output type
        ..Default::default()
    };

    let _result = egress_model.insert(&state.db).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(egress))
}

pub async fn list_egress(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
) -> Result<Json<Vec<EgressResponse>>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let client = reqwest::Client::new();
    let egress_url = get_egress_url();

    let token = create_livekit_api_jwt(json!({}), json!({}), json!({"admin": true}), json!({}))
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let auth_header = format!("Bearer {}", token);

    let url = format!("{}/egress/list", egress_url);
    let response = client
        .post(&url)
        .header("Authorization", auth_header)
        .header("Content-Type", "application/json")
        .json(&serde_json::json!({}))
        .send()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if !response.status().is_success() {
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    }

    let egresses: Vec<EgressResponse> = match response.json().await {
        Ok(data) => data,
        Err(_) => {
            // If parsing fails, return empty list
            vec![]
        }
    };

    Ok(Json(egresses))
}

pub async fn stop_egress(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    axum::extract::Path(egress_id): axum::extract::Path<String>,
) -> Result<StatusCode, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let client = reqwest::Client::new();
    let egress_url = get_egress_url();

    let token = create_livekit_api_jwt(json!({}), json!({}), json!({"admin": true}), json!({}))
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let auth_header = format!("Bearer {}", token);

    let url = format!("{}/egress/stop", egress_url);
    let response = client
        .post(&url)
        .header("Authorization", auth_header)
        .header("Content-Type", "application/json")
        .json(&serde_json::json!({"egress_id": egress_id}))
        .send()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if !response.status().is_success() {
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    }

    Ok(StatusCode::NO_CONTENT)
}