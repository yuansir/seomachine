---
phase: 02-核心功能实现
plan: 03
type: execute
wave: 3
depends_on: [02]
files_modified:
  - src/pages/Write.tsx
  - src/stores/useWriteStore.ts
  - src/lib/claude.ts
autonomous: false
requirements:
  - REQ-W-001
  - REQ-W-002
  - REQ-W-003
---

<objective>
创建文章撰写页面，实现基于研究简报的文章生成、进度显示和中断功能。
</objective>

<context>
Phase 2 Plan 03 - 文章撰写功能
需要创建撰写页面和相关功能：
1. 研究简报选择（从已有研究中选择）
2. 文章参数配置（标题、长度、风格）
3. 调用 Claude API 生成文章
4. 实时进度显示
5. 文章保存功能
</context>

<tasks>

<task type="manual">
  <name>Task 1: 创建撰写页面框架</name>
  <files>src/pages/Write.tsx</files>
  <action>
    创建 src/pages/Write.tsx，包含：
    - 研究简报选择器（下拉列表，显示已保存的研究）
    - 文章配置区域
      - 自定义标题（可选）
      - 文章长度选择（短/中/长）
      - 内容风格（专业/通俗/技术）
    - 生成按钮
    - 进度显示区域
    - 生成文章预览区
  </action>
  <verify>
    页面正确渲染，配置选项可选择
  </verify>
  <checkpoint>before:start</checkpoint>
  <done>撰写页面框架创建完成</done>
</task>

<task type="manual">
  <name>Task 2: 创建撰写 Store</name>
  <files>src/stores/useWriteStore.ts</files>
  <action>
    创建 src/stores/useWriteStore.ts (Zustand)，管理：
    - selectedBrief: ResearchBrief | null
    - articleConfig: ArticleConfig
    - generatedContent: string
    - isGenerating: boolean
    - progress: number
    - generationId: string | null

    添加方法：
    - selectBrief(brief)
    - updateConfig(config)
    - startGeneration()
    - cancelGeneration()
    - saveArticle()
  </action>
  <verify>
    Store 状态管理正确
  </verify>
  <checkpoint>after:Task 1</checkpoint>
  <done>撰写 Store 创建完成</done>
</task>

<task type="manual">
  <name>Task 3: 集成 Claude API 调用</name>
  <files>src/lib/claude.ts</files>
  <action>
    创建 src/lib/claude.ts，实现：
    - generateArticle(brief, config, onProgress): Promise<string>
    - cancelGeneration(generationId)

    使用 Claude SDK 或直接 fetch 调用 Claude API。
    实现流式响应处理以显示进度。

    注意：API 密钥通过后端中转，不在前端存储。
  </action>
  <verify>
    可以生成文章内容，进度正确更新
  </verify>
  <checkpoint>after:Task 2</checkpoint>
  <done>Claude API 调用集成完成</done>
</task>

<task type="manual">
  <name>Task 4: 实现文章保存和编辑跳转</name>
  <files>src/pages/Write.tsx</files>
  <action>
    在撰写页面添加：
    1. 保存文章到数据库
    2. 保存成功后显示"在编辑器中打开"按钮
    3. 跳转到编辑器功能
  </action>
  <verify>
    文章可以保存并跳转到编辑器
  </verify>
  <checkpoint>after:Task 3</checkpoint>
  <done>文章保存和编辑跳转实现完成</done>
</task>

</tasks>

<verification>
- [ ] 可以选择研究简报
- [ ] 可以配置文章参数
- [ ] 文章生成进度实时显示
- [ ] 可以中断生成
- [ ] 生成的文章可以保存
</verification>

<success_criteria>
用户可以选择研究简报，配置文章参数，生成文章，查看预览，并保存到数据库。
</success_criteria>

<output>
After completion, update STATE.md and create 02-03-SUMMARY.md
</output>
