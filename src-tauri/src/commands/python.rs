use tauri::{AppHandle, Emitter, Manager};
use std::time::Duration;

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
        "message": "正在启动研究脚本..."
    }));

    let timeout_duration = Duration::from_secs(60);

    let cmd_future = tokio::process::Command::new("python3")
        .arg(script_path.to_str().unwrap_or(&script))
        .args(&args)
        .output();

    let output = match tokio::time::timeout(timeout_duration, cmd_future).await {
        Ok(Ok(out)) => out,
        Ok(Err(e)) => {
            let err_msg = if e.to_string().contains("No such file") {
                format!("找不到脚本文件: {}，请确认 python-scripts 目录已正确打包", script)
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
        // Also capture stderr for warnings (non-fatal)
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

        // Parse stderr to create user-friendly Chinese error messages
        let user_message = parse_python_error(&stderr, &script);

        Err(user_message)
    }
}

/**
 * Parse Python stderr and return user-friendly Chinese error messages
 */
fn parse_python_error(stderr: &str, script: &str) -> String {
    let stderr_lower = stderr.to_lowercase();

    // Check for common Python error types
    if stderr_lower.contains("importerror") || stderr_lower.contains("modulenotfounderror") {
        if stderr_lower.contains("dataforseo") {
            return String::from("Python 依赖缺失，请安装 dataforseo_client: pip install dataforseo-client");
        }
        if stderr_lower.contains("anthropic") {
            return String::from("Python 依赖缺失，请安装 anthropic: pip install anthropic");
        }
        if stderr_lower.contains("nltk") {
            return String::from("Python 依赖缺失，请安装 nltk: pip install nltk");
        }
        return format!("Python 模块导入失败，请检查依赖安装: {}", stderr.lines().last().unwrap_or("未知错误"));
    }

    if stderr_lower.contains("syntaxerror") {
        return format!("脚本语法错误，请联系开发者修复: {}", script);
    }

    if stderr_lower.contains("timeout") || stderr_lower.contains("timed out") {
        return String::from("脚本执行超时（30秒），请减少关键词数量或稍后重试");
    }

    if stderr_lower.contains("keyboardinterrupt") {
        return String::from("用户取消了操作");
    }

    if stderr_lower.contains("keyboardquit") {
        return String::from("用户退出了程序");
    }

    // Check for API key issues
    if stderr_lower.contains("api key") || stderr_lower.contains("unauthorized") || stderr_lower.contains("invalid api") {
        return String::from("API 密钥无效或已过期，请在设置中更新密钥");
    }

    if stderr_lower.contains("rate limit") || stderr_lower.contains("429") {
        return String::from("API 请求频率超限，请稍后重试");
    }

    if stderr_lower.contains("connection") || stderr_lower.contains("network") {
        return String::from("网络连接失败，请检查网络后重试");
    }

    // If no specific pattern matched, return the last line of stderr as a generic error
    let last_line = stderr.lines().last().unwrap_or("未知错误").trim();
    if last_line.is_empty() {
        return format!("脚本执行失败（{}），请稍后重试", script);
    }

    format!("{}", last_line)
}
