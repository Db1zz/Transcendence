use crate::error::database::EntityNotFoundError;

#[derive(thiserror::Error, Debug)]
pub enum RepositoryError {
    #[error(transparent)]
    NotFound(#[from] EntityNotFoundError),

    #[error(transparent)]
    Other(#[from] anyhow::Error),
}

impl From<scylla::errors::IntoRowsResultError> for RepositoryError {
    fn from(err: scylla::errors::IntoRowsResultError) -> Self {
        Self::Other(anyhow::Error::new(err))
    }
}

impl From<scylla::errors::RowsError> for RepositoryError {
    fn from(err: scylla::errors::RowsError) -> Self {
        Self::Other(anyhow::Error::new(err))
    }
}

impl From<scylla::errors::DeserializationError> for RepositoryError {
    fn from(err: scylla::errors::DeserializationError) -> Self {
        Self::Other(anyhow::Error::new(err))
    }
}

impl From<scylla::errors::ExecutionError> for RepositoryError {
    fn from(err: scylla::errors::ExecutionError) -> Self {
        Self::Other(anyhow::Error::new(err))
    }
}
