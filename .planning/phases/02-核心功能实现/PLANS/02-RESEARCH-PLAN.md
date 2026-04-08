---
phase: 02-核心功能实现
plan: 02
type: execute
wave: 2
depends_on: [01]
files_modified:
  - src/pages/Research.tsx
  - src/stores/useResearchStore.ts
  - src-tauri/src/commands/python.rs
autonomous: false
requirements:
  - REQ-R-001
  - REQ-R-002
  - REQ-R-003
---

<objective>
创建主题研究页面，实现研究类型选择、Python 脚本调用、结果解析展示和数据库存储。
</objective>

<context>
Phase 2 Plan 02 - 主题研究功能
需要创建研究页面和相关功能：
1. 研究类型选择器（快速/全面/竞品）
2. 主题关键词输入
3. 调用 Python 研究脚本
4. 解析和展示研究结果
5. 研究简报保存和导出
</context>

<tasks>

<task type="manual">
  <name>Task 1: 创建研究页面框架</name>
  <files>src/pages/Research.tsx</files>
  <action>
    创建 src/pages/Research.tsx，包含：
    - 页面布局（标题、描述）
    - 研究类型选择器（Tabs: 快速研究/全面研究/竞品分析）
    - 关键词输入区域
    - 开始研究按钮
    - 研究进度显示
    - 研究结果展示区
  </action>
  <verify>
    页面正确渲染，Tab 切换正常
  </verify>
  <checkpoint>before:start</checkpoint>
  <done>研究页面框架创建完成</done>
</task>

<task type="manual">
  <name>Task 2: 创建研究 Store</name>
  <files>src/stores/useResearchStore.ts</files>
  <action>
    创建 src/stores/useResearchStore.ts (Zustand)，管理：
    - currentResearchType: 'quick' | 'comprehensive' | 'competitor'
    - keywords: string[]
    - researchResults: ResearchResult | null
    - isResearching: boolean
    - progress: number
    - error: string | null

    添加方法：
    - startResearch(keywords, type)
    - cancelResearch()
    - clearResults()
  </action>
  <verify>
    Store 状态管理正确
  </verify>
  <checkpoint>after:Task 1</checkpoint>
  <done>研究 Store 创建完成</done>
</task>

<task type="manual">
  <name>Task 3: 集成 Python 脚本调用</name>
  <files>src-tauri/src/commands/python.rs, src/lib/python.ts</files>
  <action>
    1. 扩展 Rust python.rs 命令，支持：
       - 研究类型参数映射到不同 Python 脚本
       - 进度事件发送 (emit progress events)
       - 超时处理

    2. 创建 src/lib/python.ts 前端封装：
       - runResearch(type, keywords): Promise<ResearchResult>
       - 监听进度事件更新 UI
  </action>
  <verify>
    Python 脚本可以被调用并返回 JSON 结果
  </verify>
  <checkpoint>after:Task 2</checkpoint>
  <done>Python 脚本调用集成完成</done>
</task>

<task type="manual">
  <name>Task 4: 实现结果展示和保存</name>
  <files>src/pages/Research.tsx</files>
  <action>
    在研究页面添加：
    1. 研究结果卡片展示（关键词分析、内容建议、SEO 评分等）
    2. 研究简报预览
    3. 保存到数据库功能
    4. 导出为 JSON/Markdown 功能
  </action>
  <verify>
    结果正确展示，可以保存和导出
  </verify>
  <checkpoint>after:Task 3</checkpoint>
  <done>结果展示和保存实现完成</done>
</task>

</tasks>

<verification>
- [ ] 三种研究类型都可以选择和执行
- [ ] 研究进度实时显示
- [ ] 研究结果正确解析和展示
- [ ] 研究简报可以保存和导出
</verification>

<success_criteria>
用户可以输入关键词，选择研究类型，执行研究，查看结果，并保存简报。
</success_criteria>

<output>
After completion, update STATE.md and create 02-02-SUMMARY.md
</output>
