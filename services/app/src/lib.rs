use axum::{
    body::Body,
    http::{Response, StatusCode},
    response::IntoResponse,
    Json,
    Router,
    routing::get
};
use serde::Serialize;
use tower_service::Service;
use worker::{HttpRequest, Env, Context, Result, event};

#[derive(Serialize)]
struct ErrorBody {
    error: String,
}

fn router() -> Router {
    Router::new().route("/api/v1/push-notifications/metadata", get(metadata))
}

#[event(fetch)]
async fn fetch(
    req: HttpRequest,
    _env: Env,
    _ctx: Context,
) -> Result<Response<Body>> {
    Ok(router().call(req).await?)
}

pub async fn metadata() -> Response<Body> {
    let body = ErrorBody {
        error: "rust-not-implemented".to_string(),
    };

    (
        StatusCode::NOT_IMPLEMENTED,
        Json(body),
    ).into_response()
}
