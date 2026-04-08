# Phase 1: 基础框架搭建 - 执行计划

## 概览
搭建 Tauri + React + TypeScript 桌面应用骨架，包括项目初始化、shadcn/ui 组件库配置、布局组件、主题系统、Zustand 状态管理和 SQLite 数据库基础。

## 任务阶段

### 阶段 1: 项目初始化 (~30 分钟)
- T-101: 初始化 Tauri 2.x + React + TypeScript 项目
- T-102: 配置 pnpm 包管理器
- T-103: 安装和配置 TailwindCSS 4.x (使用 @tailwindcss/vite)
- T-104: 初始化 shadcn/ui 组件库
- T-105: 安装 Zustand 状态管理
- T-106: 配置 tauri-plugin-store 和 tauri-plugin-sql

### 阶段 2: UI 框架 (~1 小时)
- T-110: 创建应用布局组件 (AppShell, Header, Sidebar, Footer)
- T-111: 实现深色/浅色主题切换
- T-112: 创建导航菜单和路由
- T-113: 实现设置页面框架

### 阶段 3: Rust 后端基础 (~30 分钟)
- T-120: 创建 Rust 命令结构
- T-121: 配置 Python 脚本调用基础命令
- T-122: 实现 SQLite 数据库初始化
- T-123: 配置 tauri.conf.json 资源

### 阶段 4: 验证 (~15 分钟)
- 验证应用可以成功启动
- 验证导航切换正常工作
- 验证主题切换生效
- 验证数据库连接正常

## 依赖关系

```
[T-101] Tauri Init
    ↓
[T-102] pnpm config
    ↓
[T-103] TailwindCSS ──┐
[T-104] shadcn/ui ─────┼─> [T-110] Layout Components ──> [T-112] Navigation
[T-105] Zustand ───────┤                                    ↓
[T-106] Plugins ──────┘                            [T-111] Theme Toggle
                                                         ↓
                                                  [T-113] Settings Page
                                                         ↓
[T-120] Rust Commands <── [T-122] DB Init <── [T-123] tauri.conf
```

## 执行计划

| Plan | 目标 | Tasks | Wave | Files |
|------|------|-------|------|-------|
| 01 | 项目初始化 | 6 | 1 | package.json, vite.config.ts, src-tauri/* |
| 02 | UI 组件库 | 3 | 1 | src/components/ui/*, src/lib/utils.ts |
| 03 | 布局与主题 | 3 | 2 | src/components/layout/*, src/stores/* |
| 04 | Rust 后端 | 3 | 2 | src-tauri/src/*, tauri.conf.json |
| 05 | 设置与验证 | 2 | 3 | src/pages/*, 集成测试 |

## 风险与缓解

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| TailwindCSS 4.x 配置错误 | Medium | High | 使用 @tailwindcss/vite 插件而非 PostCSS |
| shadcn/ui 初始化失败 | Low | Medium | 使用官方 CLI 初始化，检查 Node 版本 |
| tauri-plugin-sql 路径问题 | Medium | High | 使用 app.path().app_data_dir() 获取路径 |
| 主题闪烁 (flash) | Medium | Low | Zustand persist 添加 hydration 检查 |

## 输出文件
- PLAN.md (本文件)
- PLANS/01-PROJECT-INIT-PLAN.md
- PLANS/02-UI-COMPONENTS-PLAN.md
- PLANS/03-LAYOUT-THEME-PLAN.md
- PLANS/04-RUST-BACKEND-PLAN.md
- PLANS/05-SETTINGS-VALIDATION-PLAN.md

---

*Phase: 01-基础框架搭建*
*Plan created: 2026-04-08*
