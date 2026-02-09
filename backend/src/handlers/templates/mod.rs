use axum::{extract::{State, Path}, http::StatusCode, Json};
use sea_orm::{ActiveModelTrait, EntityTrait, Set, QueryOrder};
use uuid::Uuid;
use chrono::Utc;

use crate::entity::{room_templates, layout_templates, prelude::*};
use crate::models::templates::{
    RoomTemplateResponse, CreateRoomTemplateRequest,
    LayoutTemplateResponse, CreateLayoutTemplateRequest
};
use crate::utils::jwt::Claims;
use crate::AppState;

// Room Templates

pub async fn list_room_templates(
    State(state): State<AppState>,
    axum::extract::Extension(_claims): axum::extract::Extension<Claims>,
) -> Result<Json<Vec<RoomTemplateResponse>>, StatusCode> {
    let list = RoomTemplates::find()
        .order_by_desc(room_templates::Column::CreatedAt)
        .all(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let response = list.into_iter().map(|t| RoomTemplateResponse {
        id: t.id,
        name: t.name,
        description: t.description,
        config: t.config,
        is_default: t.is_default,
        created_at: t.created_at.map(|c| c.to_string()).unwrap_or_default(),
    }).collect();

    Ok(Json(response))
}

pub async fn create_room_template(
    State(state): State<AppState>,
    axum::extract::Extension(_claims): axum::extract::Extension<Claims>,
    Json(payload): Json<CreateRoomTemplateRequest>,
) -> Result<Json<RoomTemplateResponse>, StatusCode> {
    let new_template = room_templates::ActiveModel {
        id: Set(Uuid::new_v4().to_string()),
        name: Set(payload.name),
        description: Set(payload.description),
        config: Set(payload.config.to_string()),
        is_default: Set(payload.is_default.unwrap_or(false)),
        created_at: Set(Some(Utc::now().naive_utc())),
        ..Default::default()
    };

    let saved = new_template.insert(&state.db).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(RoomTemplateResponse {
        id: saved.id,
        name: saved.name,
        description: saved.description,
        config: saved.config,
        is_default: saved.is_default,
        created_at: saved.created_at.map(|c| c.to_string()).unwrap_or_default(),
    }))
}

// Layout Templates

pub async fn list_layout_templates(
    State(state): State<AppState>,
    axum::extract::Extension(_claims): axum::extract::Extension<Claims>,
) -> Result<Json<Vec<LayoutTemplateResponse>>, StatusCode> {
    let list = LayoutTemplates::find()
        .order_by_desc(layout_templates::Column::CreatedAt)
        .all(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let response = list.into_iter().map(|t| LayoutTemplateResponse {
        id: t.id,
        name: t.name,
        layout_type: t.layout_type,
        config: t.config,
        is_default: t.is_default,
        created_at: t.created_at.map(|c| c.to_string()).unwrap_or_default(),
    }).collect();

    Ok(Json(response))
}

pub async fn create_layout_template(
    State(state): State<AppState>,
    axum::extract::Extension(_claims): axum::extract::Extension<Claims>,
    Json(payload): Json<CreateLayoutTemplateRequest>,
) -> Result<Json<LayoutTemplateResponse>, StatusCode> {
    let new_template = layout_templates::ActiveModel {
        id: Set(Uuid::new_v4().to_string()),
        name: Set(payload.name),
        layout_type: Set(payload.layout_type),
        config: Set(payload.config.map(|c| c.to_string())),
        is_default: Set(payload.is_default.unwrap_or(false)),
        created_at: Set(Some(Utc::now().naive_utc())),
        ..Default::default()
    };

    let saved = new_template.insert(&state.db).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(LayoutTemplateResponse {
        id: saved.id,
        name: saved.name,
        layout_type: saved.layout_type,
        config: saved.config,
        is_default: saved.is_default,
        created_at: saved.created_at.map(|c| c.to_string()).unwrap_or_default(),
    }))
}
