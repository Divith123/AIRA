use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "storage_configs")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false, column_type = "Text")]
    pub id: String, // UUID
    #[sea_orm(column_type = "Text")]
    pub name: String,
    #[sea_orm(column_type = "Text")]
    pub storage_type: String,
    #[sea_orm(column_type = "Text")]
    pub bucket: String,
    #[sea_orm(column_type = "Text", nullable)]
    pub region: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub endpoint: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub access_key: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub secret_key: Option<String>,
    #[sea_orm(default_value = false)]
    pub is_default: bool,
    pub created_at: Option<DateTime>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
