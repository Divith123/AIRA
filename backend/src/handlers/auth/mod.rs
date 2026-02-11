use axum::{extract::{State, Extension}, Json, http::StatusCode};
use sea_orm::{
    ActiveModelTrait,
    ColumnTrait,
    EntityTrait,
    QueryFilter,
    Set,
};
use uuid::Uuid;

use crate::entity::users;
use crate::AppState;
use crate::models::auth::{RegisterRequest, LoginRequest};
use crate::utils::password::{hash_password, verify_password};
use crate::utils::jwt::{create_jwt, Claims};
use serde_json::json;

// ---------------- REGISTER ----------------

pub async fn register(
    State(state): State<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<String>, (StatusCode, String)> {

    let existing_user = users::Entity::find()
        .filter(users::Column::Email.eq(&payload.email))
        .one(&state.db)
        .await
        .map_err(|e| {
            eprintln!("DB error fetching existing user: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string())
        })?;

    if existing_user.is_some() {
        return Ok(Json("Email already exists".to_string()));
    }

    let hashed_password = hash_password(&payload.password);

    let user_id = Uuid::new_v4().to_string();

    let new_user = users::ActiveModel {
        id: Set(user_id),
        email: Set(payload.email),
        name: Set(Some(payload.name)),
        phone: Set(Some(payload.phone)),
        password: Set(hashed_password),
        role_id: Set(Some("role_admin".to_string())),
        is_active: Set(true),
        ..Default::default()
    };

    new_user.insert(&state.db).await.map_err(|e| {
        eprintln!("DB error inserting new user: {:?}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create user".to_string())
    })?;

    Ok(Json("User registered".to_string()))
}

// ---------------- LOGIN ----------------

pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<String>, (axum::http::StatusCode, String)> {

    let user = users::Entity::find()
        .filter(users::Column::Email.eq(&payload.email))
        .one(&state.db)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()))?;

    if user.is_none() {
        return Err((
            axum::http::StatusCode::UNAUTHORIZED,
            "Invalid email or password".to_string(),
        ));
    }

    let user = user.ok_or((axum::http::StatusCode::UNAUTHORIZED, "Invalid email or password".to_string()))?;

    // Verify password
    if !verify_password(&user.password, &payload.password) {
        return Err((
            axum::http::StatusCode::UNAUTHORIZED,
            "Invalid email or password".to_string(),
        ));
    }

    // Check for role
    let is_admin = if let Some(role_id) = &user.role_id {
        if let Ok(Some(role)) = crate::entity::prelude::Roles::find_by_id(role_id).one(&state.db).await {
            role.name == "Administrator" || role.name == "Owner" || role.is_system
        } else {
            false
        }
    } else {
        false
    };

    let user_name = user.name.clone().unwrap_or_default();
    let token = create_jwt(user.id.clone(), is_admin, user.email.clone(), user_name);

    Ok(Json(token))
}

// ---------------- ME ----------------

pub async fn me(
    State(_state): State<AppState>,
    Extension(claims): Extension<Claims>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    // Return user info directly from the JWT claims so frontend can display account
    return Ok(Json(json!({
        "id": claims.sub,
        "email": claims.email,
        "name": claims.name,
        "is_admin": claims.is_admin
    })));
}
