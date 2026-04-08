# SEO Machine — Tauri 桌面客户端

## 这是什么

SEO Machine 是一个基于 Claude Code 的 SEO 内容创作工作空间，通过自定义命令（`/research`、`/write`、`/analyze` 等）和专业代理，帮助用户研究、撰写、分析和优化 SEO 友好的长篇博客内容。

**核心价值主张：** 让任何企业都能轻松创建排名靠前的 SEO 优化内容，无需专业 SEO 知识。

## 为什么要做成 Tauri 桌面应用

### 原始项目的问题
1. **依赖 Claude Code**：用户必须安装并熟悉 Claude Code CLI
2. **命令行界面**：对非技术用户不友好
3. **手动配置**：需要手动填写多个 context 文件（brand-voice.md, seo-guidelines.md 等）
4. **分散的工作流**：研究、起草、优化分别在不同的目录中

### Tauri 客户端的优势
- **开箱即用**：用户下载安装即可，无需配置
- **图形界面**：友好的 UI，操作直观
- **本地化数据存储**：所有上下文配置本地管理
- **跨平台**：Windows/Mac/Linux 均可运行
- **调用 Claude API**：集成 AI 能力，用户只需提供自己的 API Key

## 核心功能（保持不变）

| 功能 | 描述 |
|------|------|
| `/research` | 关键词研究 + 竞争对手分析 |
| `/write` | 生成 2000-3000+ 字 SEO 优化文章 |
| `/analyze-existing` | 分析现有文章并给出更新建议 |
| `/rewrite` | 基于分析重写/更新内容 |
| `/optimize` | 全面 SEO 审核和优化 |

## 数据集成（保留）

- Google Analytics 4
- Google Search Console
- DataForSEO API（实时排名数据）
- NLTK/TextStat（可读性分析）

## 技术栈建议

| 层级 | 技术选型 |
|------|----------|
| 前端 | React + TypeScript + TailwindCSS |
| 桌面框架 | Tauri 2.x（Rust 后端） |
| AI 集成 | 直接调用 Claude API |
| 本地存储 | SQLite（配置、文章、项目数据） |
| Python 桥接 | Tauri 命令调用 Python 脚本（可选） |

## 目标用户

1. **中小企业主**：需要持续产出 SEO 内容但无专业团队
2. **内容营销人员**：希望提高内容产出效率和质量
3. **独立博主**：想要提升文章搜索排名

## 关键决策

| 决策 | 理由 | 状态 |
|------|------|------|
| 使用 Tauri 而非 Electron | 更小包体、更高性能、更安全 | 待定 |
| React 前端 | 生态丰富、组件多 | 待定 |
| 用户自备 API Key | 避免_token成本和账户管理复杂性 | 待定 |
| 本地存储配置 | 用户数据隐私，离线可用性 | 待定 |

## 项目范围

### 包含
- 研究代理（Research Agent）
- 写作代理（Write Agent）
- 分析代理（Analyze Agent）
- 优化代理（Optimize Agent）
- 用户配置界面（品牌声音、SEO 规则）
- 文章管理和发布

### 排除
- WordPress/ CMS 直接发布（Phase 2）
- 多用户协作（Phase 2+）
- 云端同步（长期规划）

---

*最后更新：2026-04-08 项目初始化*
