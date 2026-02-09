use axum::{extract::State, http::StatusCode, Json};
use sea_orm::{EntityTrait, QueryFilter, ColumnTrait, QueryOrder, PaginatorTrait};
use std::process::Stdio;
use tokio::process::Command;
use tokio::io::{AsyncBufReadExt, BufReader};

use crate::entity::{agent_logs, agent_instances, prelude::*};
use crate::models::agents::AgentLogResponse;
use crate::utils::jwt::Claims;
use crate::AppState;

pub async fn get_agent_logs(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    axum::extract::Path(instance_id): axum::extract::Path<String>,
    axum::extract::Query(params): axum::extract::Query<std::collections::HashMap<String, String>>,
) -> Result<Json<Vec<AgentLogResponse>>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    // Find the instance
    let instance = agent_instances::Entity::find()
        .filter(agent_instances::Column::InstanceId.eq(&instance_id))
        .one(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let limit = params.get("limit").and_then(|s| s.parse::<u64>().ok()).unwrap_or(100);
    let offset = params.get("offset").and_then(|s| s.parse::<u64>().ok()).unwrap_or(0);

    // Get stored logs from database
    let paginator = agent_logs::Entity::find()
        .filter(agent_logs::Column::InstanceId.eq(instance.id))
        .order_by_desc(agent_logs::Column::Timestamp)
        .paginate(&state.db, limit);

    let logs = paginator.fetch_page(offset / limit).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let response: Vec<AgentLogResponse> = logs.into_iter().map(|log| AgentLogResponse {
        id: log.id.to_string(),
        agent_id: log.agent_id.to_string(),
        instance_id: log.instance_id.to_string(),
        log_level: log.log_level,
        message: log.message,
        timestamp: log.timestamp.to_string(),
    }).collect();

    Ok(Json(response))
}

pub async fn stream_agent_logs(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    axum::extract::Path(instance_id): axum::extract::Path<String>,
) -> Result<String, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    // Find the instance
    let instance = agent_instances::Entity::find()
        .filter(agent_instances::Column::InstanceId.eq(&instance_id))
        .one(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    // Stream logs from Docker or process
    if let Some(container_id) = &instance.container_id {
        stream_docker_logs(container_id).await
    } else if let Some(pid) = instance.process_pid {
        // For processes, we'd need a different approach - this is simplified
        Err(StatusCode::NOT_IMPLEMENTED)
    } else {
        Err(StatusCode::INTERNAL_SERVER_ERROR)
    }
}

async fn stream_docker_logs(container_id: &str) -> Result<String, StatusCode> {
    let mut cmd = Command::new("docker");
    cmd.arg("logs")
        .arg("-f")  // follow
        .arg("--tail")
        .arg("100")
        .arg(container_id)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    let mut child = cmd.spawn()
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let stdout = child.stdout.take().ok_or(StatusCode::INTERNAL_SERVER_ERROR)?;
    let stderr = child.stderr.take().ok_or(StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut stdout_reader = BufReader::new(stdout).lines();
    let mut stderr_reader = BufReader::new(stderr).lines();

    let mut logs = Vec::new();

    // Read a limited number of lines for the response
    for _ in 0..50 {
        tokio::select! {
            line = stdout_reader.next_line() => {
                if let Ok(Some(line)) = line {
                    logs.push(format!("[STDOUT] {}", line));
                } else {
                    break;
                }
            }
            line = stderr_reader.next_line() => {
                if let Ok(Some(line)) = line {
                    logs.push(format!("[STDERR] {}", line));
                } else {
                    break;
                }
            }
        }
    }

    // Kill the child process since we only want a snapshot
    let _ = child.kill().await;

    Ok(logs.join("\n"))
}

pub async fn store_agent_log(
    state: &AppState,
    instance_id: &str,
    level: &str,
    message: &str,
) -> Result<(), StatusCode> {
    // Find the instance
    let instance = agent_instances::Entity::find()
        .filter(agent_instances::Column::InstanceId.eq(instance_id))
        .one(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let log_model = agent_logs::ActiveModel {
        id: sea_orm::ActiveValue::Set(uuid::Uuid::new_v4()),
        agent_id: sea_orm::ActiveValue::Set(instance.agent_id),
        instance_id: sea_orm::ActiveValue::Set(instance.id),
        log_level: sea_orm::ActiveValue::Set(level.to_string()),
        message: sea_orm::ActiveValue::Set(message.to_string()),
        ..Default::default()
    };

    agent_logs::Entity::insert(log_model).exec(&state.db).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(())
}