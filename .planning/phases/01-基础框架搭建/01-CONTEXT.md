# Phase 1: 基础框架搭建 - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning

## Phase Boundary

搭建 Tauri + React + TypeScript 项目骨架，包括：
- 项目初始化和目录结构
- React UI 框架（shadcn/ui + TailwindCSS）
- Zustand 状态管理配置
- SQLite 数据库初始化
- 基本布局和导航组件
- 深色/浅色主题切换

## Implementation Decisions

### 1. 命令调用模式
- **D-01:** 采用**直接 Rust 命令**调用 Python 脚本
  - 前端 `invoke("run_script")` → Rust `std::process::Command` → `python3 script.py`
  - 不使用 tauri-plugin-shell

### 2. Python 输出格式
- **D-02:** Python 脚本输出 **JSON 格式**
  - 研究简报等展示内容：Python 输出 JSON，前端渲染 UI
  - 不直接输出 Markdown，需要时做转换

### 3. Claude API 密钥存储
- **D-03:** API 密钥**后端中转**模式
  - 密钥加密存储在 Rust 后端（tauri-plugin-store）
  - 前端只发送请求，不接触密钥
  - WordPress 密码同等待遇

### 4. 文章编辑器技术选型
- **D-04:** 使用 **@uiw/react-md-editor**
  - 轻量级 Markdown 编辑器
  - 支持实时预览
  - Phase 2 集成

### 5. 实时进度反馈
- **D-05:** 采用 **Tauri 事件系统**
  - Rust 端：`app.emit("progress", payload)`
  - 前端：`listen("progress", callback)`
  - 用于研究脚本等长时间操作的进度展示

### 6. 数据库 Schema
- **D-06:** SQLite 数据库设计
  ```sql
  -- articles 表：完整 Markdown 内容存储
  CREATE TABLE articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,  -- 完整 Markdown
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

  -- researches 表：JSON 格式存储研究内容
  CREATE TABLE researches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic TEXT NOT NULL,
      research_type TEXT NOT NULL,
      content TEXT NOT NULL,  -- JSON 格式
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- settings 表：加密存储配置
  CREATE TABLE settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- publish_logs 表
  CREATE TABLE publish_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL,
      wordpress_url TEXT,
      status TEXT,
      error_message TEXT,
      published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (article_id) REFERENCES articles(id)
  );
  ```

### 7. UI 组件库
- **D-07:** **完整 shadcn/ui 组件集**
  - 导航：Sidebar, Tabs
  - 表单：Input, Textarea, Select, Switch, Button
  - 数据展示：Card, Table, Badge
  - 反馈：Dialog, Toast, Progress, Skeleton
  - 编辑器相关：基于 @uiw/react-md-editor

### 8. 主题方案
- **D-08:** **浅色优先**，支持切换深色
  - 默认浅色模式
  - 支持手动切换
  - 考虑后续支持跟随系统

## Canonical Refs

### 源项目参考
- `/tmp/seomachine/README.md` — SEO Machine 原项目概述
- `/tmp/seomachine/CLAUDE.md` — 命令和代理架构说明
- `/tmp/seomachine/data_sources/modules/` — Python 分析模块参考

### 技术选型参考
- `.planning/research/tauri-python-integration.md` — Python 集成方案
- `.planning/research/ui-components.md` — UI 组件选型
- `.planning/ROADMAP.md` — Phase 1-4 路线图
- `.planning/REQUIREMENTS.md` — 功能需求规格

## Code Context

### 项目结构（Phase 1 创建）
```
seomachine-app/
├── src/                    # React 前端
│   ├── components/         # UI 组件
│   │   ├── ui/            # shadcn/ui 组件
│   │   ├── layout/        # 布局组件
│   │   └── features/      # 功能组件
│   ├── stores/            # Zustand stores
│   ├── hooks/             # 自定义 hooks
│   ├── lib/              # 工具函数
│   └── App.tsx
├── src-tauri/            # Rust 后端
│   ├── src/
│   │   ├── main.rs       # 入口
│   │   ├── commands/     # Tauri commands
│   │   └── db.rs         # 数据库操作
│   └── Cargo.toml
└── python-scripts/        # Python 脚本（从源项目复制）
```

### 关键 Rust Command 示例
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

    if output.status.success() {
        String::from_utf8(output.stdout).map_err(|e| e.to_string())
    } else {
        Err(String::from_utf8(output.stderr).unwrap_or_default())
    }
}
```

## Specifics

### 技术约束
- Tauri 2.x
- React 18.x + TypeScript 5.x
- Vite 6.x
- pnpm 9.x
- SQLite via tauri-plugin-sql
- 密钥加密 via tauri-plugin-store

### 用户体验要求
- 应用启动 < 3 秒
- 界面响应 < 100ms
- 进度指示器用于 > 3 秒的操作

## Deferred Ideas

**以下想法被记录但不属于 Phase 1：**
- 自动化工作流（Phase 3+）
- 批量处理功能（Phase 3+）
- 团队协作功能（未来）
- 云端同步（未来）

---

*Phase: 01-基础框架搭建*
*Context gathered: 2026-04-08*
