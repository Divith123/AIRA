use axum::{extract::State, http::StatusCode, Json};

use crate::models::livekit::{CreateRoomRequest, RoomResponse, ParticipantResponse};
use crate::utils::jwt::Claims;
use crate::AppState;

pub async fn create_room(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    Json(req): Json<CreateRoomRequest>,
) -> Result<Json<RoomResponse>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let room = state.lk_service.create_room(
        &req.name, 
        req.empty_timeout.unwrap_or(0), 
        req.max_participants.unwrap_or(0)
    )
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(RoomResponse {
        sid: room.sid,
        name: room.name,
        empty_timeout: room.empty_timeout,
        max_participants: room.max_participants,
        creation_time: room.creation_time as i64,
        num_participants: room.num_participants,
        active_recording: room.active_recording,
    }))
}

pub async fn list_rooms(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
) -> Result<Json<Vec<RoomResponse>>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let rooms = state.lk_service.list_rooms()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let response = rooms.into_iter().map(|room| RoomResponse {
        sid: room.sid,
        name: room.name,
        empty_timeout: room.empty_timeout,
        max_participants: room.max_participants,
        creation_time: room.creation_time as i64,
        num_participants: room.num_participants,
        active_recording: room.active_recording,
    }).collect();

    Ok(Json(response))
}

pub async fn delete_room(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    axum::extract::Path(room_name): axum::extract::Path<String>,
) -> Result<StatusCode, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    state.lk_service.delete_room(&room_name)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

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

    let participants = state.lk_service.list_participants(&room_name)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let response = participants.into_iter().map(|p| ParticipantResponse {
        sid: p.sid,
        identity: p.identity,
        state: p.state.to_string(), 
        joined_at: p.joined_at as u64,
        name: Some(p.name),
    }).collect();

    Ok(Json(response))
}

pub async fn remove_participant(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    axum::extract::Path((room_name, identity)): axum::extract::Path<(String, String)>,
) -> Result<StatusCode, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    state.lk_service.remove_participant(&room_name, &identity)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::NO_CONTENT)
}

pub async fn get_livekit_stats(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
) -> Result<Json<crate::models::livekit::LiveKitStatsResponse>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let rooms = state.lk_service.list_rooms()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let active_rooms = rooms.len() as i32;
    let total_participants = rooms.iter().map(|r| r.num_participants as i32).sum();

    Ok(Json(crate::models::livekit::LiveKitStatsResponse {
        active_rooms,
        total_participants,
        status: "healthy".to_string(),
    }))
}
