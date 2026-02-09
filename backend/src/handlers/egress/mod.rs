use axum::{extract::State, http::StatusCode, Json};
use sea_orm::{ActiveModelTrait, Set};
use crate::entity::egress as db_egress;
use crate::models::egress::*;
use crate::utils::jwt::Claims;
use crate::AppState;

pub async fn list_egress(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
) -> Result<Json<Vec<EgressResponse>>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let egress_list = state.lk_service.list_egress(None).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let response = egress_list.into_iter().map(|e| EgressResponse {
        egress_id: e.egress_id,
        room_id: Some(e.room_id),
        room_name: e.room_name,
        status: e.status.to_string(),
        started_at: if e.started_at > 0 { Some(e.started_at) } else { None },
        ended_at: if e.ended_at > 0 { Some(e.ended_at) } else { None },
        error: if !e.error.is_empty() { Some(e.error) } else { None },
    }).collect();

    Ok(Json(response))
}

pub async fn start_room_composite(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    Json(req): Json<RoomCompositeEgressRequest>,
) -> Result<Json<EgressResponse>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    // Map RoomCompositeEgressRequest to LiveKit types
    let outputs = vec![]; // Need to map file/stream outputs if requested
    let options = livekit_api::services::egress::RoomCompositeOptions::default();

    let egress = state.lk_service.start_room_composite_egress(&req.room_name, outputs, options).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Store in DB
    let egress_model = db_egress::ActiveModel {
        name: Set(req.room_name.clone()),
        egress_type: Set("room_composite".to_string()),
        room_name: Set(Some(req.room_name)),
        output_type: Set(if req.stream.is_some() { "stream".to_string() } else { "file".to_string() }),
        ..Default::default()
    };

    let _ = egress_model.insert(&state.db).await;

    Ok(Json(EgressResponse {
        egress_id: egress.egress_id,
        room_id: Some(egress.room_id),
        room_name: egress.room_name,
        status: egress.status.to_string(),
        started_at: if egress.started_at > 0 { Some(egress.started_at) } else { None },
        ended_at: if egress.ended_at > 0 { Some(egress.ended_at) } else { None },
        error: if !egress.error.is_empty() { Some(egress.error) } else { None },
    }))
}

pub async fn start_participant_egress(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    Json(req): Json<ParticipantEgressRequest>,
) -> Result<Json<EgressResponse>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let outputs = vec![]; // Map outputs if provided in request
    let options = livekit_api::services::egress::ParticipantEgressOptions::default();

    let egress = state.lk_service.start_participant_egress(&req.room_name, &req.identity, outputs, options).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(EgressResponse {
        egress_id: egress.egress_id,
        room_id: Some(egress.room_id),
        room_name: egress.room_name,
        status: egress.status.to_string(),
        started_at: if egress.started_at > 0 { Some(egress.started_at) } else { None },
        ended_at: if egress.ended_at > 0 { Some(egress.ended_at) } else { None },
        error: if !egress.error.is_empty() { Some(egress.error) } else { None },
    }))
}

pub async fn stop_egress(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    Json(payload): Json<StopEgressRequest>,
) -> Result<Json<EgressResponse>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let egress = state.lk_service.stop_egress(&payload.egress_id).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(EgressResponse {
        egress_id: egress.egress_id,
        room_id: Some(egress.room_id),
        room_name: egress.room_name,
        status: egress.status.to_string(),
        started_at: if egress.started_at > 0 { Some(egress.started_at) } else { None },
        ended_at: if egress.ended_at > 0 { Some(egress.ended_at) } else { None },
        error: if !egress.error.is_empty() { Some(egress.error) } else { None },
    }))
}

pub async fn start_web_egress(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    Json(req): Json<WebEgressRequest>,
) -> Result<Json<EgressResponse>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let outputs = vec![]; 
    let options = livekit_api::services::egress::WebOptions::default();

    let egress = state.lk_service.start_web_egress(&req.url, outputs, options).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(EgressResponse {
        egress_id: egress.egress_id,
        room_id: Some(egress.room_id),
        room_name: egress.room_name,
        status: egress.status.to_string(),
        started_at: if egress.started_at > 0 { Some(egress.started_at) } else { None },
        ended_at: if egress.ended_at > 0 { Some(egress.ended_at) } else { None },
        error: if !egress.error.is_empty() { Some(egress.error) } else { None },
    }))
}

pub async fn start_track_egress(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    Json(req): Json<TrackEgressRequest>,
) -> Result<Json<EgressResponse>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let output = livekit_api::services::egress::EgressOutput::File(livekit_protocol::EncodedFileOutput {
        filepath: format!("{}.mp4", req.track_sid),
        disable_manifest: true,
        ..Default::default()
    });

    let egress = state.lk_service.start_track_egress(&req.room_name, &req.track_sid, output).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(EgressResponse {
        egress_id: egress.egress_id,
        room_id: Some(egress.room_id),
        room_name: egress.room_name,
        status: egress.status.to_string(),
        started_at: if egress.started_at > 0 { Some(egress.started_at) } else { None },
        ended_at: if egress.ended_at > 0 { Some(egress.ended_at) } else { None },
        error: if !egress.error.is_empty() { Some(egress.error) } else { None },
    }))
}

pub async fn start_image_egress(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    Json(req): Json<ImageEgressRequest>,
) -> Result<Json<EgressResponse>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let outputs = vec![livekit_api::services::egress::EgressOutput::Image(livekit_protocol::ImageOutput {
        filename_prefix: format!("{}-snapshot", req.room_name),
        capture_interval: 10,
        ..Default::default()
    })];
    let options = livekit_api::services::egress::TrackCompositeOptions::default();

    let egress = state.lk_service.start_track_composite_egress(&req.room_name, outputs, options).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(EgressResponse {
        egress_id: egress.egress_id,
        room_id: Some(egress.room_id),
        room_name: egress.room_name,
        status: egress.status.to_string(),
        started_at: if egress.started_at > 0 { Some(egress.started_at) } else { None },
        ended_at: if egress.ended_at > 0 { Some(egress.ended_at) } else { None },
        error: if !egress.error.is_empty() { Some(egress.error) } else { None },
    }))
}

// compatibility stub for create_egress if needed by routes
pub async fn create_egress(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    Json(req): Json<RoomCompositeEgressRequest>,
) -> Result<Json<EgressResponse>, StatusCode> {
    start_room_composite(State(state), axum::extract::Extension(claims), Json(req)).await
}