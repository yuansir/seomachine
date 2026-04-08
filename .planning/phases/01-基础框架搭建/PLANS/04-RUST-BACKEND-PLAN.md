---
phase: 01-基础框架搭建
plan: 04
type: execute
wave: 2
depends_on: [01]
files_modified:
  - src-tauri/src/lib.rs
  - src-tauri/src/commands/mod.rs
  - src-tauri/src/commands/python.rs
  - src-tauri/src/db.rs
  - src-tauri/tauri.conf.json
autonomous: true
requirements:
  - REQ-R-001
  - REQ-R-004
---

<objective>
创建 Rust 后端基础结构，包括命令模块、数据库初始化和 Python 脚本调用。
</objective>

<context>
@/tmp/seomachine/.planning/phases/01-基础框架搭建/01-CONTEXT.md

## Locked Decisions
- D-01: Python via Rust std::process::Command (NOT tauri-plugin-shell)
- D-02: Python output JSON format
- D-06: SQLite via tauri-plugin-sql

## Database Schema (from CONTEXT.md)
```sql
CREATE TABLE articles (...);
CREATE TABLE researches (...);
CREATE TABLE settings (...);
CREATE TABLE publish_logs (...);
```

## Key Command Pattern
```rust
#[tauri::command]
async fn run_python_script(
    app: AppHandle,
    script: String,
    args: Vec<String>,
) -> Result<String, String> {
    let output = std::process::Command::new("python3")
        .arg(&script)
        .args(&args)
        .current_dir("resources/python-scripts")
        .output()
        .map_err(|e| e.to_string())?;
    // ...
}
```
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Rust command structure</name>
  <files>src-tauri/src/commands/mod.rs, src-tauri/src/commands/python.rs</files>
  <action>
    创建 Rust 命令模块结构：

    **src-tauri/src/commands/mod.rs**
    ```rust
    pub mod python;
    ```

    **src-tauri/src/commands/python.rs**
    创建 run_python_script 命令：
    - 接收 script 名称和 args
    - 使用 std::process::Command 执行 python3
    - 从资源目录加载脚本
    - 返回 stdout 或 stderr

    ```rust
    use tauri::AppHandle;
    use std::process::Command;

    #[tauri::command]
    pub async fn run_python_script(
        app: AppHandle,
        script: String,
        args: Vec<String>,
    ) -> Result<String, String> {
        let resource_path = app.path().resource_dir()
            .map_err(|e| e.to_string())?;
        let script_path = resource_path.join("python-scripts").join(&script);

        let output = Command::new("python3")
            .arg(script_path.to_str().unwrap_or(&script))
            .args(&args)
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            String::from_utf8(output.stdout).map_err(|e| e.to_string())
        } else {
            Err(String::from_utf8(output.stderr).unwrap_or_default())
        }
    }
    ```
  </action>
  <verify>
    <automated>test -f src-tauri/src/commands/python.rs && grep -l "tauri::command" src-tauri/src/commands/python.rs</automated>
  </verify>
  <done>Rust 命令结构创建完成</done>
</task>

<task type="auto">
  <name>Task 2: Create database initialization</name>
  <files>src-tauri/src/db.rs</files>
  <action>
    创建数据库迁移文件 src-tauri/src/db.rs：

    ```rust
    use tauri_plugin_sql::{Migration, MigrationKind};

    pub fn get_migrations() -> Vec<Migration> {
        vec![
            Migration {
                version: 1,
                description: "create_initial_tables",
                sql: r#"
                    CREATE TABLE IF NOT EXISTS articles (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL,
                        content TEXT NOT NULL,
                        meta_title TEXT,
                        meta_description TEXT,
                        primary_keyword TEXT,
                        status TEXT DEFAULT 'draft',
                        research_id INTEGER,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        published_at DATETIME,
                        wordpress_url TEXT,
                        FOREIGN KEY (research_id) REFERENCES researches(id)
                    );

                    CREATE TABLE IF NOT EXISTS researches (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        topic TEXT NOT NULL,
                        research_type TEXT NOT NULL,
                        content TEXT NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    );

                    CREATE TABLE IF NOT EXISTS settings (
                        key TEXT PRIMARY KEY,
                        value TEXT NOT NULL,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    );

                    CREATE TABLE IF NOT EXISTS publish_logs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        article_id INTEGER NOT NULL,
                        wordpress_url TEXT,
                        status TEXT,
                        error_message TEXT,
                        published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (article_id) REFERENCES articles(id)
                    );
                "#,
                kind: MigrationKind::Up,
            },
        ]
    }
    ```
  </action>
  <verify>
    <automated>test -f src-tauri/src/db.rs && grep -l "Migration" src-tauri/src/db.rs</automated>
  </verify>
  <done>数据库初始化创建完成</done>
</task>

<task type="auto">
  <name>Task 3: Update lib.rs with plugins and commands</name>
  <files>src-tauri/src/lib.rs</files>
  <action>
    更新 src-tauri/src/lib.rs 注册 plugins 和 commands：

    ```rust
    mod commands;
    mod db;

    #[cfg_attr(mobile, tauri::mobile_entry_point)]
    pub fn run() {
        tauri::Builder::default()
            .plugin(
                tauri_plugin_sql::Builder::default()
                    .add_migrations("sqlite:seomachine.db", db::get_migrations())
                    .build()
            )
            .plugin(tauri_plugin_store::Builder::new().build())
            .invoke_handler(tauri::generate_handler![
                commands::python::run_python_script,
            ])
            .run(tauri::generate_context!())
            .expect("error while running tauri application");
    }
    ```
  </action>
  <verify>
    <automated>grep -l "tauri_plugin_sql\|tauri_plugin_store" src-tauri/src/lib.rs</automated>
  </verify>
  <done>lib.rs 更新完成</done>
</task>

<task type="auto">
  <name>Task 4: Update tauri.conf.json with resources</name>
  <files>src-tauri/tauri.conf.json</files>
  <action>
    更新 tauri.conf.json 添加 python-scripts 资源配置：

    ```json
    {
      "bundle": {
        "resources": {
          "python-scripts/*": "python-scripts/"
        }
      }
    }
    ```

    注意：这为打包后的应用添加 Python 脚本资源。开发环境下脚本直接访问文件系统。
  </action>
  <verify>
    <automated>grep -l "python-scripts" src-tauri/tauri.conf.json</automated>
  </verify>
  <done>tauri.conf.json 资源配置完成</done>
</task>

</tasks>

<verification>
- [ ] Rust 代码编译通过
- [ ] tauri-plugin-sql 和 tauri-plugin-store 正确初始化
- [ ] Python 命令可以调用
</verification>

<success_criteria>
Rust 后端基础结构完成，plugins 和 commands 正确注册。
</success_criteria>

<output>
After completion, create `.planning/phases/01-基础框架搭建/{phase}-04-SUMMARY.md`
</output>
