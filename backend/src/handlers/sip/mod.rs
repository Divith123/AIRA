use axum::{extract::State, http::StatusCode, Json};
use reqwest::Client;
use sea_orm::{ActiveModelTrait, EntityTrait, Set};
use serde_json::json;
use std::env;
use base64::{engine::general_purpose::STANDARD, Engine};
use uuid;

use crate::entity::{sip as db_sip, prelude::*};
use crate::models::sip::{CreateSipTrunkRequest, SipTrunkResponse, CreateSipCallRequest, SipCallResponse};
use crate::utils::jwt::{Claims, create_livekit_api_jwt};
use crate::AppState;

fn get_sip_url() -> String {
    env::var("LIVEKIT_SIP_URL").unwrap_or_else(|_| "http://localhost:8082".to_string())
}

fn get_auth_header() -> String {
    let api_key = env::var("LIVEKIT_API_KEY").expect("LIVEKIT_API_KEY must be set");
    let api_secret = env::var("LIVEKIT_API_SECRET").expect("LIVEKIT_API_SECRET must be set");
    format!("Basic {}", STANDARD.encode(format!("{}:{}", api_key, api_secret)))
}

pub async fn create_sip_trunk(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    Json(req): Json<CreateSipTrunkRequest>,
) -> Result<Json<SipTrunkResponse>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let video_grants = json!({});
    let ingress_grants = json!({});
    let egress_grants = json!({});
    let sip_grants = json!({
        "admin": true
    });

    let token = create_livekit_api_jwt(video_grants, ingress_grants, egress_grants, sip_grants)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let auth_header = format!("Bearer {}", token);

    let response = state.http_client
        .post(&format!("{}/sip/create_trunk", get_sip_url()))
        .header("Authorization", auth_header)
        .json(&json!({
            "name": req.name,
            "outbound_address": req.outbound_address,
            "outbound_username": req.outbound_username,
            "outbound_password": req.outbound_password,
            "phone_numbers": req.phone_numbers
        }))
        .send()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if !response.status().is_success() {
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    }

    let trunk_response: SipTrunkResponse = response
        .json()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Store in DB
    let sip_model = db_sip::ActiveModel {
        trunk_id: Set(Some(trunk_response.sip_trunk_id.clone())),
        name: Set(req.name),
        phone_number: Set(req.phone_numbers.first().cloned()),
        ..Default::default()
    };

    let _result = sip_model.insert(&state.db).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(trunk_response))
}

pub async fn list_sip_trunks(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
) -> Result<Json<Vec<SipTrunkResponse>>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let video_grants = json!({});
    let ingress_grants = json!({});
    let egress_grants = json!({});
    let sip_grants = json!({
        "admin": true
    });

    let token = create_livekit_api_jwt(video_grants, ingress_grants, egress_grants, sip_grants)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let auth_header = format!("Bearer {}", token);

    let response = state.http_client
        .post(&format!("{}/sip/list_trunks", get_sip_url()))
        .header("Authorization", auth_header)
        .json(&json!({}))
        .send()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if !response.status().is_success() {
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    }

    let trunks: Vec<SipTrunkResponse> = match response.json().await {
        Ok(data) => data,
        Err(_) => {
            // If parsing fails, return empty list
            vec![]
        }
    };

    Ok(Json(trunks))
}

pub async fn create_sip_call(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    Json(req): Json<CreateSipCallRequest>,
) -> Result<Json<SipCallResponse>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let video_grants = json!({});
    let ingress_grants = json!({});
    let egress_grants = json!({});
    let sip_grants = json!({
        "admin": true
    });

    let token = create_livekit_api_jwt(video_grants, ingress_grants, egress_grants, sip_grants)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let auth_header = format!("Bearer {}", token);

    let response = state.http_client
        .post(&format!("{}/sip/create_call", get_sip_url()))
        .header("Authorization", auth_header)
        .json(&json!({
            "trunk_id": req.trunk_id,
            "to_number": req.to_number,
            "from_number": req.from_number,
            "room_name": req.room_name
        }))
        .send()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if !response.status().is_success() {
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    }

    let call_response: SipCallResponse = response
        .json()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(call_response))
}