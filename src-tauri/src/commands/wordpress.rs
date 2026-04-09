use serde::{Deserialize, Serialize};
use tauri_plugin_store::StoreExt;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WordPressCredentials {
    pub site_url: String,
    pub username: String,
    pub app_password: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublishResult {
    pub success: bool,
    pub post_id: Option<u32>,
    pub url: Option<String>,
    pub message: String,
}

fn get_credentials(app: &tauri::AppHandle) -> Result<WordPressCredentials, String> {
    let store = app.store("settings.json").map_err(|e| e.to_string())?;

    let site_url = store.get("wordpress.site_url")
        .and_then(|v| v.as_str().map(|s| s.to_string()))
        .ok_or("WordPress site URL not configured")?;

    let username = store.get("wordpress.username")
        .and_then(|v| v.as_str().map(|s| s.to_string()))
        .ok_or("WordPress username not configured")?;

    let app_password = store.get("wordpress.app_password")
        .and_then(|v| v.as_str().map(|s| s.to_string()))
        .ok_or("WordPress app password not configured")?;

    Ok(WordPressCredentials {
        site_url,
        username,
        app_password,
    })
}

#[tauri::command]
pub async fn check_wordpress_status(app: tauri::AppHandle) -> Result<bool, String> {
    match get_credentials(&app) {
        Ok(creds) => {
            let site_url = creds.site_url.trim_end_matches('/');
            let url = format!("{}/wp-json/wp/v2/users/me", site_url);
            let client = reqwest::Client::new();

            match client
                .get(&url)
                .basic_auth(&creds.username, Some(&creds.app_password))
                .send()
                .await
            {
                Ok(response) => Ok(response.status().is_success()),
                Err(_) => Ok(false),
            }
        }
        Err(_) => Ok(false),
    }
}

#[tauri::command]
pub async fn publish_to_wordpress(
    app: tauri::AppHandle,
    title: String,
    content: String,
    status: String,
) -> Result<PublishResult, String> {
    // Validate status to prevent injection of arbitrary values
    let allowed_statuses = ["publish", "draft", "pending", "private"];
    if !allowed_statuses.contains(&status.as_str()) {
        return Err(format!("Invalid status '{}'. Must be one of: publish, draft, pending, private", status));
    }

    let creds = get_credentials(&app)?;
    let site_url = creds.site_url.trim_end_matches('/');

    let url = format!("{}/wp-json/wp/v2/posts", site_url);
    let client = reqwest::Client::new();

    let body = serde_json::json!({
        "title": title,
        "content": content,
        "status": status,
    });

    let response = client
        .post(&url)
        .basic_auth(&creds.username, Some(&creds.app_password))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if response.status().is_success() {
        let post: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;
        let post_id = post["id"].as_u64().map(|id| id as u32);
        let url = post["link"].as_str().map(String::from);

        Ok(PublishResult {
            success: true,
            post_id,
            url,
            message: "发布成功".to_string(),
        })
    } else {
        let error: serde_json::Value = response.json().await.unwrap_or_else(|_| serde_json::json!({"message": "Unknown error"}));
        Ok(PublishResult {
            success: false,
            post_id: None,
            url: None,
            message: error["message"].as_str().unwrap_or("发布失败").to_string(),
        })
    }
}

#[tauri::command]
pub async fn get_wordpress_posts(
    app: tauri::AppHandle,
    per_page: Option<u32>,
) -> Result<Vec<serde_json::Value>, String> {
    let creds = get_credentials(&app)?;
    let per_page = per_page.unwrap_or(10);
    let site_url = creds.site_url.trim_end_matches('/');

    let url = format!("{}/wp-json/wp/v2/posts?per_page={}", site_url, per_page);
    let client = reqwest::Client::new();

    let response = client
        .get(&url)
        .basic_auth(&creds.username, Some(&creds.app_password))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if response.status().is_success() {
        let posts: Vec<serde_json::Value> = response.json().await.map_err(|e| e.to_string())?;
        Ok(posts)
    } else {
        Err("获取文章列表失败".to_string())
    }
}
