# SEO Machine Tauri 客户端 — 需求文档

## 项目概述

将 SEO Machine（基于 Claude Code 的 SEO 内容创作 CLI 工具）转换为 Tauri 桌面客户端，让非技术用户无需安装 Claude Code 即可使用 AI 驱动的 SEO 内容创作功能。

---

## v1 需求

### 配置管理 (CONFIG)

- [ ] **CONFIG-01**: 用户可以在 UI 中配置 Anthropic API Key
- [ ] **CONFIG-02**: 用户可以在 UI 中配置品牌声音（从 context/brand-voice.md 模板）
- [ ] **CONFIG-03**: 用户可以在 UI 中配置 SEO 规则（从 context/seo-guidelines.md 模板）
- [ ] **CONFIG-04**: 用户可以在 UI 中配置目标关键词（从 context/target-keywords.md 模板）
- [ ] **CONFIG-05**: 配置数据安全存储在本地（不泄露到网络）
- [ ] **CONFIG-06**: 用户可以导入/导出配置备份

### 研究功能 (RESEARCH)

- [ ] **RESEARCH-01**: 用户输入主题，触发完整研究工作流
- [ ] **RESEARCH-02**: 研究结果包含：关键词、竞争对手分析、内容差距、推荐大纲
- [ ] **RESEARCH-03**: 研究结果在 UI 面板中清晰展示（可折叠章节）
- [ ] **RESEARCH-04**: 用户可以将研究结果保存为 Markdown 文件
- [ ] **RESEARCH-05**: 研究过程显示进度指示（避免长时间无反馈）

### 写作功能 (WRITE)

- [ ] **WRITE-01**: 用户可以基于研究主题触发文章写作
- [ ] **WRITE-02**: 生成 2000-3000+ 字 SEO 优化文章（Markdown 格式）
- [ ] **WRITE-03**: 文章包含：H1/H2/H3 结构、关键词自然嵌入、内外部链接
- [ ] **WRITE-04**: 提供 Meta 元素（标题、描述、关键词）
- [ ] **WRITE-05**: 写作过程支持流式输出（逐步显示内容）
- [ ] **WRITE-06**: 用户可以取消正在进行的写作任务

### 文章管理 (CONTENT)

- [ ] **CONTENT-01**: 文章列表视图（草稿/已发布/已归档）
- [ ] **CONTENT-02**: Markdown 文章编辑器（支持实时预览）
- [ ] **CONTENT-03**: 文章搜索和筛选功能
- [ ] **CONTENT-04**: 用户可以手动编辑 AI 生成的文章
- [ ] **CONTENT-05**: 文章版本历史（自动保存）

### 分析功能 (ANALYZE)

- [ ] **ANALYZE-01**: 用户可以输入 URL 或上传文章进行分析
- [ ] **ANALYZE-02**: 分析结果包含：SEO 评分、内容健康度、更新建议
- [ ] **ANALYZE-03**: 用户可以将分析结果关联到对应文章

### 优化功能 (OPTIMIZE)

- [ ] **OPTIMIZE-01**: 用户可以对现有文章触发 SEO 优化审核
- [ ] **OPTIMIZE-02**: 优化建议以清单形式展示（可逐一处理）
- [ ] **OPTIMIZE-03**: 可视化 SEO 质量评分（0-100）

### 数据集成 (INTEGRATIONS)

- [ ] **INTEGRATIONS-01**: 支持连接 Google Analytics 4（可选配置）
- [ ] **INTEGRATIONS-02**: 支持连接 Google Search Console（可选配置）
- [ ] **INTEGRATIONS-03**: 支持连接 DataForSEO API（可选配置，用于排名追踪）

### 导出功能 (EXPORT)

- [ ] **EXPORT-01**: 文章导出为纯 Markdown 文件
- [ ] **EXPORT-02**: 文章导出为 HTML 文件
- [ ] **EXPORT-03**: 支持一键复制文章内容到剪贴板

---

## v2 需求（后续阶段）

- WordPress/CMS 直接发布
- 多语言 SEO 支持
- 团队协作功能
- 云端同步
- 高级可视化分析面板

---

## 明确排除范围

| 排除项 | 原因 |
|--------|------|
| 多人实时协作编辑 | Phase 2+，增加复杂度 |
| WordPress 插件 | Phase 2 |
| 云端存储/同步 | 隐私优先，本地优先 |
| 内置 Python 运行时 | 避免包体膨胀，假设用户无 Python |
| 移动端（iOS/Android） | Phase 2+ |

---

## 可追溯性

| REQ-ID | 来源 | 阶段 | 状态 |
|--------|------|------|------|
| CONFIG-01 ~ 06 | 用户需求 | Phase 1 | 活跃 |
| RESEARCH-01 ~ 05 | 保留原有功能 | Phase 1 | 活跃 |
| WRITE-01 ~ 06 | 保留原有功能 | Phase 2 | 活跃 |
| CONTENT-01 ~ 05 | 桌面应用新需求 | Phase 2 | 活跃 |
| ANALYZE-01 ~ 03 | 保留原有功能 | Phase 3 | 活跃 |
| OPTIMIZE-01 ~ 03 | 保留原有功能 | Phase 3 | 活跃 |
| INTEGRATIONS-01 ~ 03 | 保留原有集成 | Phase 3 | 活跃 |
| EXPORT-01 ~ 03 | 桌面应用新需求 | Phase 2 | 活跃 |

---

*最后更新：2026-04-08 需求定义完成*
