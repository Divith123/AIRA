mod handlers;
mod routes;
mod utils;
mod models;
mod entity;
mod services;

use axum::Router;
use tokio::net::TcpListener;
use routes::{
    auth, livekit, ingress, egress, sip, config as config_routes, metrics, agents,
    projects, sessions, analytics, settings, templates, rules, regions, webhook,
    audit_logs, transcripts
};
use services::livekit_service::LiveKitService;
use axum::http::Method;
use axum::middleware::Next;
use axum::response::Response;
use axum::body::Body as AxBody;
use axum::http::HeaderValue;
use std::sync::Arc;
use std::env;
use sea_orm::{Database, DatabaseConnection};

async fn health_handler() -> &'static str {
    println!("Health check handler hit!");
    "healthy"
}

#[derive(Clone)]
pub struct AppState {
    pub db: DatabaseConnection,
    pub http_client: reqwest::Client,
    pub lk_service: Arc<LiveKitService>,
}

async fn run_migrations(_db: &DatabaseConnection) {
    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set for PostgreSQL migrations");
    let pool = sqlx::PgPool::connect(&db_url).await.expect("Failed to connect to database");

    let migrations = vec![
        include_str!("../migrations/20260204092336_create_users_table.sql"),
        include_str!("../migrations/20260209100000_create_livekit_tables.sql"),
        include_str!("../migrations/20260209110000_create_agents_tables.sql"),
        include_str!("../migrations/20260210000000_create_comprehensive_schema.sql"),
        include_str!("../migrations/20260210000001_add_project_id_to_agents.sql"),
        include_str!("../migrations/20260210000002_create_audit_logs.sql"),
        include_str!("../migrations/20260210000003_create_transcripts.sql"),
        include_str!("../migrations/20260210000004_seed_roles.sql"),
        include_str!("../migrations/20260210000005_seed_admin_user.sql"),
        include_str!("../migrations/20260212000000_add_phone_to_users.sql"),
        include_str!("../migrations/20260212010000_add_userid_shortid_to_projects.sql"),
    ];

    for migration in migrations {
        for statement in migration.split(';') {
            let trimmed = statement.trim();
            if trimmed.is_empty() { continue; }
            if let Err(e) = sqlx::query(trimmed).execute(&pool).await {
                println!("Migration error (may be OK): {}", e);
            }
        }
    }
    println!("Migrations completed");
}

use tower_http::trace::TraceLayer;
use axum::extract::Request;

async fn cors_middleware(req: Request, next: Next) -> Response {
    // Read Origin header from request so we can echo it back when credentials
    // are allowed. Browsers block responses that set Access-Control-Allow-Credentials
    // together with a wildcard `*` origin, so we must echo the exact Origin.
    let origin_header = req
        .headers()
        .get("origin")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_owned());

    // Allowed methods — include common verbs used by the API
    const ALLOWED_METHODS: &str = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
    const ALLOWED_HEADERS: &str = "content-type,authorization";

    if req.method() == Method::OPTIONS {
        let mut res = Response::builder()
            .status(204)
            .body(AxBody::empty())
            .unwrap();

        let headers = res.headers_mut();
        if let Some(origin) = &origin_header {
            if let Ok(val) = HeaderValue::from_str(origin) {
                headers.insert("access-control-allow-origin", val);
            }
        } else {
            headers.insert("access-control-allow-origin", HeaderValue::from_static("*"));
        }
        headers.insert("access-control-allow-methods", HeaderValue::from_static(ALLOWED_METHODS));
        headers.insert("access-control-allow-headers", HeaderValue::from_static(ALLOWED_HEADERS));
        headers.insert("access-control-allow-credentials", HeaderValue::from_static("true"));

        return res;
    }

    let mut res = next.run(req).await;
    let headers = res.headers_mut();
    if let Some(origin) = &origin_header {
        if let Ok(val) = HeaderValue::from_str(origin) {
            headers.insert("access-control-allow-origin", val);
        }
    } else {
        headers.insert("access-control-allow-origin", HeaderValue::from_static("*"));
    }
    headers.insert("access-control-allow-methods", HeaderValue::from_static(ALLOWED_METHODS));
    headers.insert("access-control-allow-headers", HeaderValue::from_static(ALLOWED_HEADERS));
    headers.insert("access-control-allow-credentials", HeaderValue::from_static("true"));

    res
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();
    eprintln!("Backend starting up - Version: TraceLayer Enabled");
    // Also try to load from parent directory if current directory doesn't have .env
    if env::var("LIVEKIT_API_KEY").is_err() {
        let parent_env = std::path::Path::new("..").join(".env");
        if parent_env.exists() {
            dotenvy::from_path(parent_env).ok();
        }
    }

    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set (PostgreSQL only)");
    let db = Database::connect(&db_url)
        .await
        .expect("DB connection failed");

    // Run migrations
    run_migrations(&db).await;

    let http_client = reqwest::Client::new();
    let lk_service = match LiveKitService::new() {
        Ok(service) => Arc::new(service),
        Err(e) => {
            eprintln!("Critical: Failed to initialize LiveKit service: {}. Server cannot start without LiveKit connection.", e);
            std::process::exit(1);
        }
    };

    let state = AppState { db, http_client, lk_service };

    let app = Router::new()
        .route("/health", axum::routing::get(health_handler))
        .merge(auth::routes())
        .merge(livekit::routes())
        .merge(ingress::routes())
        .merge(egress::routes())
        .merge(sip::routes())
        .merge(config_routes::routes())
        .merge(metrics::routes())
        .merge(agents::routes())
        .merge(projects::routes())
        .merge(sessions::routes())
        .merge(analytics::routes())
        .merge(settings::routes())
        .merge(templates::routes())
        .merge(rules::routes())
        .merge(regions::routes())
        .merge(webhook::routes())
        .merge(audit_logs::routes())
        .merge(transcripts::routes())
        .with_state(state)
        .layer(TraceLayer::new_for_http())
        .layer(axum::middleware::from_fn(cors_middleware));

    let listener = TcpListener::bind("0.0.0.0:8000")
        .await
        .expect("Failed to bind to port 8000");

    println!("Server running on http://127.0.0.1:8000");

    axum::serve(listener, app).await.expect("Failed to serve application");
}
