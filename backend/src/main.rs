mod config;
mod handlers;
mod routes;
mod utils;
mod models;
mod entity;

use axum::Router;
use dotenvy::dotenv;
use tokio::net::TcpListener;
use config::database::connect_db;
use routes::{auth_routes::auth_routes, livekit_routes, ingress_routes, egress_routes, sip_routes, config_routes, metrics_routes, agent_routes};
use axum::http::Method;
use axum::middleware::Next;
use axum::response::Response;
use axum::body::Body as AxBody;
use axum::http::HeaderValue;

#[derive(Clone)]
pub struct AppState {
    pub db: sea_orm::DatabaseConnection,
    pub http_client: reqwest::Client,
}

use sea_orm::{Database, DatabaseConnection};
use std::env;

async fn run_migrations(db: &DatabaseConnection) {
    let pool = sqlx::SqlitePool::connect(&env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite://./livekit_admin.db?mode=rwc".to_string())).await.unwrap();

    let migrations = vec![
        include_str!("../migrations/20260204092336_create_users_table.sql"),
        include_str!("../migrations/20260209100000_create_livekit_tables.sql"),
        include_str!("../migrations/20260209110000_create_agents_tables.sql"),
    ];

    for migration in migrations {
        if let Err(e) = sqlx::query(migration).execute(&pool).await {
            println!("Migration error (may be OK): {}", e);
        }
    }
    println!("Migrations completed");
}

#[tokio::main]
async fn main() {
    dotenv().ok();

    let db_url = env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite://./livekit_admin.db?mode=rwc".to_string());
    let db = Database::connect(&db_url)
        .await
        .expect("DB connection failed");

    // Run migrations
    run_migrations(&db).await;

    let http_client = reqwest::Client::new();

    let state = AppState { db, http_client };

    async fn cors_middleware(req: axum::http::Request<AxBody>, next: Next) -> Response {
        if req.method() == Method::OPTIONS {
            let mut res = Response::builder()
                .status(204)
                .body(AxBody::empty())
                .unwrap();

            let headers = res.headers_mut();
            headers.insert("access-control-allow-origin", HeaderValue::from_static("*"));
            headers.insert("access-control-allow-methods", HeaderValue::from_static("GET, POST, OPTIONS"));
            headers.insert("access-control-allow-headers", HeaderValue::from_static("content-type,authorization"));
            headers.insert("access-control-allow-credentials", HeaderValue::from_static("true"));

            return res;
        }

        let mut res = next.run(req).await;
        let headers = res.headers_mut();
        headers.insert("access-control-allow-origin", HeaderValue::from_static("*"));
        headers.insert("access-control-allow-methods", HeaderValue::from_static("GET, POST, OPTIONS"));
        headers.insert("access-control-allow-headers", HeaderValue::from_static("content-type,authorization"));
        headers.insert("access-control-allow-credentials", HeaderValue::from_static("true"));

        res
    }

    let app = Router::new()
        .merge(auth_routes(state.clone()))
        .merge(livekit_routes::routes())
        .merge(ingress_routes::routes())
        .merge(egress_routes::routes())
        .merge(sip_routes::routes())
        .merge(config_routes::routes())
        .merge(metrics_routes::routes())
        .merge(agent_routes::routes())
        .with_state(state)
        .layer(axum::middleware::from_fn(cors_middleware));

    let listener = TcpListener::bind("127.0.0.1:8000")
        .await
        .unwrap();

    println!("Server running on http://127.0.0.1:8000");

    axum::serve(listener, app).await.unwrap();
}
