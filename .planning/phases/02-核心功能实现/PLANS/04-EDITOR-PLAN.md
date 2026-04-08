---
phase: 02-核心功能实现
plan: 04
type: execute
wave: 4
depends_on: [03]
files_modified:
  - src/pages/Editor.tsx
  - src/pages/Articles.tsx
  - src/stores/useEditorStore.ts
  - src/components/editor/
autonomous: false
requirements:
  - REQ-E-001
  - REQ-E-002
  - REQ-E-003
---

<objective>
创建文章编辑器和文章列表，实现 Markdown 编辑、实时预览、撤销/重做、保存和导出功能。
</objective>

<context>
Phase 2 Plan 04 - 文章编辑器
需要创建编辑器和文章列表：
1. 文章列表页面（显示所有文章）
2. Markdown 编辑器组件
3. 实时预览面板
4. 撤销/重做功能
5. 保存和导出功能
</context>

<tasks>

<task type="manual">
  <name>Task 1: 创建文章列表页面</name>
  <files>src/pages/Articles.tsx</files>
  <action>
    创建 src/pages/Articles.tsx，包含：
    - 文章列表（卡片或表格形式）
    - 每篇文章显示：标题、创建日期、状态（草稿/已发布）
    - 点击打开编辑器
    - 搜索/筛选功能
    - 删除功能（带确认）
  </action>
  <verify>
    列表正确显示所有文章
  </verify>
  <checkpoint>before:start</checkpoint>
  <done>文章列表页面创建完成</done>
</task>

<task type="manual">
  <name>Task 2: 创建编辑器 Store</name>
  <files>src/stores/useEditorStore.ts</files>
  <action>
    创建 src/stores/useEditorStore.ts (Zustand)，管理：
    - currentArticle: Article | null
    - content: string
    - isDirty: boolean
    - history: string[] (用于撤销/重做)
    - historyIndex: number

    添加方法：
    - loadArticle(id)
    - updateContent(content)
    - saveArticle()
    - undo()
    - redo()
  </action>
  <verify>
    Store 状态和撤销/重做正确工作
  </verify>
  <checkpoint>after:Task 1</checkpoint>
  <done>编辑器 Store 创建完成</done>
</task>

<task type="manual">
  <name>Task 3: 集成 Markdown 编辑器</name>
  <files>src/components/editor/MarkdownEditor.tsx</files>
  <action>
    创建 src/components/editor/MarkdownEditor.tsx，
    集成 @uiw/react-md-editor 或类似组件：
    - Markdown 编辑区域
    - 实时预览面板（左右或上下布局）
    - 工具栏（粗体、斜体、标题等快捷按钮）
    - 编辑区域和预览区域同步滚动
  </action>
  <verify>
    编辑器正常工作，预览同步
  </verify>
  <checkpoint>after:Task 2</checkpoint>
  <done>Markdown 编辑器集成完成</done>
</task>

<task type="manual">
  <name>Task 4: 实现导出功能</name>
  <files>src/components/editor/ExportDialog.tsx</files>
  <action>
    添加导出功能：
    1. 导出为 Markdown 文件（.md）
    2. 导出为 HTML 文件
    3. 复制到剪贴板
    4. 发布到 WordPress（如已配置）
  </action>
  <verify>
    各种导出格式正确
  </verify>
  <checkpoint>after:Task 3</checkpoint>
  <done>导出功能实现完成</done>
</task>

</tasks>

<verification>
- [ ] 文章列表正确显示所有文章
- [ ] Markdown 编辑器工作正常
- [ ] 实时预览同步
- [ ] 撤销/重做功能正常
- [ ] 保存功能正常
- [ ] 导出功能正常
</verification>

<success_criteria>
用户可以浏览文章列表，选择文章编辑，使用 Markdown 编辑器编辑内容，实时预览，撤销/重做，保存修改，导出为不同格式。
</success_criteria>

<output>
After completion, update STATE.md and create 02-04-SUMMARY.md, then mark Phase 2 complete
</output>
