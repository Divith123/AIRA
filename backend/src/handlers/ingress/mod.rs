use axum::{extract::{State, Path}, http::StatusCode, Json};
use sea_orm::{ActiveModelTrait, Set};

use crate::entity::{ingress as db_ingress};
use crate::models::ingress::*;
use crate::utils::jwt::Claims;
use crate::AppState;
use livekit_protocol::IngressInput;

pub async fn list_ingress(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
) -> Result<Json<Vec<IngressResponse>>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let items = state.lk_service.list_ingress(None)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let response = items.into_iter().map(|i| IngressResponse {
        ingress_id: i.ingress_id,
        name: i.name,
        stream_key: i.stream_key,
        url: i.url,
        input_type: i.input_type as i32,
        room_name: i.room_name,
        participant_identity: i.participant_identity,
        participant_name: i.participant_name,
        reusable: i.reusable,
        state: i.state.map(|s| IngressStateResponse {
            status: s.status.to_string(),
            error: s.error,
            room_id: s.room_id,
            started_at: s.started_at,
            ended_at: s.ended_at,
            resource_id: s.resource_id,
            tracks: vec![], // Future: Map tracks if needed
        }),
    }).collect();

    Ok(Json(response))
}

pub async fn create_ingress(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    Json(req): Json<CreateIngressRequest>,
) -> Result<Json<IngressResponse>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let input_type = match req.input_type {
        0 => IngressInput::RtmpInput,
        1 => IngressInput::WhipInput,
        2 => IngressInput::UrlInput,
        _ => IngressInput::RtmpInput,
    };

    let ingress = state.lk_service.create_ingress(input_type, &req.name, &req.room_name)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Store in DB
    let ingress_model = db_ingress::ActiveModel {
        name: Set(req.name.clone()),
        input_type: Set(req.input_type.to_string()),
        room_name: Set(Some(req.room_name.clone())),
        stream_key: Set(Some(ingress.stream_key.clone())),
        url: Set(Some(ingress.url.clone())),
        ..Default::default()
    };

    let _ = ingress_model.insert(&state.db).await;

    Ok(Json(IngressResponse {
        ingress_id: ingress.ingress_id,
        name: ingress.name,
        stream_key: ingress.stream_key,
        url: ingress.url,
        input_type: req.input_type,
        room_name: req.room_name,
        participant_identity: ingress.participant_identity,
        participant_name: ingress.participant_name,
        reusable: ingress.reusable,
        state: None,
    }))
}

pub async fn create_url_ingress(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    Json(req): Json<CreateUrlIngressRequest>,
) -> Result<Json<IngressResponse>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let ingress = state.lk_service.create_url_ingress(
        &req.url,
        &req.name,
        &req.room_name,
        &req.participant_identity,
        &req.participant_name
    )
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Store in DB
    let ingress_model = db_ingress::ActiveModel {
        name: Set(req.name.clone()),
        input_type: Set("url".to_string()),
        room_name: Set(Some(req.room_name.clone())),
        url: Set(Some(ingress.url.clone())),
        ..Default::default()
    };

    let _ = ingress_model.insert(&state.db).await;

    Ok(Json(IngressResponse {
        ingress_id: ingress.ingress_id,
        name: ingress.name,
        stream_key: ingress.stream_key,
        url: ingress.url,
        input_type: 2, // URL = 2
        room_name: req.room_name,
        participant_identity: ingress.participant_identity,
        participant_name: ingress.participant_name,
        reusable: ingress.reusable,
        state: None,
    }))
}

pub async fn delete_ingress(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    Path(ingress_id): Path<String>,
) -> Result<StatusCode, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    state.lk_service.delete_ingress(&ingress_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::OK)
}
