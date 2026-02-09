use axum::{extract::State, http::StatusCode, Json};
use serde_json::Value;
use hmac::{Hmac, Mac};
use sha2::Sha256;
use base64::{Engine as _, engine::general_purpose};
use std::env;
use std::collections::HashSet;
use chrono::Utc;
use uuid::Uuid;

use crate::AppState;
use sea_orm::{ActiveModelTrait, Set, EntityTrait, QueryFilter, ColumnTrait, prelude::Expr, QueryOrder};
use crate::entity::{sessions, analytics_snapshots};

pub async fn handle_webhook(
    State(state): State<AppState>,
    headers: axum::http::HeaderMap,
    Json(payload): Json<Value>,
) -> Result<StatusCode, StatusCode> {
    // Verify webhook signature
    let signature = headers.get("x-livekit-signature")
        .and_then(|h| h.to_str().ok())
        .ok_or(StatusCode::BAD_REQUEST)?;

    let secret = env::var("LIVEKIT_API_SECRET").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let body = serde_json::to_string(&payload).map_err(|_| StatusCode::BAD_REQUEST)?;
    
    let mut mac = Hmac::<Sha256>::new_from_slice(secret.as_bytes()).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    mac.update(body.as_bytes());
    let result = mac.finalize();
    let expected_signature = format!("sha256={}", general_purpose::STANDARD.encode(result.into_bytes()));
    
    if !constant_time_eq(signature, &expected_signature) {
        return Err(StatusCode::UNAUTHORIZED);
    }

    // Process webhook event
    if let Some(event) = payload.get("event").and_then(|e| e.as_str()) {
        match event {
            "room_started" => {
                if let Some(room) = payload.get("room").and_then(|r| r.get("name")).and_then(|n| n.as_str()) {
                    if let Some(sid) = payload.get("room").and_then(|r| r.get("sid")).and_then(|s| s.as_str()) {
                        // Create or update session
                        let session = sessions::ActiveModel {
                            sid: Set(sid.to_string()),
                            room_name: Set(room.to_string()),
                            status: Set("active".to_string()),
                            start_time: Set(Utc::now().naive_utc()),
                            ..Default::default()
                        };
                        if let Err(_) = session.insert(&state.db).await {
                            // Session might already exist, try to update
                            if let Err(_) = sessions::Entity::update_many()
                                .col_expr(sessions::Column::Status, Expr::value("active"))
                                .col_expr(sessions::Column::StartTime, Expr::value(Utc::now().naive_utc()))
                                .filter(sessions::Column::RoomName.eq(room))
                                .exec(&state.db)
                                .await {
                                // Log error but don't fail the webhook
                            }
                        }
                    }
                }
            },
            "room_finished" => {
                if let Some(room) = payload.get("room").and_then(|r| r.get("name")).and_then(|n| n.as_str()) {
                    // Update session status
                    if let Err(_) = sessions::Entity::update_many()
                        .col_expr(sessions::Column::Status, Expr::value("finished"))
                        .col_expr(sessions::Column::EndTime, Expr::value(Some(Utc::now().naive_utc())))
                        .filter(sessions::Column::RoomName.eq(room))
                        .exec(&state.db)
                        .await {
                        // Log error but don't fail the webhook
                    }
                }
            },
            "participant_joined" => {
                // Update global participant count
                let _ = update_global_participants(&state.db, 1).await;
            },
            "participant_left" => {
                // Update global participant count
                let _ = update_global_participants(&state.db, -1).await;
            },
            _ => {
                // Unknown event, just log and continue
            }
        }
    }

    Ok(StatusCode::OK)
}

async fn update_global_participants(db: &sea_orm::DatabaseConnection, delta: i32) -> Result<(), sea_orm::DbErr> {
    // Get the latest snapshot
    let latest_snapshot: Option<analytics_snapshots::Model> = analytics_snapshots::Entity::find()
        .order_by_desc(analytics_snapshots::Column::Timestamp)
        .one(db)
        .await?;

    let current_count = latest_snapshot.map(|s| s.total_participants).unwrap_or(0);
    let new_count = (current_count as i32 + delta).max(0) as i32;

    // Calculate active rooms (unique room names with active status)
    let active_sessions = sessions::Entity::find()
        .filter(sessions::Column::Status.eq("active"))
        .all(db)
        .await?;
    let active_rooms = active_sessions.iter()
        .map(|s| &s.room_name)
        .collect::<HashSet<_>>()
        .len() as i32;

    // Create new snapshot
    let snapshot = analytics_snapshots::ActiveModel {
        id: Set(Uuid::new_v4().to_string()),
        timestamp: Set(Utc::now().naive_utc()),
        active_rooms: Set(active_rooms),
        total_participants: Set(new_count),
        ..Default::default()
    };
    snapshot.insert(db).await?;
    Ok(())
}

// Constant time comparison to prevent timing attacks
fn constant_time_eq(a: &str, b: &str) -> bool {
    if a.len() != b.len() {
        return false;
    }
    let a_bytes = a.as_bytes();
    let b_bytes = b.as_bytes();
    let mut result = 0;
    for i in 0..a_bytes.len() {
        result |= a_bytes[i] ^ b_bytes[i];
    }
    result == 0
}