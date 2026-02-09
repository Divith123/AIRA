use axum::{extract::State, http::StatusCode, Json};
use sea_orm::{ActiveModelTrait, EntityTrait, Set};
use reqwest;
use serde_json::json;
use std::env;
use chrono::{Utc, Duration};

use crate::entity::{rooms, prelude::*};
use crate::models::livekit::{CreateRoomRequest, RoomResponse, ParticipantResponse, ListRoomsResponse};
use crate::utils::jwt::{Claims, create_livekit_api_jwt};
use crate::AppState;

pub async fn create_room(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    Json(req): Json<CreateRoomRequest>,
) -> Result<Json<RoomResponse>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let client = reqwest::Client::new();
    let livekit_url = env::var("LIVEKIT_URL").unwrap_or_else(|_| "http://localhost:7880".to_string());
    let api_key = env::var("LIVEKIT_API_KEY").expect("LIVEKIT_API_KEY must be set");
    let api_secret = env::var("LIVEKIT_API_SECRET").expect("LIVEKIT_API_SECRET must be set");

    let video_grants = json!({
        "roomCreate": true,
        "roomJoin": true,
        "roomAdmin": true,
        "roomRecord": true,
        "roomList": true
    });
    let ingress_grants = json!({});
    let egress_grants = json!({});
    let sip_grants = json!({});

    let token = create_livekit_api_jwt(video_grants, ingress_grants, egress_grants, sip_grants)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let auth_header = format!("Bearer {}", token);

    let url = format!("{}/twirp/livekit.RoomService/CreateRoom", livekit_url);
    let response = client
        .post(&url)
        .header("Authorization", auth_header)
        .header("Content-Type", "application/json")
        .json(&req)
        .send()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if !response.status().is_success() {
        return Err(StatusCode::from_u16(response.status().as_u16()).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR));
    }

    let room: RoomResponse = response.json().await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Store in DB
    let room_model = rooms::ActiveModel {
        room_name: Set(req.name.clone()),
        room_sid: Set(Some(room.sid.clone())),
        max_participants: Set(Some(room.max_participants as i32)),
        empty_timeout: Set(Some(room.empty_timeout as i32)),
        ..Default::default()
    };

    let _result = room_model.insert(&state.db).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(room))
}

pub async fn list_rooms(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
) -> Result<Json<Vec<RoomResponse>>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let client = reqwest::Client::new();
    let livekit_url = env::var("LIVEKIT_URL").unwrap_or_else(|_| "http://localhost:7880".to_string());

    let video_grants = json!({
        "roomCreate": true,
        "roomJoin": true,
        "roomAdmin": true,
        "roomRecord": true,
        "roomList": true
    });
    let ingress_grants = json!({});
    let egress_grants = json!({});
    let sip_grants = json!({});

    let token = create_livekit_api_jwt(video_grants, ingress_grants, egress_grants, sip_grants)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let auth_header = format!("Bearer {}", token);

    let url = format!("{}/twirp/livekit.RoomService/ListRooms", livekit_url);
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

    let list_response: ListRoomsResponse = response.json().await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(list_response.rooms))
}

pub async fn delete_room(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    axum::extract::Path(room_name): axum::extract::Path<String>,
) -> Result<StatusCode, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let client = reqwest::Client::new();
    let livekit_url = env::var("LIVEKIT_URL").unwrap_or_else(|_| "http://localhost:7880".to_string());

    let video_grants = json!({
        "roomCreate": true,
        "roomJoin": true,
        "roomAdmin": true,
        "roomRecord": true,
        "roomList": true
    });
    let ingress_grants = json!({});
    let egress_grants = json!({});
    let sip_grants = json!({});

    let token = create_livekit_api_jwt(video_grants, ingress_grants, egress_grants, sip_grants)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let auth_header = format!("Bearer {}", token);

    let url = format!("{}/twirp/livekit.RoomService/DeleteRoom", livekit_url);
    let response = client
        .post(&url)
        .header("Authorization", auth_header)
        .header("Content-Type", "application/json")
        .json(&serde_json::json!({"room": room_name}))
        .send()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if !response.status().is_success() {
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    }

    Ok(StatusCode::NO_CONTENT)
}

pub async fn list_participants(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    axum::extract::Path(room_name): axum::extract::Path<String>,
) -> Result<Json<Vec<ParticipantResponse>>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let client = reqwest::Client::new();
    let livekit_url = env::var("LIVEKIT_URL").unwrap_or_else(|_| "http://localhost:7880".to_string());

    let video_grants = json!({
        "roomCreate": true,
        "roomJoin": true,
        "roomAdmin": true,
        "roomRecord": true,
        "roomList": true
    });
    let ingress_grants = json!({});
    let egress_grants = json!({});
    let sip_grants = json!({});

    let token = create_livekit_api_jwt(video_grants, ingress_grants, egress_grants, sip_grants)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let auth_header = format!("Bearer {}", token);

    let url = format!("{}/twirp/livekit.RoomService/ListParticipants", livekit_url);
    let response = client
        .post(&url)
        .header("Authorization", auth_header)
        .header("Content-Type", "application/json")
        .json(&serde_json::json!({"room": room_name}))
        .send()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if !response.status().is_success() {
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    }

    let participants: Vec<ParticipantResponse> = response.json().await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(participants))
}

pub async fn remove_participant(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    axum::extract::Path((room_name, identity)): axum::extract::Path<(String, String)>,
) -> Result<StatusCode, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let client = reqwest::Client::new();
    let livekit_url = env::var("LIVEKIT_URL").unwrap_or_else(|_| "http://localhost:7880".to_string());

    let video_grants = json!({
        "roomCreate": true,
        "roomJoin": true,
        "roomAdmin": true,
        "roomRecord": true,
        "roomList": true
    });
    let ingress_grants = json!({});
    let egress_grants = json!({});
    let sip_grants = json!({});

    let token = create_livekit_api_jwt(video_grants, ingress_grants, egress_grants, sip_grants)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let auth_header = format!("Bearer {}", token);

    let url = format!("{}/twirp/livekit.RoomService/RemoveParticipant", livekit_url);
    let response = client
        .post(&url)
        .header("Authorization", auth_header)
        .header("Content-Type", "application/json")
        .json(&serde_json::json!({"room": room_name, "identity": identity}))
        .send()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if !response.status().is_success() {
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    }

    Ok(StatusCode::NO_CONTENT)
}