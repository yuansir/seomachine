---
phase: 01-基础框架搭建
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - vite.config.ts
  - src/main.tsx
  - src/App.tsx
  - src/index.css
  - src-tauri/Cargo.toml
  - src-tauri/tauri.conf.json
autonomous: true
requirements:
  - REQ-R-001
  - REQ-R-002
  - REQ-R-003
---

<objective>
初始化 Tauri 2.x + React + TypeScript 项目骨架，配置 pnpm、TailwindCSS 4.x 和核心依赖。
</objective>

<context>
@/tmp/seomachine/.planning/phases/01-基础框架搭建/01-CONTEXT.md
@/tmp/seomachine/.planning/phases/01-基础框架搭建/RESEARCH.md

## Locked Decisions (must honor)
- D-01: Python via Rust std::process::Command
- D-06: SQLite via tauri-plugin-sql
- D-07: Full shadcn/ui
- D-08: Light-first theme

## Key Tech Versions
- Tauri CLI: 0.15.0
- @tauri-apps/api: 2.10.1
- @tauri-apps/plugin-sql: 2.4.0
- @tauri-apps/plugin-store: 2.4.2
- tailwindcss: 4.2.2
- zustand: 5.0.12
</context>

<tasks>

<task type="auto">
  <name>Task 1: Initialize Tauri project</name>
  <files>package.json, vite.config.ts, src/main.tsx, src/App.tsx, src-tauri/</files>
  <action>
    使用 npm create tauri-app 初始化项目：

    ```bash
    cd /tmp/seomachine
    npm create tauri-app@latest seomachine -- --template react-ts --manager pnpm --yes
    mv seomachine/* seomachine/.[!.]* . 2>/dev/null || true
    rmdir seomachine
    ```

    验证创建成功：
    - package.json 存在且包含 tauri 依赖
    - src-tauri/ 目录存在
    - src/App.tsx 存在
  </action>
  <verify>
    <automated>ls package.json src-tauri/Cargo.toml src/App.tsx</automated>
  </verify>
  <done>Tauri + React + TypeScript 项目骨架创建完成</done>
</task>

<task type="auto">
  <name>Task 2: Install dependencies</name>
  <files>package.json, pnpm-lock.yaml</files>
  <action>
    安装所有核心依赖：

    ```bash
    cd /tmp/seomachine
    pnpm install

    # Tauri plugins
    pnpm add @tauri-apps/api @tauri-apps/plugin-sql @tauri-apps/plugin-store

    # UI dependencies
    pnpm add tailwindcss @tailwindcss/vite class-variance-authority clsx tailwind-merge lucide-react

    # State management
    pnpm add zustand
    ```

    注意：不要安装 vitest 和 testing-library - 这些在 Wave 0 测试任务中添加
  </action>
  <verify>
    <automated>cat package.json | grep -E '"tailwindcss|@tauri-apps|zustand|lucide-react'</automated>
  </verify>
  <done>所有依赖安装完成</done>
</task>

<task type="auto">
  <name>Task 3: Configure TailwindCSS 4.x with Vite</name>
  <files>vite.config.ts, src/index.css</files>
  <action>
    更新 vite.config.ts 使用 @tailwindcss/vite 插件（不是 PostCSS）：

    ```typescript
    import { defineConfig } from "vite";
    import react from "@vitejs/plugin-react";
    import tailwindcss from "@tailwindcss/vite";

    export default defineConfig({
      plugins: [react(), tailwindcss()],
    });
    ```

    更新 src/index.css 添加 TailwindCSS 导入：
    ```css
    @import "tailwindcss";
    ```
  </action>
  <verify>
    <automated>grep -l "@tailwindcss/vite" vite.config.ts && grep -l "@import" src/index.css</automated>
  </verify>
  <done>TailwindCSS 4.x 配置完成</done>
</task>

<task type="auto">
  <name>Task 4: Configure Tauri plugins in Cargo.toml</name>
  <files>src-tauri/Cargo.toml</files>
  <action>
    添加 tauri-plugin-sql 和 tauri-plugin-store 依赖到 Cargo.toml：

    ```toml
    [dependencies]
    tauri-plugin-sql = { version = "2.4.0", features = ["sqlite"] }
    tauri-plugin-store = "2.4.2"
    serde = { version = "1", features = ["derive"] }
    serde_json = "1"
    ```
  </action>
  <verify>
    <automated>grep -E "tauri-plugin-sql|tauri-plugin-store" src-tauri/Cargo.toml</automated>
  </verify>
  <done>Rust 依赖配置完成</done>
</task>

<task type="auto">
  <name>Task 5: Configure tauri.conf.json</name>
  <files>src-tauri/tauri.conf.json</files>
  <action>
    更新 tauri.conf.json：
    - 设置 app 名称为 "SEO Machine"
    - 启用 devtools（开发用）
    - 配置 plugins 节点（即使为空，Tauri 2.x 需要声明）

    ```json
    {
      "productName": "SEO Machine",
      "identifier": "com.seomachine.app",
      "plugins": {
        "sql": {},
        "store": {}
      }
    }
    ```
  </action>
  <verify>
    <automated>grep -E "SEO Machine|plugins" src-tauri/tauri.conf.json</automated>
  </verify>
  <done>tauri.conf.json 配置完成</done>
</task>

<task type="auto">
  <name>Task 6: Create src/lib/utils.ts</name>
  <files>src/lib/utils.ts</files>
  <action>
    创建 cn() utility 函数（shadcn/ui 组件需要）：

    ```typescript
    import { clsx, type ClassValue } from "clsx";
    import { twMerge } from "tailwind-merge";

    export function cn(...inputs: ClassValue[]) {
      return twMerge(clsx(inputs));
    }
    ```
  </action>
  <verify>
    <automated>test -f src/lib/utils.ts && grep -l "export function cn" src/lib/utils.ts</automated>
  </verify>
  <done>Utils 模块创建完成</done>
</task>

</tasks>

<verification>
- [ ] `pnpm tauri dev` 可以启动应用
- [ ] `pnpm dev` 可以启动前端
- [ ] package.json 包含所有依赖
- [ ] vite.config.ts 使用 @tailwindcss/vite
</verification>

<success_criteria>
项目骨架创建完成，所有核心依赖安装，TailwindCSS 4.x 配置正确。
</success_criteria>

<output>
After completion, create `.planning/phases/01-基础框架搭建/{phase}-01-SUMMARY.md`
</output>
