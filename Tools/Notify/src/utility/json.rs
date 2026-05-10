use serde_json::Value;
use std::str::FromStr;
use uuid::Uuid;

use crate::error::common::KeyNotFound;

pub fn get_value_by_key(json: &str, key: &str) -> Option<String> {
    let v: Value = serde_json::from_str(json).ok()?;
    let value = v.get(key)?;

    if let Some(s) = value.as_str() {
        Some(s.to_string())
    } else {
        Some(value.to_string())
    }
}

pub fn extract_uuid(json: &str, key: &str) -> Result<Uuid, ExtractUuidError> {
    let v = get_value_by_key(json, key).ok_or_else(|| KeyNotFound::new(key))?;

    Uuid::from_str(&v).map_err(ExtractUuidError::UuidConversion)
}

#[derive(thiserror::Error, Debug)]
pub enum ExtractUuidError {
    #[error(transparent)]
    UuidConversion(#[from] uuid::Error),

    #[error(transparent)]
    JsonKeyNotFound(#[from] KeyNotFound),
}
