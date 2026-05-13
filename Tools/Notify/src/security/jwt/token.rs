use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};

use crate::security::jwt::Claims;

pub fn validate_token(token: &str, secret: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    let validation = Validation::new(Algorithm::HS256);

    let key_bytes = secret.as_bytes();
    let token_data = decode::<Claims>(token, &DecodingKey::from_secret(key_bytes), &validation)?;

    Ok(token_data.claims)
}
