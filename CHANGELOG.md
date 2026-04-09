# Changelog

All notable changes to SEO Machine will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-04-09

### Added

- **研究模块**：通过 DataForSEO API 支持竞品分析、SERP 分析、话题聚类、快速获胜识别、关键词趋势、性能矩阵、基线分析等七种研究类型
- **AI 写作模块**：基于研究 Brief 由 LLM 生成 SEO 优化文章，支持字数、风格、语气等配置
- **内置编辑器**：Markdown 编辑器，支持撤销/重做历史、本地自动保存
- **文章管理**：SQLite 本地存储所有文章，支持列表查看、搜索、编辑、删除
- **SEO 分析**：纯客户端分析引擎，提供关键词密度、Flesch 可读性评分、SEO 质量评分和优化建议
- **WordPress 发布**：支持直接发布或保存草稿，发布后自动更新文章状态
- **LLM 提供商配置**：支持 DeepSeek 和任意 OpenAI 兼容接口（包括 Claude via OpenAI 兼容模式）
- **持久化设置**：API 密钥、WordPress 配置、LLM 参数通过 `tauri-plugin-store` 安全本地存储
- **主题支持**：深色/浅色模式切换
- **单侧边栏导航**：基于 Zustand 的客户端路由，带当前页面高亮

### Technical

- Tauri 2.x + React 19 + TypeScript 5 桌面应用
- TailwindCSS 4 + shadcn/ui 组件库
- Zustand 5 全局状态 + tauri-plugin-store 持久化
- `tauri-plugin-sql` v2 SQLite 数据库，含迁移自动运行
- Rust tokio 后端，Python 脚本通过 subprocess 调用（含 60s 超时保护）

[Unreleased]: https://github.com/yuansir/seomachine/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yuansir/seomachine/releases/tag/v0.1.0
