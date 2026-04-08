---
phase: 03-SEO分析与集成
plan: 03
type: execute
wave: 3
depends_on: [02]
files_modified:
  - src/pages/Articles.tsx
  - src/stores/useArticlesStore.ts
autonomous: false
requirements:
  - REQ-D-001
---

<objective>
创建文章列表页面，实现数据库备份和文章管理功能。
</objective>

<context>
Phase 3 Plan 03 - 数据管理
需要创建：
1. 文章列表页面（显示所有文章）
2. 文章管理功能（编辑、删除）
3. 数据库备份功能
4. 数据统计仪表板
</context>

<tasks>

<task type="manual">
  <name>Task 1: 创建文章列表 Store</name>
  <files>src/stores/useArticlesStore.ts</files>
  <action>
    创建 src/stores/useArticlesStore.ts (Zustand)，管理：
    - articles: Article[]
    - isLoading: boolean
    - selectedArticle: Article | null
    - filter: { status?: 'draft' | 'published', search?: string }

    添加方法：
    - loadArticles()
    - deleteArticle(id)
    - setFilter(filter)
  </action>
  <verify>
    Store 状态管理正确
  </verify>
  <checkpoint>before:start</checkpoint>
  <done>文章列表 Store 创建完成</done>
</task>

<task type="manual">
  <name>Task 2: 创建文章列表页面</name>
  <files>src/pages/Articles.tsx</files>
  <action>
    创建 src/pages/Articles.tsx，包含：
    - 文章统计卡片（总数、草稿、已发布）
    - 搜索和筛选功能
    - 文章表格（标题、创建日期、状态、操作）
    - 分页控制
    - 删除确认对话框
  </action>
  <verify>
    文章列表正确显示所有文章
  </verify>
  <checkpoint>after:Task 1</checkpoint>
  <done>文章列表页面创建完成</done>
</task>

<task type="manual">
  <name>Task 3: 实现数据库备份</name>
  <files>src/lib/backup.ts</files>
  <action>
    创建 src/lib/backup.ts，实现：
    - exportDatabase() - 导出数据库为 SQL 文件
    - importDatabase(file) - 导入数据库
    - getStats() - 获取统计数据（文章数、发布时间等）
  </action>
  <verify>
    数据库可以导出和导入
  </verify>
  <checkpoint>after:Task 2</checkpoint>
  <done>数据库备份功能实现完成</done>
</task>

</tasks>

<verification>
- [ ] 文章列表正确显示所有文章
- [ ] 可以搜索和筛选文章
- [ ] 可以删除文章
- [ ] 数据库可以导出备份
</verification>

<success_criteria>
用户可以浏览所有文章，搜索筛选，删除文章，并导出数据库备份。
</success_criteria>

<output>
After completion, update STATE.md and create 03-03-SUMMARY.md, then mark Phase 3 complete
</output>
