use axum::{routing::{post, get, delete}, Router, middleware};
use crate::handlers::livekit::{api_keys, rooms};
use crate::utils::jwt::jwt_middleware;

pub fn routes() -> Router<crate::AppState> {
    Router::new()
        .route("/api/livekit/api-keys", post(api_keys::create_api_key))
        .route("/api/livekit/api-keys", get(api_keys::list_api_keys))
        .route("/api/livekit/rooms", post(rooms::create_room))
        .route("/api/livekit/rooms", get(rooms::list_rooms))
        .route("/api/livekit/rooms/:room_name", delete(rooms::delete_room))
        .route("/api/livekit/rooms/:room_name/participants", get(rooms::list_participants))
        .route("/api/livekit/rooms/:room_name/participants/:identity", delete(rooms::remove_participant))
        .layer(middleware::from_fn(jwt_middleware))
}