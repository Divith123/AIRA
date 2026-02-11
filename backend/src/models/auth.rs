use serde::Deserialize;

#[derive(Deserialize)]
pub struct RegisterRequest {
    pub name: String,
    pub phone: String,
    pub email: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}