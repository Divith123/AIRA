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
    // 1. Connection Success Metric
    let total_sessions = Sessions::find().count(&state.db).await.unwrap_or(0);
    let successful_sessions = Sessions::find()
        .filter(sessions::Column::Status.ne("failed"))
        .filter(sessions::Column::Duration.gt(0))
        .count(&state.db)
        .await
        .unwrap_or(0);

    let connection_success_rate = if total_sessions > 0 {
        (successful_sessions as f32 / total_sessions as f32) * 100.0
    } else {
        100.0 
    };

    // 2. Protocols (aggregated if logged in future events, currently 0 until unified event sink is ready)
    let connection_type = ConnectionTypeStats { udp: 0, tcp: 0 };

    // 3. Top Countries (requires GeoIP integration in webhook handlers)
    let top_countries: Vec<TopCountry> = vec![];

    // 4. Participant Usage (minutes aggregated from session duration)
    let total_duration_seconds: Option<i64> = Sessions::find()
        .select_only()
        .column_as(Expr::expr(Func::sum(Expr::col(sessions::Column::Duration))), "sum")
        .into_tuple()
        .one(&state.db)
        .await
        .unwrap_or(Some(0));
    
    let total_minutes = total_duration_seconds.unwrap_or(0) / 60;

    let participants = DashboardParticipants {
        webrtc_minutes: total_minutes as i32,
        agent_minutes: 0, 
        sip_minutes: 0,   
        total_minutes: total_minutes as i32,
    };

    // 5. Agent Utilization
    let agents = DashboardAgents {
        session_minutes: 0,
        concurrent: 0,
    };

    // 6. Telephony Integration
    let telephony = DashboardTelephony {
        inbound: 0,
        outbound: 0,
    };

    // 7. Room Performance Metrics
    let avg_duration: Option<f64> = Sessions::find()
        .select_only()
        .column_as(Expr::expr(Func::avg(Expr::col(sessions::Column::Duration))), "avg")
        .into_tuple()
        .one(&state.db)
        .await
        .unwrap_or(Some(0.0));
    
    let avg_size: Option<f64> = Sessions::find()
        .select_only()
        .column_as(Expr::expr(Func::avg(Expr::col(sessions::Column::TotalParticipants))), "avg")
        .into_tuple()
        .one(&state.db)
        .await
        .unwrap_or(Some(0.0));

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
    // Aggregate sessions by hour from DB
    // Since we don't have a complex query builder handy for time bucketing in correct timezone/db agnostic way,
    // we fetch recent data and aggregate.
    
    let recent = Sessions::find()
        .order_by_desc(sessions::Column::StartTime)
        .limit(500) // reasonable limit for dashboard graph
        .all(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut points_map: HashMap<String, crate::models::analytics::AnalyticsDataPoint> = HashMap::new();

    for s in recent {
        let hour = s.start_time.format("%Y-%m-%dT%H:00:00Z").to_string();
        let entry = points_map.entry(hour.clone()).or_insert(crate::models::analytics::AnalyticsDataPoint {
            timestamp: hour,
            active_rooms: 0,
            total_participants: 0,
            cpu_load: None, // We don't have this stored in session, need metrics table
            memory_usage: None,
        });
        entry.active_rooms += 1; // Count rooms in this hour
        entry.total_participants += s.total_participants;
    }

    let mut points: Vec<crate::models::analytics::AnalyticsDataPoint> = points_map.into_values().collect();
    points.sort_by(|a, b| a.timestamp.cmp(&b.timestamp));

    Ok(Json(points))
}
