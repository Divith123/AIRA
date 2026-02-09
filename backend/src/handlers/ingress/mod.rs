use axum::{extract::State, http::StatusCode, Json};
use sea_orm::{ActiveModelTrait, EntityTrait, Set};
use reqwest;
use serde_json::json;
use std::env;
use base64::{engine::general_purpose::STANDARD, Engine};

use crate::entity::{ingress as db_ingress, prelude::*};
use crate::models::ingress::{CreateIngressRequest, IngressResponse};
use crate::utils::jwt::{Claims, create_livekit_api_jwt};
use crate::AppState;

fn get_livekit_url() -> String {
    env::var("LIVEKIT_URL").unwrap_or_else(|_| "http://localhost:7880".to_string())
}

fn get_ingress_url() -> String {
    env::var("LIVEKIT_INGRESS_URL").unwrap_or_else(|_| "http://localhost:8081".to_string())
}

fn get_auth_header() -> String {
    let api_key = env::var("LIVEKIT_API_KEY").expect("LIVEKIT_API_KEY must be set");
    let api_secret = env::var("LIVEKIT_API_SECRET").expect("LIVEKIT_API_SECRET must be set");
    format!("Basic {}", STANDARD.encode(format!("{}:{}", api_key, api_secret)))
}

pub async fn create_ingress(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    Json(req): Json<CreateIngressRequest>,
) -> Result<Json<IngressResponse>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let client = reqwest::Client::new();
    let ingress_url = get_ingress_url();

    let video_grants = json!({});
    let ingress_grants = json!({"admin": true});
    let egress_grants = json!({});
    let sip_grants = json!({});

    let token = create_livekit_api_jwt(video_grants, ingress_grants, egress_grants, sip_grants)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let auth_header = format!("Bearer {}", token);

    let url = format!("{}/ingress/create", ingress_url);
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

    let ingress: IngressResponse = response.json().await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Store in DB
    let ingress_model = db_ingress::ActiveModel {
        name: Set(req.name.clone()),
        input_type: Set(req.input_type),
        room_name: Set(Some(req.room_name)),
        stream_key: Set(ingress.stream_key.clone()),
        url: Set(ingress.url.clone()),
        ..Default::default()
    };

    let _result = ingress_model.insert(&state.db).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(ingress))
}

pub async fn list_ingress(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
) -> Result<Json<Vec<IngressResponse>>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let client = reqwest::Client::new();
    let ingress_url = get_ingress_url();

    let video_grants = json!({});
    let ingress_grants = json!({"admin": true});
    let egress_grants = json!({});
    let sip_grants = json!({});

    let token = create_livekit_api_jwt(video_grants, ingress_grants, egress_grants, sip_grants)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let auth_header = format!("Bearer {}", token);

    let url = format!("{}/ingress/list", ingress_url);
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

    let ingresses: Vec<IngressResponse> = response.json().await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(ingresses))
}