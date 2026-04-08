# Phase 1: 基础框架搭建 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-08
**Phase:** 01-基础框架搭建
**Areas discussed:** 8 个决策领域

---

## 1. 命令调用模式

| Option | Description | Selected |
|--------|-------------|----------|
| 方案 A: 直接 Rust 命令 | invoke → std::process::Command → python3 | ✓ |
| 方案 B: Shell Plugin | tauri-plugin-shell，需用户授权 | |

**User's choice:** 方案 A: 直接 Rust 命令
**Notes:** 简单直接，调试容易

---

## 2. Python 输出格式

| Option | Description | Selected |
|--------|-------------|----------|
| 方案 A: JSON | 结构化数据，前后端解析简单 | ✓ |
| 方案 B: Markdown | 直接渲染展示，但处理复杂 | |

**User's choice:** 方案 A: JSON
**Notes:** 部分脚本（如研究简报）可能仍需输出 Markdown 用于展示，会做转换处理

---

## 3. Claude API 密钥存储

| Option | Description | Selected |
|--------|-------------|----------|
| 方案 A: 前端直接调用 | 简单但密钥暴露在前端 | |
| 方案 B: 后端中转 | 密钥加密存在 Rust 后端，更安全 | ✓ |

**User's choice:** 方案 B: 后端中转
**Notes:** API 密钥安全存储在 Rust 后端

---

## 4. 文章编辑器技术选型

| Option | Description | Selected |
|--------|-------------|----------|
| 方案 A: @uiw/react-md-editor | 轻量级，支持预览 | ✓ |
| 方案 B: 自定义组合 | react-markdown + CodeMirror，完全可控 | |
| 方案 C: Monaco Editor | VSCode 级功能，体积大 | |

**User's choice:** 方案 A: @uiw/react-md-editor
**Notes:** 平衡功能和体积

---

## 5. 实时进度反馈

| Option | Description | Selected |
|--------|-------------|----------|
| 方案 A: Tauri 事件 | Rust emit → 前端 listen，实时精确 | ✓ |
| 方案 B: 轮询 | 前端每 2 秒轮询，简单但有延迟 | |

**User's choice:** 方案 A: Tauri 事件
**Notes:** 用于研究脚本等长时间操作的进度展示

---

## 6. 数据库 Schema

| Option | Description | Selected |
|--------|-------------|----------|
| 完整 Markdown 内容 | 整篇文章存储为一个 TEXT 字段 | ✓ |
| 分块存储 | 按 section 拆分成多条记录 | |

**User's choice:** 完整 Markdown 内容
**Notes:** 研究简报 content 字段存 JSON

---

## 7. UI 组件

| Option | Description | Selected |
|--------|-------------|----------|
| 完整组件集 | Button, Input, Card, Dialog 等全部配置 | ✓ |
| 基础组件集 | 只包含核心组件，后续按需添加 | |

**User's choice:** 完整组件集
**Notes:** Phase 1 全部配置好

---

## 8. 主题方案

| Option | Description | Selected |
|--------|-------------|----------|
| 深色优先 | 默认深色，符合开发者习惯 | |
| 浅色优先 | 默认浅色，更通用 | ✓ |
| 跟随系统 | 自动跟随操作系统设置 | |

**User's choice:** 浅色优先
**Notes:** 支持切换深色模式

---

## Claude's Discretion

无 — 所有决策均由用户确认

## Deferred Ideas

- 自动化工作流 — 属于 Phase 3+
- 批量处理功能 — 属于 Phase 3+
- 团队协作功能 — 未来
- 云端同步 — 未来
