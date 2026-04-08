# SEO Machine Tauri 客户端 — 路线图

**项目：** SEO Machine 桌面客户端
**阶段数：** 4
**需求数：** 24 个 v1 需求
**最后更新：** 2026-04-08

---

## 总览

| # | 阶段 | 目标 | 需求 | 成功标准 |
|---|------|------|------|----------|
| 1 | 基础架构 | 项目脚手架 + 配置管理 | CONFIG-01~06 | 可配置 API Key 和品牌规则 |
| 2 | 核心工作流 | 文章管理 + 研究/写作 UI | RESEARCH-01~05, WRITE-01~06, CONTENT-01~05, EXPORT-01~03 | 完整的内容创建工作流 |
| 3 | AI 集成 | Claude API 集成 + 分析/优化 | ANALYZE-01~03, OPTIMIZE-01~03, INTEGRATIONS-01~03 | AI 功能端到端可用 |
| 4 | 完善 | 错误处理 + 性能 + Polish | 所有未完成项 | 生产可用质量 |

---

## 阶段详情

### Phase 1: 基础架构 (Foundation)

**目标：** 建立项目骨架和配置系统

**持续时间：** ~1 周
**难度：** 低

**需求映射：**
- CONFIG-01: API Key 配置 UI
- CONFIG-02: 品牌声音配置 UI
- CONFIG-03: SEO 规则配置 UI
- CONFIG-04: 目标关键词配置 UI
- CONFIG-05: 安全存储实现
- CONFIG-06: 导入/导出配置

**成功标准：**
1. 用户可以输入并保存 Anthropic API Key
2. 用户可以在 UI 中填写并保存所有配置项
3. 配置数据存储在本地 SQLite，不以明文存储
4. 用户可以导出配置为 JSON 文件
5. 用户可以导入配置备份文件

**技术任务：**
- [ ] 初始化 Tauri + React + TypeScript 项目
- [ ] 配置 TailwindCSS 和 shadcn/ui
- [ ] 设置 SQLite 数据库（tauri-plugin-sql）
- [ ] 实现配置数据模型（Config Schema）
- [ ] 创建配置管理 UI 组件
- [ ] 实现 API Key 安全存储（Rust 端）

---

### Phase 2: 核心工作流 (Core Workflow)

**目标：** 实现文章管理和研究/写作功能

**持续时间：** ~2-3 周
**难度：** 中

**需求映射：**
- RESEARCH-01~05: 研究功能 UI
- WRITE-01~06: 写作功能 UI
- CONTENT-01~05: 文章管理
- EXPORT-01~03: 导出功能

**成功标准：**
1. 用户可以在 UI 中触发研究命令，看到进度
2. 用户可以触发写作命令，看到流式输出
3. 文章列表显示所有草稿，支持搜索
4. 用户可以在编辑器中修改文章
5. 用户可以导出文章为 Markdown 或 HTML

**技术任务：**
- [ ] 实现 Research 命令（Tauri Command）
- [ ] 创建 ResearchPanel UI 组件
- [ ] 实现 Write 命令（Tauri Command）
- [ ] 创建流式输出支持
- [ ] 实现文章 CRUD 操作
- [ ] 创建 ProjectWorkspace 布局
- [ ] 集成 Markdown 编辑器（react-markdown）
- [ ] 实现文章导出功能
- [ ] 实现文章自动保存（每 30 秒）

---

### Phase 3: AI 集成 (AI Integration)

**目标：** 集成 Claude API 和数据分析功能

**持续时间：** ~2-3 周
**难度：** 高

**需求映射：**
- ANALYZE-01~03: URL/文章分析
- OPTIMIZE-01~03: SEO 优化审核
- INTEGRATIONS-01~03: 第三方 API 集成

**成功标准：**
1. 用户输入 URL 可以获取完整 SEO 分析
2. 用户可以触发文章优化，看到评分和建议清单
3. 用户可以选择性连接 GA4/GSC/DataForSEO
4. 所有 AI 调用通过 Rust 后端代理，保护 API Key

**技术任务：**
- [ ] 实现 Rust Claude API 客户端
- [ ] 实现 Analyze 命令（URL 获取 + 分析）
- [ ] 实现 Optimize 命令
- [ ] 创建 AnalyzePanel 和 OptimizePanel UI
- [ ] 实现 GA4/GSC 连接配置
- [ ] 实现 DataForSEO 集成（可选）
- [ ] 添加 SEO 评分可视化组件

---

### Phase 4: 完善 (Polish)

**目标：** 错误处理、性能优化、生产就绪

**持续时间：** ~1 周
**难度：** 中

**需求映射：**
- 错误处理和边界情况
- 性能优化
- UX 完善

**成功标准：**
1. 长时间运行任务可取消
2. 网络错误有清晰提示和重试选项
3. 应用启动时间 < 3 秒
4. 内存占用稳定，无泄漏
5. 所有 UI 有适当的加载和错误状态

**技术任务：**
- [ ] 实现任务取消机制
- [ ] 添加错误边界和用户友好的错误提示
- [ ] 实现重试逻辑（指数退避）
- [ ] 性能优化：虚拟滚动、懒加载
- [ ] 添加系统通知支持
- [ ] 实现崩溃恢复（自动保存恢复）
- [ ] 打包为可安装应用（.dmg/.exe/.AppImage）

---

## 依赖关系

```
Phase 1 (Foundation)
    │
    └──────────────────┐
                       ▼
Phase 2 (Core Workflow)
    │
    └──────────────────────────┐
                               ▼
Phase 3 (AI Integration)
    │
    └──────────────────────────────┐
                                   ▼
Phase 4 (Polish)
```

**关键路径：** Phase 1 → Phase 2 → Phase 3 → Phase 4

---

## 风险与缓解

| 风险 | 影响 | 缓解策略 |
|------|------|----------|
| Claude API 流式输出实现复杂度 | 高 | Phase 3 预留更多时间，提前验证 |
| Python 脚本在 Tauri 环境兼容 | 中 | Phase 2 评估，必要时简化脚本 |
| API Key 安全存储跨平台差异 | 中 | 使用 tauri-plugin-store，验证各平台 |

---

*最后更新：2026-04-08 路线图创建完成*
