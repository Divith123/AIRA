use sea_orm::{ActiveModelTrait, Set, DbErr, DatabaseConnection};
use uuid::Uuid;
use chrono::Utc;
use crate::entity::audit_logs;

pub async fn record_audit_log(
    db: &DatabaseConnection,
    action: &str,
    actor_id: Option<String>,
    actor_email: Option<String>,
    target_type: Option<String>,
    target_id: Option<String>,
    metadata: Option<serde_json::Value>,
    ip_address: Option<String>,
    project_id: Option<String>,
) -> Result<(), DbErr> {
    let log = audit_logs::ActiveModel {
        id: Set(Uuid::new_v4().to_string()),
        timestamp: Set(Utc::now().naive_utc()),
        action: Set(action.to_string()),
        actor_id: Set(actor_id),
        actor_email: Set(actor_email),
        target_type: Set(target_type),
        target_id: Set(target_id),
        metadata: Set(metadata.map(|m| m.to_string())),
        ip_address: Set(ip_address),
        project_id: Set(project_id),
    };

    log.insert(db).await?;
    Ok(())
}
