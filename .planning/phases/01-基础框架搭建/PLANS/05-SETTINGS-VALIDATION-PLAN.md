---
phase: 01-基础框架搭建
plan: 05
type: execute
wave: 3
depends_on: [03, 04]
files_modified:
  - src/stores/useSettingsStore.ts
  - src/components/features/settings/SettingsPanel.tsx
  - src/pages/SettingsPage.tsx
  - src/App.tsx
autonomous: true
requirements:
  - REQ-R-001
  - REQ-R-003
  - REQ-R-005
---

<objective>
创建设置页面框架和验证应用可以成功启动、导航切换、主题切换、数据库连接正常。
</objective>

<context>
@/tmp/seomachine/.planning/phases/01-基础框架搭建/01-CONTEXT.md
@/tmp/seomachine/.planning/phases/01-基础框架搭建/01-UI-SPEC.md

## Settings Requirements (from UI-SPEC)
- API Keys tab: Claude API Key, DataForSEO Key
- WordPress tab: URL, Username, App Password
- Appearance tab: Theme toggle
- Save with debounce or manual button
- Test Connection button

## Navigation Items
- 研究 (Research)
- 撰写 (Write)
- 编辑器 (Editor)
- 分析 (Analysis)
- 发布 (Publish)
- 设置 (Settings)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Settings store</name>
  <files>src/stores/useSettingsStore.ts</files>
  <action>
    创建 Zustand store 管理设置：

    ```typescript
    import { create } from "zustand";
    import { Store } from "@tauri-apps/plugin-store";

    interface SettingsState {
      claudeApiKey: string | null;
      dataforseoApiKey: string | null;
      wordpressUrl: string | null;
      wordpressUsername: string | null;
      wordpressAppPassword: string | null;
      isLoading: boolean;
      setApiKey: (provider: "claude" | "dataforseo", key: string) => Promise<void>;
      setWordPress: (url: string, username: string, password: string) => Promise<void>;
      loadSettings: () => Promise<void>;
    }

    let store: Store | null = null;

    async function getStore() {
      if (!store) {
        store = new Store("settings.json");
      }
      return store;
    }

    export const useSettingsStore = create<SettingsState>()((set, get) => ({
      claudeApiKey: null,
      dataforseoApiKey: null,
      wordpressUrl: null,
      wordpressUsername: null,
      wordpressAppPassword: null,
      isLoading: true,

      setApiKey: async (provider, key) => {
        const s = await getStore();
        const keyName = provider === "claude" ? "claudeApiKey" : "dataforseoApiKey";
        await s.set(keyName, key);
        await s.save();
        if (provider === "claude") {
          set({ claudeApiKey: key });
        } else {
          set({ dataforseoApiKey: key });
        }
      },

      setWordPress: async (url, username, password) => {
        const s = await getStore();
        await s.set("wordpressUrl", url);
        await s.set("wordpressUsername", username);
        await s.set("wordpressAppPassword", password);
        await s.save();
        set({ wordpressUrl: url, wordpressUsername: username, wordpressAppPassword: password });
      },

      loadSettings: async () => {
        set({ isLoading: true });
        const s = await getStore();
        const claudeApiKey = await s.get<string>("claudeApiKey");
        const dataforseoApiKey = await s.get<string>("dataforseoApiKey");
        const wordpressUrl = await s.get<string>("wordpressUrl");
        const wordpressUsername = await s.get<string>("wordpressUsername");
        const wordpressAppPassword = await s.get<string>("wordpressAppPassword");
        set({
          claudeApiKey,
          dataforseoApiKey,
          wordpressUrl,
          wordpressUsername,
          wordpressAppPassword,
          isLoading: false
        });
      },
    }));
    ```
  </action>
  <verify>
    <automated>test -f src/stores/useSettingsStore.ts && grep -l "tauri-apps/plugin-store" src/stores/useSettingsStore.ts</automated>
  </verify>
  <done>Settings store 创建完成</done>
</task>

<task type="auto">
  <name>Task 2: Create Settings Panel component</name>
  <files>src/components/features/settings/SettingsPanel.tsx</files>
  <action>
    创建设置面板组件（使用 shadcn/ui Sheet）：

    - 使用 Tabs 分为 API Keys | WordPress | Appearance
    - API Keys tab:
      - Input for Claude API Key (type="password")
      - Input for DataForSEO API Key (type="password")
      - Save button
    - WordPress tab:
      - Input for WordPress URL
      - Input for Username
      - Input for App Password (type="password")
      - Test Connection button
    - Appearance tab:
      - Theme toggle (Switch)
      - 显示当前主题

    使用 Sheet 组件作为侧边抽屉，Header 中的设置按钮触发打开。
  </action>
  <verify>
    <automated>test -f src/components/features/settings/SettingsPanel.tsx && grep -l "Sheet\|Tabs" src/components/features/settings/SettingsPanel.tsx</automated>
  </verify>
  <done>Settings Panel 组件创建完成</done>
</task>

<task type="auto">
  <name>Task 3: Update App.tsx with navigation and settings</name>
  <files>src/App.tsx</files>
  <action>
    更新 App.tsx：
    - 导入 SettingsPanel
    - 添加状态管理侧边栏导航激活项
    - 导航项点击切换内容区域
    - Settings Sheet 触发

    导航内容区域暂时显示 "Coming Soon" 占位文本。
  </action>
  <verify>
    <automated>grep -l "SettingsPanel" src/App.tsx</automated>
  </verify>
  <done>App.tsx 更新完成</done>
</task>

<task type="checkpoint:human-verify">
  <name>Task 4: Verify application</name>
  <what-built>完整的 Phase 1 应用骨架</what-built>
  <how-to-verify>
    1. 运行 `cd /tmp/seomachine && pnpm tauri dev`
    2. 验证应用启动成功（< 3秒）
    3. 验证侧边栏导航显示所有菜单项
    4. 验证点击导航项内容区域切换
    5. 验证主题切换按钮可以切换 light/dark
    6. 验证点击设置按钮打开设置面板
    7. 验证 Footer 显示版本号
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
- [ ] `pnpm tauri dev` 启动成功
- [ ] 侧边栏导航显示 6 个菜单项
- [ ] 点击菜单项内容区域变化
- [ ] 主题切换生效
- [ ] 设置面板可以打开
</verification>

<success_criteria>
应用骨架验证完成，所有核心功能正常工作。
</success_criteria>

<output>
After completion, create `.planning/phases/01-基础框架搭建/{phase}-05-SUMMARY.md`
</output>
