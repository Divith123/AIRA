use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "dispatch_rules")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false, column_type = "Text")]
    pub id: String, // UUID
    #[sea_orm(column_type = "Text")]
    pub name: String,
    #[sea_orm(column_type = "Text")]
    pub rule_type: String,
    #[sea_orm(column_type = "Text", nullable)]
    pub trunk_id: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub agent_id: Option<String>,
    #[sea_orm(default_value = true)]
    pub is_active: bool,
    pub created_at: Option<DateTime>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
