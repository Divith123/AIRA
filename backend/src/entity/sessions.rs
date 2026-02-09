use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "sessions")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false, column_type = "Text")]
    pub sid: String, // Room SID
    #[sea_orm(column_type = "Text")]
    pub room_name: String,
    #[sea_orm(column_type = "Text")]
    pub status: String,
    pub start_time: DateTime,
    pub end_time: Option<DateTime>,
    pub duration: i32,
    pub total_participants: i32,
    pub active_participants: i32,
    #[sea_orm(column_type = "Text", nullable)]
    pub project_id: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub features: Option<String>, // JSON array
    pub created_at: Option<DateTime>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
