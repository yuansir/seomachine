---
phase: 03-SEO分析与集成
plan: 02
type: execute
wave: 2
depends_on: [01]
files_modified:
  - src/pages/Publish.tsx
  - src-tauri/src/commands/wordpress.rs
autonomous: false
requirements:
  - REQ-P-001
  - REQ-P-002
---

<objective>
创建 WordPress 发布页面，实现文章发布功能、状态显示和已发布列表。
</objective>

<context>
Phase 3 Plan 02 - WordPress 发布
需要创建发布页面：
1. 发布页面 UI
2. WordPress REST API 连接
3. 文章发布功能
4. 发布状态显示
5. 已发布文章列表
</context>

<tasks>

<task type="manual">
  <name>Task 1: 创建发布页面框架</name>
  <files>src/pages/Publish.tsx</files>
  <action>
    创建 src/pages/Publish.tsx，包含：
    - WordPress 连接状态指示器
    - 文章选择器（选择要发布的文章）
    - 发布选项（分类、标签、SEO 元数据）
    - 发布预览
    - 发布按钮
    - 发布历史列表
  </action>
  <verify>
    页面正确渲染，连接状态显示
  </verify>
  <checkpoint>before:start</checkpoint>
  <done>发布页面框架创建完成</done>
</task>

<task type="manual">
  <name>Task 2: 创建 WordPress Rust 命令</name>
  <files>src-tauri/src/commands/wordpress.rs</files>
  <action>
    创建 src-tauri/src/commands/wordpress.rs，实现：
    - check_wordpress_connection() - 检查连接状态
    - publish_article(article) - 发布文章到 WordPress
    - get_published_posts() - 获取已发布文章列表
    - delete_post(post_id) - 删除已发布文章

    使用 reqwest 调用 WordPress REST API。
  </action>
  <verify>
    WordPress 命令正确注册和编译
  </verify>
  <checkpoint>after:Task 1</checkpoint>
  <done>WordPress Rust 命令创建完成</done>
</task>

<task type="manual">
  <name>Task 3: 实现发布功能</name>
  <files>src/pages/Publish.tsx</files>
  <action>
    在发布页面实现：
    1. 连接状态检查和显示
    2. 文章发布流程
    3. 发布进度显示
    4. 发布成功/失败提示
    5. 已发布文章列表（显示状态、发布日期、操作）
  </action>
  <verify>
    可以发布文章并查看发布历史
  </verify>
  <checkpoint>after:Task 2</checkpoint>
  <done>发布功能实现完成</done>
</task>

</tasks>

<verification>
- [ ] WordPress 连接状态正确显示
- [ ] 可以选择文章并预览
- [ ] 发布成功显示确认
- [ ] 发布历史正确显示
</verification>

<success_criteria>
用户可以查看 WordPress 连接状态，选择文章发布，查看发布结果和历史记录。
</success_criteria>

<output>
After completion, update STATE.md and create 03-02-SUMMARY.md
</output>
