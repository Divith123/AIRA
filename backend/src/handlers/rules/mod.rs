use axum::{extract::{State, Path}, http::StatusCode, Json};
use sea_orm::{ActiveModelTrait, EntityTrait, Set, QueryOrder};
use uuid::Uuid;
use chrono::Utc;

use crate::entity::{auto_recording_rules, dispatch_rules, prelude::*};
use crate::models::rules::{
    AutoRecordingRuleResponse, CreateAutoRecordingRuleRequest,
    DispatchRuleResponse, CreateDispatchRuleRequest
};
use crate::utils::jwt::Claims;
use crate::AppState;

// Auto Recording Rules

pub async fn list_auto_recording_rules(
    State(state): State<AppState>,
    axum::extract::Extension(_claims): axum::extract::Extension<Claims>,
) -> Result<Json<Vec<AutoRecordingRuleResponse>>, StatusCode> {
    let list = AutoRecordingRules::find()
        .all(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let response = list.into_iter().map(|r| AutoRecordingRuleResponse {
        id: r.id,
        name: r.name,
        room_pattern: r.room_pattern,
        egress_type: r.egress_type,
        is_active: r.is_active,
        created_at: r.created_at.map(|t| t.to_string()).unwrap_or_default(),
    }).collect();

    Ok(Json(response))
}

pub async fn create_auto_recording_rule(
    State(state): State<AppState>,
    axum::extract::Extension(_claims): axum::extract::Extension<Claims>,
    Json(payload): Json<CreateAutoRecordingRuleRequest>,
) -> Result<Json<AutoRecordingRuleResponse>, StatusCode> {
    let new_rule = auto_recording_rules::ActiveModel {
        id: Set(Uuid::new_v4().to_string()),
        name: Set(payload.name),
        room_pattern: Set(payload.room_pattern),
        egress_type: Set(payload.egress_type),
        is_active: Set(payload.is_active.unwrap_or(true)),
        created_at: Set(Some(Utc::now().naive_utc())),
        ..Default::default()
    };

    let saved = new_rule.insert(&state.db).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(AutoRecordingRuleResponse {
        id: saved.id,
        name: saved.name,
        room_pattern: saved.room_pattern,
        egress_type: saved.egress_type,
        is_active: saved.is_active,
        created_at: saved.created_at.map(|t| t.to_string()).unwrap_or_default(),
    }))
}

pub async fn delete_auto_recording_rule(
    State(state): State<AppState>,
    Path(id): Path<String>,
    axum::extract::Extension(_claims): axum::extract::Extension<Claims>,
) -> Result<StatusCode, StatusCode> {
    AutoRecordingRules::delete_by_id(id).exec(&state.db).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(StatusCode::NO_CONTENT)
}

// Dispatch Rules

pub async fn list_dispatch_rules(
    State(state): State<AppState>,
    axum::extract::Extension(_claims): axum::extract::Extension<Claims>,
) -> Result<Json<Vec<DispatchRuleResponse>>, StatusCode> {
    let list = DispatchRules::find()
        .all(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let response = list.into_iter().map(|r| DispatchRuleResponse {
        id: r.id,
        name: r.name,
        rule_type: r.rule_type,
        trunk_id: r.trunk_id,
        agent_id: r.agent_id,
        is_active: r.is_active,
        created_at: r.created_at.map(|t| t.to_string()).unwrap_or_default(),
    }).collect();

    Ok(Json(response))
}

pub async fn create_dispatch_rule(
    State(state): State<AppState>,
    axum::extract::Extension(_claims): axum::extract::Extension<Claims>,
    Json(payload): Json<CreateDispatchRuleRequest>,
) -> Result<Json<DispatchRuleResponse>, StatusCode> {
    let new_rule = dispatch_rules::ActiveModel {
        id: Set(Uuid::new_v4().to_string()),
        name: Set(payload.name),
        rule_type: Set(payload.rule_type),
        trunk_id: Set(payload.trunk_id),
        agent_id: Set(payload.agent_id),
        is_active: Set(true),
        created_at: Set(Some(Utc::now().naive_utc())),
        ..Default::default()
    };

    let saved = new_rule.insert(&state.db).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(DispatchRuleResponse {
        id: saved.id,
        name: saved.name,
        rule_type: saved.rule_type,
        trunk_id: saved.trunk_id,
        agent_id: saved.agent_id,
        is_active: saved.is_active,
        created_at: saved.created_at.map(|t| t.to_string()).unwrap_or_default(),
    }))
}

pub async fn delete_dispatch_rule(
    State(state): State<AppState>,
    Path(id): Path<String>,
    axum::extract::Extension(_claims): axum::extract::Extension<Claims>,
) -> Result<StatusCode, StatusCode> {
    DispatchRules::delete_by_id(id).exec(&state.db).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(StatusCode::NO_CONTENT)
}
