use axum::{routing::{post, get, delete}, Router, middleware};
use crate::handlers::egress;
use crate::utils::jwt::jwt_middleware;

pub fn routes() -> Router<crate::AppState> {
    Router::new()
        // Standard paths matching api.ts
        .route("/api/livekit/egresses", get(egress::list_egress))
        .route("/api/livekit/egress/room-composite", post(egress::start_room_composite))
        .route("/api/livekit/egress/participant", post(egress::start_participant_egress))
        .route("/api/livekit/egress/web", post(egress::start_web_egress))
        .route("/api/livekit/egress/track", post(egress::start_track_egress))
        .route("/api/livekit/egress/image", post(egress::start_image_egress))
        .route("/api/livekit/egress/stop", post(egress::stop_egress))
        .layer(middleware::from_fn(jwt_middleware))
}