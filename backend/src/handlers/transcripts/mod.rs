use axum::{extract::{State, Query}, http::StatusCode, Json};
use sea_orm::{EntityTrait, QueryOrder, PaginatorTrait, ColumnTrait, QueryFilter};

use crate::entity::{transcripts, prelude::*};
use crate::models::transcripts::{TranscriptResponse, ListTranscriptsQuery};
use crate::utils::jwt::Claims;
use crate::AppState;

pub async fn list_transcripts(
    State(state): State<AppState>,
    axum::extract::Extension(_claims): axum::extract::Extension<Claims>,
    Query(query): Query<ListTranscriptsQuery>,
) -> Result<Json<Vec<TranscriptResponse>>, StatusCode> {
    let page = query.page.unwrap_or(1);
    let limit = query.limit.unwrap_or(100);

    let mut db_query = Transcripts::find().order_by_asc(transcripts::Column::Timestamp);

    if let Some(session_id) = query.session_id {
        db_query = db_query.filter(transcripts::Column::SessionId.eq(session_id));
    }

    if let Some(room_name) = query.room_name {
        db_query = db_query.filter(transcripts::Column::RoomName.eq(room_name));
    }

    if let Some(project_id) = query.project_id {
        db_query = db_query.filter(transcripts::Column::ProjectId.eq(project_id));
    }

    let paginator = db_query.paginate(&state.db, limit);
    let transcripts_list = paginator.fetch_page(page - 1).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let response = transcripts_list.into_iter().map(|t| TranscriptResponse {
        id: t.id,
        session_id: t.session_id,
        room_name: t.room_name,
        participant_identity: t.participant_identity,
        text: t.text,
        timestamp: t.timestamp.to_string(),
        language: t.language,
        is_final: t.is_final,
        project_id: t.project_id,
    }).collect();

    Ok(Json(response))
}
