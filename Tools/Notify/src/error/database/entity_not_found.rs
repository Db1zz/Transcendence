use uuid::Uuid;
#[derive(thiserror::Error, Debug)]
#[error("Entity {entity_id} not found")]
pub struct EntityNotFoundError {
    pub entity_id: Uuid,
}
