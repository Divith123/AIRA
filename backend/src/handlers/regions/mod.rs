use axum::{extract::State, http::StatusCode, Json};
use sea_orm::EntityTrait;

use crate::entity::prelude::*;
use crate::models::regions::RegionResponse;
use crate::utils::jwt::Claims;
use crate::AppState;

pub async fn list_regions(
    State(state): State<AppState>,
    axum::extract::Extension(_claims): axum::extract::Extension<Claims>,
) -> Result<Json<Vec<RegionResponse>>, StatusCode> {
    let list = Regions::find()
        .all(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let response = list.into_iter().map(|r| RegionResponse {
        id: r.id,
        region_name: r.region_name,
        region_code: r.region_code,
        livekit_url: r.livekit_url,
        is_default: r.is_default,
        created_at: r.created_at.map(|t| t.to_string()).unwrap_or_default(),
    }).collect();

    Ok(Json(response))
}
