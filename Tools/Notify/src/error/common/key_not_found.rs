#[derive(thiserror::Error, Debug)]
#[error("Key {key} not found")]
pub struct KeyNotFound {
    pub key: String,
}

impl KeyNotFound {
    pub fn new(key: &str) -> Self {
        Self {
            key: key.to_owned(),
        }
    }
}
