# Tauri Python 集成研究

## 方案对比

### 方案 A: Rust std::process::Command (推荐)
```rust
#[tauri::command]
fn run_python_script(script: String, args: Vec<String>) -> Result<String, String> {
    let output = std::process::Command::new("python3")
        .arg(&script)
        .args(&args)
        .current_dir("resources/python-scripts")
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        String::from_utf8(output.stdout).map_err(|e| e.to_string())
    } else {
        Err(String::from_utf8(output.stderr).unwrap_or_default())
    }
}
```

**优点**:
- 实现简单
- 调试容易
- 无版本兼容问题
- 可以使用系统 Python

**缺点**:
- 需要用户安装 Python
- 依赖系统环境

### 方案 B: PyInstaller 打包
将 Python 脚本打包为独立可执行文件

**优点**:
- 不需要用户安装 Python
- 部署简单

**缺点**:
- 打包体积大（~50-100MB）
- 跨平台打包复杂
- 调试困难

### 方案 C: Embedded Python
在 Rust 中嵌入 Python 解释器

**优点**:
- 性能最好
- 集成紧密

**缺点**:
- 实现复杂
- 版本管理困难
- 打包复杂

## 建议

**推荐方案 A**，原因：
1. SEO Machine 目标用户通常是开发者/营销人员，通常有 Python 环境
2. 实施简单，迭代快速
3. 可以后续轻松切换到方案 B

**备选方案 B** 用于发布版本：
- 可以提供打包好的 Python 环境
- 用户仍然可以通过命令行指定 Python 路径

## 关键实现点

1. **脚本路径**: 使用 Tauri 的 `resource_dir()` 获取资源路径
2. **工作目录**: 设置为资源目录，确保脚本可以找到依赖
3. **环境变量**: 传递必要的环境变量（如 API 密钥）
4. **超时处理**: 设置命令执行超时，避免脚本卡住
5. **错误处理**: 捕获 stdout 和 stderr，正确返回错误信息

## 参考资料

- [Tauri Shell Plugin](https://v2.tauri.app/plugin/shell/)
- [Rust std::process::Command](https://doc.rust-lang.org/std/process/struct.Command.html)
- [PyInstaller Documentation](https://pyinstaller.org/en/stable/)
