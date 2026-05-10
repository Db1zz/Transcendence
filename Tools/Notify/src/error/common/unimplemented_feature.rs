#[derive(thiserror::Error, Debug)]
#[error("Feature {feature_name} is unimplemented")]
pub struct UnimplementedFeature {
    pub feature_name: String,
}

impl UnimplementedFeature {
    pub fn new(feature_name: &str) -> Self {
        Self {
            feature_name: feature_name.to_owned(),
        }
    }
}
