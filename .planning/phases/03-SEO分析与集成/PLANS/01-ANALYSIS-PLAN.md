---
phase: 03-SEO分析与集成
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/pages/Analysis.tsx
  - src/stores/useAnalysisStore.ts
autonomous: false
requirements:
  - REQ-A-001
  - REQ-A-002
---

<objective>
创建 SEO 分析页面，集成 Python 分析模块，实现分析结果可视化和优化建议。
</objective>

<context>
Phase 3 Plan 01 - SEO 分析面板
需要创建分析页面：
1. 分析页面 UI
2. 集成关键词分析、可读性评分、SEO 质量评分
3. 分析结果可视化（评分仪表盘、热力图）
4. 优化建议列表
</context>

<tasks>

<task type="manual">
  <name>Task 1: 创建分析页面框架</name>
  <files>src/pages/Analysis.tsx</files>
  <action>
    创建 src/pages/Analysis.tsx，包含：
    - 文章选择器（从文章列表选择）
    - 分析类型选择（关键词分析/可读性/SEO质量/综合）
    - 开始分析按钮
    - 分析进度显示
    - 分析结果展示区
  </action>
  <verify>
    页面正确渲染，分析类型可切换
  </verify>
  <checkpoint>before:start</checkpoint>
  <done>分析页面框架创建完成</done>
</task>

<task type="manual">
  <name>Task 2: 创建分析 Store</name>
  <files>src/stores/useAnalysisStore.ts</files>
  <action>
    创建 src/stores/useAnalysisStore.ts (Zustand)，管理：
    - selectedArticleId: string
    - analysisType: 'keyword' | 'readability' | 'seo' | 'comprehensive'
    - results: AnalysisResults | null
    - isAnalyzing: boolean
    - progress: number

    添加方法：
    - setArticle(id)
    - setAnalysisType(type)
    - runAnalysis()
    - clearResults()
  </action>
  <verify>
    Store 状态管理正确
  </verify>
  <checkpoint>after:Task 1</checkpoint>
  <done>分析 Store 创建完成</done>
</task>

<task type="manual">
  <name>Task 3: 集成 Python 分析模块</name>
  <files>src/lib/seo_analyzer.ts</files>
  <action>
    创建 src/lib/seo_analyzer.ts，调用 Python 脚本：
    - analyze_keyword(content, keywords) - 关键词分析
    - analyze_readability(content) - 可读性评分
    - analyze_seo_quality(content) - SEO 质量评分
    - analyze_comprehensive(content) - 综合分析

    使用 Rust 命令调用 Python 脚本，解析 JSON 结果。
  </action>
  <verify>
    Python 脚本可调用并返回分析结果
  </verify>
  <checkpoint>after:Task 2</checkpoint>
  <done>Python 分析模块集成完成</done>
</task>

<task type="manual">
  <name>Task 4: 实现结果可视化</name>
  <files>src/pages/Analysis.tsx</files>
  <action>
    在分析页面添加：
    1. SEO 评分仪表盘（环形进度）
    2. 可读性评分显示
    3. 关键词密度热力图
    4. 优化建议列表（可点击采纳）
  </action>
  <verify>
    结果正确展示，可视化直观
  </verify>
  <checkpoint>after:Task 3</checkpoint>
  <done>结果可视化实现完成</done>
</task>

</tasks>

<verification>
- [ ] 可以选择文章进行多种类型分析
- [ ] 分析进度实时显示
- [ ] SEO 评分仪表盘正确显示
- [ ] 优化建议可查看
</verification>

<success_criteria>
用户可以选择文章，执行不同类型的 SEO 分析，查看可视化的分析结果和优化建议。
</success_criteria>

<output>
After completion, update STATE.md and create 03-01-SUMMARY.md
</output>
