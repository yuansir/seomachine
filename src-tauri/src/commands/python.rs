use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_store::StoreExt;
use std::path::PathBuf;
use std::time::Duration;

/// Resolve the Python executable to use, in priority order:
///   1. App-local venv: <app_data>/python-venv/bin/python3 (macOS/Linux)
///                  or  <app_data>/python-venv/Scripts/python.exe (Windows)
///   2. System python3 / python (fallback, with a warning)
///
/// The app-local venv is created by `setup_python_env` on first use and is
/// fully isolated from the user's system Python.
fn resolve_python_executable(app: &AppHandle) -> Option<PathBuf> {
    // 1. Check for app-local venv (created by setup_python_env)
    if let Ok(data_dir) = app.path().app_data_dir() {
        let venv_python = if cfg!(windows) {
            data_dir.join("python-venv").join("Scripts").join("python.exe")
        } else {
            data_dir.join("python-venv").join("bin").join("python3")
        };
        if venv_python.exists() {
            return Some(venv_python);
        }
    }

    // 2. Fall back to system Python (may not have required packages)
    for candidate in ["python3", "python"] {
        if which_python(candidate) {
            return Some(PathBuf::from(candidate));
        }
    }

    None
}

fn which_python(name: &str) -> bool {
    std::process::Command::new(name)
        .arg("--version")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

#[tauri::command]
pub async fn run_python_script(
    app: AppHandle,
    script: String,
    args: Vec<String>,
) -> Result<String, String> {
    let resource_path = app.path().resource_dir()
        .map_err(|e: tauri::Error| e.to_string())?;
    let script_path = resource_path.join("python-scripts").join(&script);

    let python_exe = resolve_python_executable(&app).ok_or_else(|| {
        "未找到 Python 3 运行环境。\n请先在「设置 → 环境」中完成 Python 环境初始化，或在系统中安装 Python 3.10+。".to_string()
    })?;

    let _ = app.emit("research-progress", serde_json::json!({
        "progress": 10,
        "message": "正在启动研究脚本..."
    }));

    let timeout_duration = Duration::from_secs(120);

    let cmd_future = tokio::process::Command::new(&python_exe)
        .arg(script_path.to_str().unwrap_or(&script))
        .args(&args)
        // Set working directory to script dir so relative imports work
        .current_dir(resource_path.join("python-scripts"))
        // Pass API credentials as environment variables
        .envs(collect_env_vars(&app))
        .output();

    let output = match tokio::time::timeout(timeout_duration, cmd_future).await {
        Ok(Ok(out)) => out,
        Ok(Err(e)) => {
            let err_msg = if e.to_string().contains("No such file") {
                format!("找不到脚本文件: {}，请确认 python-scripts 目录已正确打包", script)
            } else if e.to_string().contains("permission denied") || e.to_string().contains("Permission denied") {
                format!("Python 可执行文件权限不足: {:?}", python_exe)
            } else {
                format!("脚本执行失败: {}", e)
            };
            return Err(err_msg);
        }
        Err(_) => {
            return Err(format!(
                "脚本执行超时（{}秒），请减少关键词数量或检查网络连接",
                timeout_duration.as_secs()
            ));
        }
    };

    let _ = app.emit("research-progress", serde_json::json!({
        "progress": 90,
        "message": "正在处理结果..."
    }));

    if output.status.success() {
        if !output.stderr.is_empty() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            println!("Script warning (non-fatal): {}", stderr);
        }
        let _ = app.emit("research-progress", serde_json::json!({
            "progress": 100,
            "message": "完成"
        }));
        String::from_utf8(output.stdout).map_err(|e| e.to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let user_message = parse_python_error(&stderr, &script);
        Err(user_message)
    }
}

/// Check whether the isolated Python venv exists and has required packages.
/// Returns a JSON object: { ready: bool, python_version: str, venv_path: str }
#[tauri::command]
pub async fn check_python_env(app: AppHandle) -> Result<serde_json::Value, String> {
    let python_exe = resolve_python_executable(&app);

    match python_exe {
        None => Ok(serde_json::json!({
            "ready": false,
            "source": "none",
            "message": "未找到 Python 3，请点击「初始化环境」"
        })),
        Some(exe) => {
            // Get version
            let ver_out = std::process::Command::new(&exe)
                .args(["--version"])
                .output()
                .ok();
            let version = ver_out
                .and_then(|o| String::from_utf8(o.stdout).ok()
                    .or_else(|| String::from_utf8(o.stderr).ok()))
                .map(|s| s.trim().to_string())
                .unwrap_or_default();

            // Check if key packages are importable
            let pkg_check = std::process::Command::new(&exe)
                .args(["-c", "import dotenv, requests; print('ok')"])
                .output()
                .ok();
            let packages_ok = pkg_check
                .map(|o| o.status.success())
                .unwrap_or(false);

            let is_venv = exe.to_string_lossy().contains("python-venv");
            let source = if is_venv { "venv" } else { "system" };

            Ok(serde_json::json!({
                "ready": packages_ok,
                "source": source,
                "python_version": version,
                "exe_path": exe.to_string_lossy(),
                "packages_ok": packages_ok,
                "message": if packages_ok {
                    format!("{} ({})", version, if is_venv { "隔离环境 ✓" } else { "系统 Python" })
                } else {
                    format!("{} — 依赖包未安装，请点击「初始化环境」", version)
                }
            }))
        }
    }
}

/// Create an isolated venv in <app_data>/python-venv and install requirements.
/// This runs synchronously and emits progress events.
/// Requirements file is read from the bundled python-scripts/requirements.txt.
#[tauri::command]
pub async fn setup_python_env(app: AppHandle) -> Result<String, String> {
    let data_dir = app.path().app_data_dir()
        .map_err(|e: tauri::Error| e.to_string())?;
    let resource_path = app.path().resource_dir()
        .map_err(|e: tauri::Error| e.to_string())?;

    let venv_dir = data_dir.join("python-venv");
    let requirements_path = resource_path.join("python-scripts").join("requirements.txt");

    emit_setup_progress(&app, 5, "正在检查系统 Python...");

    // Find system Python 3 to bootstrap the venv
    let system_python = find_system_python().ok_or_else(|| {
        "未找到系统 Python 3（3.10+）。\n请从 https://www.python.org/downloads/ 安装 Python 后重试。".to_string()
    })?;

    emit_setup_progress(&app, 15, "正在创建隔离 Python 环境...");

    // Create the venv if it doesn't exist
    if !venv_dir.exists() {
        let venv_out = tokio::process::Command::new(&system_python)
            .args(["-m", "venv", venv_dir.to_str().unwrap_or("")])
            .output()
            .await
            .map_err(|e| format!("创建 venv 失败: {}", e))?;

        if !venv_out.status.success() {
            let err = String::from_utf8_lossy(&venv_out.stderr);
            return Err(format!("venv 创建失败: {}", err));
        }
    }

    // Venv Python executable
    let venv_python = if cfg!(windows) {
        venv_dir.join("Scripts").join("python.exe")
    } else {
        venv_dir.join("bin").join("python3")
    };

    emit_setup_progress(&app, 40, "正在升级 pip...");

    // Upgrade pip silently
    let _ = tokio::process::Command::new(&venv_python)
        .args(["-m", "pip", "install", "--upgrade", "pip", "--quiet"])
        .output()
        .await;

    emit_setup_progress(&app, 55, "正在安装依赖包...");

    // Install requirements
    let pip_args: Vec<&str> = if requirements_path.exists() {
        vec!["-m", "pip", "install", "-r", requirements_path.to_str().unwrap_or(""), "--quiet"]
    } else {
        // Fallback: install known minimal deps
        vec!["-m", "pip", "install", "python-dotenv", "requests", "--quiet"]
    };

    let install_timeout = Duration::from_secs(300); // 5 min for slow connections
    let install_future = tokio::process::Command::new(&venv_python)
        .args(&pip_args)
        .output();

    let pip_out = match tokio::time::timeout(install_timeout, install_future).await {
        Ok(Ok(out)) => out,
        Ok(Err(e)) => return Err(format!("pip 安装失败: {}", e)),
        Err(_) => return Err("依赖包安装超时（5分钟），请检查网络连接后重试".to_string()),
    };

    if !pip_out.status.success() {
        let err = String::from_utf8_lossy(&pip_out.stderr);
        return Err(format!("依赖安装失败: {}", err));
    }

    emit_setup_progress(&app, 95, "正在验证环境...");

    // Verify packages importable
    let verify = tokio::process::Command::new(&venv_python)
        .args(["-c", "import dotenv, requests; print('ok')"])
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if !verify.status.success() {
        return Err("环境验证失败，依赖包可能未正确安装".to_string());
    }

    emit_setup_progress(&app, 100, "Python 环境初始化完成");

    // Return version info
    let ver = tokio::process::Command::new(&venv_python)
        .arg("--version")
        .output()
        .await
        .ok()
        .and_then(|o| String::from_utf8(o.stdout).ok()
            .or_else(|| String::from_utf8(o.stderr).ok()))
        .map(|s| s.trim().to_string())
        .unwrap_or_else(|| "Python 3".to_string());

    Ok(format!("环境初始化成功。{} 已就绪，所有依赖已安装。", ver))
}

fn find_system_python() -> Option<PathBuf> {
    for candidate in ["python3", "python3.13", "python3.12", "python3.11", "python3.10", "python"] {
        let out = std::process::Command::new(candidate)
            .args(["--version"])
            .output();
        if let Ok(o) = out {
            if o.status.success() {
                // Ensure it's Python 3
                let ver = String::from_utf8_lossy(&o.stdout).to_string()
                    + &String::from_utf8_lossy(&o.stderr).to_string();
                if ver.contains("Python 3") {
                    return Some(PathBuf::from(candidate));
                }
            }
        }
    }
    None
}

fn emit_setup_progress(app: &AppHandle, progress: u8, message: &str) {
    let _ = app.emit("python-setup-progress", serde_json::json!({
        "progress": progress,
        "message": message
    }));
}

fn parse_python_error(stderr: &str, script: &str) -> String {
    let stderr_lower = stderr.to_lowercase();

    if stderr_lower.contains("importerror") || stderr_lower.contains("modulenotfounderror") {
        if stderr_lower.contains("dataforseo") || stderr_lower.contains("modules.") {
            return String::from("Python 依赖或脚本模块缺失。请在「设置 → 环境」重新初始化 Python 环境。");
        }
        if stderr_lower.contains("dotenv") {
            return String::from("依赖包 python-dotenv 未安装。请在「设置 → 环境」点击「初始化环境」。");
        }
        return format!("Python 模块导入失败，请重新初始化环境: {}", stderr.lines().last().unwrap_or("未知错误"));
    }

    if stderr_lower.contains("syntaxerror") {
        return format!("脚本语法错误，请联系开发者修复: {}", script);
    }
    if stderr_lower.contains("timeout") || stderr_lower.contains("timed out") {
        return String::from("脚本执行超时，请减少关键词数量或稍后重试");
    }
    if stderr_lower.contains("api key") || stderr_lower.contains("unauthorized") || stderr_lower.contains("invalid api") {
        return String::from("API 密钥无效或已过期，请在设置中更新密钥");
    }
    if stderr_lower.contains("rate limit") || stderr_lower.contains("429") {
        return String::from("API 请求频率超限，请稍后重试");
    }
    if stderr_lower.contains("connection") || stderr_lower.contains("network") {
        return String::from("网络连接失败，请检查网络后重试");
    }

    let last_line = stderr.lines().last().unwrap_or("未知错误").trim();
    if last_line.is_empty() {
        return format!("脚本执行失败（{}），请稍后重试", script);
    }
    last_line.to_string()
}

/// Collect API credentials from the Tauri store and return as env var pairs.
/// These are passed to Python scripts so they can call external APIs.
fn collect_env_vars(app: &AppHandle) -> Vec<(String, String)> {
    let mut vars: Vec<(String, String)> = Vec::new();

    // Try to read from settings.json store (fire-and-forget; if unavailable just skip)
    if let Ok(store) = app.store("settings.json") {
        if let Some(key) = store.get("dataforseoApiKey").and_then(|v| v.as_str().map(String::from)) {
            // Key may be stored as "login:password" or just the password with login separate
            if key.contains(':') {
                let parts: Vec<&str> = key.splitn(2, ':').collect();
                vars.push(("DATAFORSEO_LOGIN".into(), parts[0].to_string()));
                vars.push(("DATAFORSEO_PASSWORD".into(), parts[1].to_string()));
            } else {
                vars.push(("DATAFORSEO_API_KEY".into(), key));
            }
        }
    }

    vars
}

/// Utility: return the path of the isolated venv (for display in settings)
#[allow(dead_code)]
pub fn get_venv_path(app: &AppHandle) -> Option<PathBuf> {
    app.path().app_data_dir().ok().map(|d| d.join("python-venv"))
}

