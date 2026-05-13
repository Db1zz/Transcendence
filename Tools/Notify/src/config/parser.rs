use crate::config::Config;

pub fn parse(config_raw_data: String) -> Result<Config, ConfigParserError> {
    let config = serde_yaml::from_str::<Config>(&config_raw_data)?;
    Ok(config)
}

#[derive(thiserror::Error, Debug)]
pub enum ConfigParserError {
    #[error(transparent)]
    Parser(#[from] serde_yaml::Error),
}
