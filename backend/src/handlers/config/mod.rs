use axum::{extract::State, http::StatusCode, Json};
use sea_orm::{ActiveModelTrait, EntityTrait, Set, ColumnTrait, QueryFilter};
use std::fs;
use tokio::process::Command;
use serde_yaml;

use crate::entity::{configs, api_keys, prelude::*};
use crate::models::config::{ConfigUpdateRequest, ConfigResponse, ApplyConfigRequest};
use crate::utils::jwt::Claims;
use crate::AppState;

pub async fn update_config(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    Json(req): Json<ConfigUpdateRequest>,
) -> Result<Json<ConfigResponse>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let config = configs::ActiveModel {
        service_name: Set(req.service_name),
        config_key: Set(req.config_key),
        config_value: Set(Some(req.config_value)),
        ..Default::default()
    };

    let result = config.insert(&state.db).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(ConfigResponse {
        service_name: result.service_name,
        config_key: result.config_key,
        config_value: result.config_value,
        is_active: result.is_active,
    }))
}

pub async fn apply_config(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    Json(_req): Json<ApplyConfigRequest>,
) -> Result<Json<String>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    // Get all active configs
    let configs = Configs::find()
        .filter(configs::Column::IsActive.eq(true))
        .all(&state.db).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Get all active API keys
    let api_keys_list = ApiKeys::find()
        .filter(api_keys::Column::IsActive.eq(true))
        .all(&state.db).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Generate livekit.yaml
    let mut yaml_config = serde_yaml::Mapping::new();

    // Add API keys
    let mut keys = Vec::new();
    for key in api_keys_list {
        let mut key_map = serde_yaml::Mapping::new();
        key_map.insert("key".into(), key.key.into());
        if let Some(secret) = key.secret {
            key_map.insert("secret".into(), secret.into());
        }
        keys.push(key_map);
    }
    yaml_config.insert("keys".into(), keys.into());

    // Add other configs
    for config in configs {
        if let Some(value) = config.config_value {
            yaml_config.insert(config.config_key.into(), value.into());
        }
    }

    let yaml_content = serde_yaml::to_string(&yaml_config)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Write to config file
    let config_path = "livekit.yaml"; // In the workspace
    fs::write(&config_path, yaml_content)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Copy to Docker container and restart
    let copy_output = Command::new("docker")
        .args(&["cp", config_path, "livekit-server:/livekit/livekit.yaml"])
        .output().await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if !copy_output.status.success() {
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    }

    let restart_output = Command::new("docker")
        .args(&["restart", "livekit-server"])
        .output().await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if restart_output.status.success() {
        Ok(Json("Config applied successfully".to_string()))
    } else {
        Err(StatusCode::INTERNAL_SERVER_ERROR)
    }
}