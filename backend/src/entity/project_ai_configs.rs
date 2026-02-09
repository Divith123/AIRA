use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "project_ai_configs")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false, column_type = "Text")]
    pub project_id: String, // UUID
    // STT
    pub stt_mode: Option<String>,
    pub stt_provider: Option<String>,
    pub stt_model: Option<String>,
    // TTS
    pub tts_mode: Option<String>,
    pub tts_provider: Option<String>,
    pub tts_model: Option<String>,
    pub tts_voice: Option<String>,
    // LLM
    pub llm_mode: Option<String>,
    pub llm_provider: Option<String>,
    pub llm_model: Option<String>,
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
