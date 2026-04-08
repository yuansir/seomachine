use tauri::{AppHandle, Emitter, Manager};
use std::process::Command;

#[tauri::command]
pub async fn run_python_script(
    app: AppHandle,
    script: String,
    args: Vec<String>,
) -> Result<String, String> {
    let resource_path = app.path().resource_dir()
        .map_err(|e: tauri::Error| e.to_string())?;
    let script_path = resource_path.join("python-scripts").join(&script);

    // Emit start event
    let _ = app.emit("research-progress", serde_json::json!({
        "progress": 10,
        "message": "Starting research..."
    }));

    let output = Command::new("python3")
        .arg(script_path.to_str().unwrap_or(&script))
        .args(&args)
        .output()
        .map_err(|e| e.to_string())?;

    let _ = app.emit("research-progress", serde_json::json!({
        "progress": 90,
        "message": "Processing results..."
    }));

    if output.status.success() {
        let _ = app.emit("research-progress", serde_json::json!({
            "progress": 100,
            "message": "Complete"
        }));
        String::from_utf8(output.stdout).map_err(|e| e.to_string())
    } else {
        Err(String::from_utf8(output.stderr).unwrap_or_default())
    }
}
