use sea_orm::{Database, DatabaseConnection};
use std::env;

pub async fn connect_db() -> DatabaseConnection {
    let db_url = env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite://./livekit_admin.db?mode=rwc".to_string());

    Database::connect(&db_url)
        .await
        .expect("DB connection failed")
}
