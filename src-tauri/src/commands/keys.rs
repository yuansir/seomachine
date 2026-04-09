use serde::{Deserialize, Serialize};
use tauri_plugin_store::StoreExt;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WordPressConfig {
    pub site_url: String,
    pub username: String,
    pub app_password: String,
}

#[tauri::command]
pub async fn store_api_key(
    app: tauri::AppHandle,
    key_type: String,
    key_value: String,
) -> Result<(), String> {
    let store = app.store("settings.json").map_err(|e| e.to_string())?;

    let key = match key_type.as_str() {
        "claude" => "api_keys.claude",
        "dataforseo" => "api_keys.dataforseo",
        "wordpress" => return Err("Use store_wordpress_config for WordPress".into()),
        _ => return Err(format!("Unknown key type: {}", key_type)),
    };

    store.set(key, serde_json::Value::String(key_value));
    store.save().map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn get_api_key(
    app: tauri::AppHandle,
    key_type: String,
) -> Result<bool, String> {
    let store = app.store("settings.json").map_err(|e| e.to_string())?;

    let key = match key_type.as_str() {
        "claude" => "api_keys.claude",
        "dataforseo" => "api_keys.dataforseo",
        _ => return Err(format!("Unknown key type: {}", key_type)),
    };

    Ok(store.get(key).is_some())
}

#[tauri::command]
pub async fn delete_api_key(
    app: tauri::AppHandle,
    key_type: String,
) -> Result<(), String> {
    let store = app.store("settings.json").map_err(|e| e.to_string())?;

    let key = match key_type.as_str() {
        "claude" => "api_keys.claude",
        "dataforseo" => "api_keys.dataforseo",
        _ => return Err(format!("Unknown key type: {}", key_type)),
    };

    let _ = store.delete(key);
    store.save().map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn store_wordpress_config(
    app: tauri::AppHandle,
    config: WordPressConfig,
) -> Result<(), String> {
    let store = app.store("settings.json").map_err(|e| e.to_string())?;

    store.set("wordpress.site_url", serde_json::Value::String(config.site_url));
    store.set("wordpress.username", serde_json::Value::String(config.username));
    store.set("wordpress.app_password", serde_json::Value::String(config.app_password));
    store.save().map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn get_wordpress_config(
    app: tauri::AppHandle,
) -> Result<Option<WordPressConfig>, String> {
    let store = app.store("settings.json").map_err(|e| e.to_string())?;

    let site_url = store.get("wordpress.site_url")
        .and_then(|v| v.as_str().map(|s| s.to_string()));
    let username = store.get("wordpress.username")
        .and_then(|v| v.as_str().map(|s| s.to_string()));
    let app_password = store.get("wordpress.app_password")
        .and_then(|v| v.as_str().map(|s| s.to_string()));

    if let (Some(site_url), Some(username), Some(app_password)) = (site_url, username, app_password) {
        Ok(Some(WordPressConfig {
            site_url,
            username,
            app_password,
        }))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub async fn test_wordpress_connection(
    app: tauri::AppHandle,
) -> Result<bool, String> {
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

    // Test by fetching WordPress REST API endpoint
    let url = format!("{}/wp-json/wp/v2/users/me", site_url);
    let client = reqwest::Client::new();

    let response = client
        .get(&url)
        .basic_auth(&username, Some(&app_password))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    Ok(response.status().is_success())
}
