---
phase: 02-核心功能实现
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/pages/Settings.tsx
  - src-tauri/src/commands/keys.rs
  - src-tauri/src/lib.rs
  - src/stores/useSettingsStore.ts
autonomous: false
requirements:
  - REQ-S-001
  - REQ-S-002
  - REQ-S-003
---

<objective>
扩展设置页面，实现 API 密钥（Claude API、DataForSEO）和 WordPress 配置的加密存储与管理。
</objective>

<context>
Phase 2 Plan 01 - API 密钥管理
需要扩展现有的设置页面，添加：
1. Claude API Key 输入和验证
2. DataForSEO API Key 输入和验证
3. WordPress 站点 URL 和认证信息
4. 密钥加密存储（Rust 端）
</context>

<tasks>

<task type="manual">
  <name>Task 1: 创建 Rust 密钥管理命令</name>
  <files>src-tauri/src/commands/keys.rs</files>
  <action>
    在 src-tauri/src/commands/ 创建 keys.rs，实现：
    - store_api_key(key_type, key_value) - 加密存储
    - get_api_key(key_type) - 获取密钥（不暴露值，只验证存在）
    - validate_api_key(key_type) - 验证密钥有效性
    - delete_api_key(key_type) - 删除密钥

    使用 tauri-plugin-store 的加密存储功能。
  </action>
  <verify>
    测试：调用 store_api_key 存储，调用 get_api_key 验证返回正确
  </verify>
  <checkpoint>before:start</checkpoint>
  <done>Rust 密钥管理命令创建完成</done>
</task>

<task type="manual">
  <name>Task 2: 扩展设置页面 UI</name>
  <files>src/pages/Settings.tsx</files>
  <action>
    扩展 Settings.tsx 页面，添加：
    1. API 密钥配置区域（折叠面板）
       - Claude API Key（密码输入框 + 测试按钮）
       - DataForSEO API Key（密码输入框 + 测试按钮）
    2. WordPress 配置区域
       - 站点 URL 输入
       - 用户名/邮箱
       - 应用密码
       - 连接测试按钮
  </action>
  <verify>
    UI 正确渲染，所有输入框可交互
  </verify>
  <checkpoint>after:Task 1</checkpoint>
  <done>设置页面 UI 扩展完成</done>
</task>

<task type="manual">
  <name>Task 3: 实现前端密钥调用</name>
  <files>src/stores/useSettingsStore.ts</files>
  <action>
    在 useSettingsStore 中添加：
    - saveApiKey(keyType, key) - 调用 Rust 命令存储
    - validateApiKey(keyType) - 调用 Rust 命令验证
    - removeApiKey(keyType) - 调用 Rust 命令删除

    添加前端状态管理，缓存密钥验证状态（不是密钥值）。
  </action>
  <verify>
    验证状态正确反映后端结果
  </verify>
  <checkpoint>after:Task 2</checkpoint>
  <done>前端密钥调用实现完成</done>
</task>

</tasks>

<verification>
- [ ] Claude API Key 可以存储和验证
- [ ] DataForSEO API Key 可以存储和验证
- [ ] WordPress 配置可以存储和测试连接
- [ ] 密钥不会在 UI 中明文显示完整值
</verification>

<success_criteria>
API 密钥和 WordPress 配置可以在设置页面输入、存储、验证和删除。
</success_criteria>

<output>
After completion, update STATE.md and create 02-01-SUMMARY.md
</output>
