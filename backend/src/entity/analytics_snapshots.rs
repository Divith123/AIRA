use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "analytics_snapshots")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false, column_type = "Text")]
    pub id: String, // UUID
    pub timestamp: DateTime,
    pub active_rooms: i32,
    pub total_participants: i32,
    #[sea_orm(column_type = "Double", nullable)]
    pub cpu_load: Option<f32>,
    #[sea_orm(column_type = "Double", nullable)]
    pub memory_usage: Option<f32>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
