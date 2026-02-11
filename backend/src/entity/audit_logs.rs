use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "audit_logs")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false, column_type = "Text")]
    pub id: String,
    pub timestamp: DateTime,
    pub action: String,
    #[sea_orm(column_type = "Text", nullable)]
    pub actor_id: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub actor_email: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub target_type: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub target_id: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub metadata: Option<String>, // JSON blob
    #[sea_orm(column_type = "Text", nullable)]
    pub ip_address: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub project_id: Option<String>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::projects::Entity",
        from = "Column::ProjectId",
        to = "super::projects::Column::Id",
        on_update = "NoAction",
        on_delete = "Cascade"
    )]
    Project,
}

impl Related<super::projects::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Project.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
