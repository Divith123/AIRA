use axum::{extract::{State, Query}, http::StatusCode, Json};
use sea_orm::{EntityTrait, QueryOrder, PaginatorTrait, ColumnTrait, QueryFilter};
use uuid::Uuid;
use chrono::Utc;

use crate::entity::{audit_logs, prelude::*};
use crate::models::audit_logs::{AuditLogResponse, ListAuditLogsQuery};
use crate::utils::jwt::Claims;
use crate::AppState;

pub async fn list_audit_logs(
    State(state): State<AppState>,
    axum::extract::Extension(claims): axum::extract::Extension<Claims>,
    Query(query): Query<ListAuditLogsQuery>,
) -> Result<Json<Vec<AuditLogResponse>>, StatusCode> {
    if !claims.is_admin {
        return Err(StatusCode::FORBIDDEN);
    }

    let page = query.page.unwrap_or(1);
    let limit = query.limit.unwrap_or(50);

    let mut db_query = AuditLogs::find().order_by_desc(audit_logs::Column::Timestamp);

    if let Some(project_id) = query.project_id {
        db_query = db_query.filter(audit_logs::Column::ProjectId.eq(project_id));
    }

    if let Some(action) = query.action {
        db_query = db_query.filter(audit_logs::Column::Action.eq(action));
    }

    if let Some(target_type) = query.target_type {
        db_query = db_query.filter(audit_logs::Column::TargetType.eq(target_type));
    }

    let paginator = db_query.paginate(&state.db, limit);
    let logs_list = paginator.fetch_page(page - 1).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let response = logs_list.into_iter().map(|l| AuditLogResponse {
        id: l.id,
        timestamp: l.timestamp.to_string(),
        action: l.action,
        actor_id: l.actor_id,
        actor_email: l.actor_email,
        target_type: l.target_type,
        target_id: l.target_id,
        metadata: l.metadata.and_then(|m| serde_json::from_str(&m).ok()),
        ip_address: l.ip_address,
        project_id: l.project_id,
    }).collect();

    Ok(Json(response))
}
