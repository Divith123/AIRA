use axum::{extract::State, http::StatusCode, Json};
use sea_orm::{
    EntityTrait, QueryOrder, QuerySelect, FromQueryResult,
    QueryFilter, ColumnTrait, PaginatorTrait,
    sea_query::{Expr, Func},
};
use chrono::{Utc, Duration};
use std::collections::HashMap;

use crate::entity::{sessions, prelude::*};
use crate::models::analytics::{AnalyticsSummaryResponse, DashboardDataResponse, ConnectionTypeStats, TopCountry, DashboardParticipants, DashboardAgents, DashboardTelephony, DashboardRooms};
use crate::utils::jwt::Claims;
use crate::AppState;

#[derive(FromQueryResult)]
struct SessionStats {
    count: i64,
    sum_duration: Option<f64>, // Duration in seconds
    sum_participants: Option<i64>,
}

pub async fn get_analytics_summary(
    State(state): State<AppState>,
    axum::extract::Extension(_claims): axum::extract::Extension<Claims>,
) -> Result<Json<AnalyticsSummaryResponse>, StatusCode> {
    // Get real-time data from LiveKit
    let rooms = state.lk_service.list_rooms()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let active_rooms = rooms.len() as i32;
    let total_participants = rooms.iter().map(|r| r.num_participants as i32).sum();

    Ok(Json(AnalyticsSummaryResponse {
        active_rooms,
        total_participants,
        status: "healthy".to_string(), 
        last_updated: Utc::now().to_rfc3339(),
    }))
}

pub async fn get_dashboard_data(
    State(state): State<AppState>,
    axum::extract::Extension(_claims): axum::extract::Extension<Claims>,
) -> Result<Json<DashboardDataResponse>, StatusCode> {
    // Run all queries in parallel to improve performance
    let (
        total_sessions_result,
        successful_sessions_result,
        total_duration_result,
        agent_instances_result,
        sip_sessions_duration_result,
        active_agents_result,
        avg_stats_result,
    ) = tokio::join!(
        Sessions::find().count(&state.db),
        Sessions::find()
            .filter(sessions::Column::Status.ne("failed"))
            .filter(sessions::Column::Duration.gt(0))
            .count(&state.db),
        Sessions::find()
            .select_only()
            .column_as(Expr::expr(Func::sum(Expr::col(sessions::Column::Duration))), "sum")
            .into_tuple::<(Option<i64>,)>()
            .one(&state.db),
        crate::entity::prelude::AgentInstances::find()
            .filter(crate::entity::agent_instances::Column::StoppedAt.is_not_null())
            .all(&state.db),
        Sessions::find()
            .filter(sessions::Column::Features.contains("sip"))
            .select_only()
            .column_as(Expr::expr(Func::sum(Expr::col(sessions::Column::Duration))), "sum")
            .into_tuple::<(Option<i64>,)>()
            .one(&state.db),
        crate::entity::prelude::AgentInstances::find()
            .filter(crate::entity::agent_instances::Column::Status.eq("running"))
            .count(&state.db),
        // Combined query for averages
        Sessions::find()
            .select_only()
            .column_as(Expr::expr(Func::avg(Expr::col(sessions::Column::Duration))), "avg_duration")
            .column_as(Expr::expr(Func::avg(Expr::col(sessions::Column::TotalParticipants))), "avg_participants")
            .into_tuple::<(Option<f64>, Option<f64>)>()
            .one(&state.db),
    );

    // Extract results with defaults
    let total_sessions = total_sessions_result.unwrap_or(0);
    let successful_sessions = successful_sessions_result.unwrap_or(0);
    let total_duration_seconds = total_duration_result
        .unwrap_or(None)
        .and_then(|t| t.0)
        .unwrap_or(0);
    let agent_instances = agent_instances_result.unwrap_or_default();
    let sip_sessions_duration = sip_sessions_duration_result
        .unwrap_or(None)
        .and_then(|t| t.0)
        .unwrap_or(0);
    let active_agents = active_agents_result.unwrap_or(0);
    let avg_stats = avg_stats_result
        .unwrap_or(None)
        .unwrap_or((Some(0.0), Some(0.0)));
    let (avg_duration, avg_size) = avg_stats;

    // 1. Connection Success Metric
    let connection_success_rate = if total_sessions > 0 {
        (successful_sessions as f32 / total_sessions as f32) * 100.0
    } else {
        100.0
    };

    // 2. Protocols - Simple estimation based on WebRTC defaults
    let connection_type = ConnectionTypeStats { udp: 85, tcp: 15 };

    // 3. Top Countries - Placeholder (requires geolocation data)
    let top_countries: Vec<TopCountry> = vec![];

    // 4. Participant Usage
    let total_minutes = total_duration_seconds / 60;

    // Calculate agent minutes from agent instances
    let agent_minutes = agent_instances.iter()
        .filter_map(|instance| {
            if let (Some(started), Some(stopped)) = (instance.started_at, instance.stopped_at) {
                Some((stopped - started).num_seconds() / 60)
            } else {
                None
            }
        })
        .sum::<i64>() as i32;

    let sip_minutes = sip_sessions_duration / 60;

    let participants = DashboardParticipants {
        webrtc_minutes: total_minutes as i32 - agent_minutes - sip_minutes as i32,
        agent_minutes,
        sip_minutes: sip_minutes as i32,
        total_minutes: total_minutes as i32,
    };

    // 5. Agent Utilization
    let agents = DashboardAgents {
        session_minutes: agent_minutes,
        concurrent: active_agents as i32,
    };

    // 6. Telephony Integration
    let telephony = DashboardTelephony {
        inbound: sip_minutes as i32,
        outbound: 0, // Basic implementation - outbound not tracked separately yet
    };

    // 7. Room Performance Metrics
    let rooms = DashboardRooms {
        total_sessions: total_sessions as i32,
        avg_size: avg_size.unwrap_or(0.0) as f32,
        avg_duration: avg_duration.unwrap_or(0.0) as f32,
    };

    Ok(Json(DashboardDataResponse {
        overview: crate::models::analytics::DashboardOverview {
            connection_success: connection_success_rate,
            connection_type,
            top_countries,
        },
        platforms: HashMap::new(),
        participants,
        agents,
        telephony,
        rooms,
    }))
}

// Handler for timeseries data
pub async fn get_analytics_timeseries(
    State(state): State<AppState>,
    axum::extract::Extension(_claims): axum::extract::Extension<Claims>,
    axum::extract::Query(_params): axum::extract::Query<HashMap<String, String>>,
) -> Result<Json<Vec<crate::models::analytics::AnalyticsDataPoint>>, StatusCode> {
    // Aggregate from snapshots
    let snapshots = AnalyticsSnapshots::find()
        .order_by_desc(crate::entity::analytics_snapshots::Column::Timestamp)
        .limit(100)
        .all(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let points = snapshots.into_iter().map(|s| crate::models::analytics::AnalyticsDataPoint {
        timestamp: s.timestamp.to_string(),
        active_rooms: s.active_rooms,
        total_participants: s.total_participants,
        cpu_load: s.cpu_load,
        memory_usage: s.memory_usage,
    }).collect();

    Ok(Json(points))
}
