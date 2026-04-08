---
phase: 01-基础框架搭建
plan: 03
type: execute
wave: 2
depends_on: [01]
files_modified:
  - src/stores/useThemeStore.ts
  - src/hooks/useTheme.ts
  - src/components/layout/AppShell.tsx
  - src/components/layout/Header.tsx
  - src/components/layout/Sidebar.tsx
  - src/components/layout/Footer.tsx
  - src/App.tsx
  - src/index.css
autonomous: true
requirements:
  - REQ-R-003
  - REQ-R-005
  - REQ-R-006
---

<objective>
创建应用布局组件（AppShell、Header、Sidebar、Footer）和深色/浅色主题切换系统。
</objective>

<context>
@/tmp/seomachine/.planning/phases/01-基础框架搭建/01-UI-SPEC.md

## Layout Specs (from UI-SPEC)
- Sidebar width: 200px (collapsed: 64px)
- Header height: 56px
- Footer height: 32px
- Sidebar collapse toggle at bottom

## Color Scheme (from UI-SPEC)
### Light Mode (Default)
- Dominant: #ffffff (page backgrounds)
- Secondary: #f1f5f9 (slate-100) (sidebar, cards)
- Accent: #3b82f6 (blue-500) (CTAs, links)

### Dark Mode
- Dominant: #0f172a (slate-900)
- Secondary: #1e293b (slate-800)
- Accent: #3b82f6 (blue-500)

## Typography (from UI-SPEC)
- Font: Inter
- Body: 16px / 400
- Label: 14px / 400
- Heading: 20px / 600
- Display: 28px / 600
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Zustand theme store</name>
  <files>src/stores/useThemeStore.ts</files>
  <action>
    创建 Zustand store 管理主题状态：

    ```typescript
    import { create } from "zustand";
    import { persist } from "zustand/middleware";

    type Theme = "light" | "dark" | "system";

    interface ThemeState {
      theme: Theme;
      setTheme: (theme: Theme) => void;
    }

    export const useThemeStore = create<ThemeState>()(
      persist(
        (set) => ({
          theme: "light",
          setTheme: (theme) => set({ theme }),
        }),
        {
          name: "theme-storage",
          onRehydrateStorage: () => (state) => {
            // Apply theme class after hydration
            if (state) {
              document.documentElement.classList.remove("light", "dark", "system");
              const resolved = state.theme === "system"
                ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
                : state.theme;
              document.documentElement.classList.add(resolved);
            }
          }
        }
      )
    );
    ```
  </action>
  <verify>
    <automated>test -f src/stores/useThemeStore.ts && grep -l "persist" src/stores/useThemeStore.ts</automated>
  </verify>
  <done>Zustand theme store 创建完成</done>
</task>

<task type="auto">
  <name>Task 2: Create useTheme hook</name>
  <files>src/hooks/useTheme.ts</files>
  <action>
    创建 useTheme hook 应用主题到 DOM：

    ```typescript
    import { useEffect } from "react";
    import { useThemeStore } from "@/stores/useThemeStore";

    export function useTheme() {
      const { theme, setTheme } = useThemeStore();

      useEffect(() => {
        const root = document.documentElement;
        root.classList.remove("light", "dark");

        if (theme === "system") {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
          root.classList.add(systemTheme);
        } else {
          root.classList.add(theme);
        }
      }, [theme]);

      return { theme, setTheme };
    }
    ```
  </action>
  <verify>
    <automated>test -f src/hooks/useTheme.ts && grep -l "useEffect" src/hooks/useTheme.ts</automated>
  </verify>
  <done>useTheme hook 创建完成</done>
</task>

<task type="auto">
  <name>Task 3: Create layout components</name>
  <files>src/components/layout/AppShell.tsx, src/components/layout/Header.tsx, src/components/layout/Sidebar.tsx, src/components/layout/Footer.tsx</files>
  <action>
    创建布局组件：

    **AppShell.tsx** - 主容器
    - 包含 Header、Sidebar、Footer 和 content area
    - 使用 CSS Grid 布局

    **Header.tsx** (56px height)
    - Logo + 应用名称
    - 主题切换 Switch
    - Settings 按钮 (gear icon)
    - 从 src/components/layout/Header.tsx 引用

    **Sidebar.tsx** (200px width, collapsible to 64px)
    - 导航菜单项：研究、撰写、编辑器、分析、发布、设置
    - 折叠按钮在底部
    - 使用 Lucide icons
    - 激活状态：左侧蓝色边框

    **Footer.tsx** (32px height)
    - 状态文本
    - 版本号

    使用 TailwindCSS classes：
    - Header: `h-14 border-b`
    - Sidebar: `w-[200px] data-[collapsed=true]:w-16`
    - Footer: `h-8 border-t text-sm`
    - Main: `flex-1 overflow-auto`
  </action>
  <verify>
    <automated>ls src/components/layout/AppShell.tsx src/components/layout/Header.tsx src/components/layout/Sidebar.tsx src/components/layout/Footer.tsx</automated>
  </verify>
  <done>布局组件创建完成</done>
</task>

<task type="auto">
  <name>Task 4: Update App.tsx with AppShell</name>
  <files>src/App.tsx</files>
  <action>
    更新 App.tsx 使用 AppShell：

    ```tsx
    import { useTheme } from "@/hooks/useTheme";
    import { AppShell } from "@/components/layout/AppShell";

    function App() {
      useTheme(); // Apply theme on mount

      return (
        <AppShell />
      );
    }

    export default App;
    ```
  </action>
  <verify>
    <automated>grep -l "AppShell" src/App.tsx</automated>
  </verify>
  <done>App.tsx 更新完成</done>
</task>

<task type="auto">
  <name>Task 5: Configure TailwindCSS theme</name>
  <files>src/index.css</files>
  <action>
    更新 src/index.css 添加 Inter 字体和自定义 CSS 变量：

    ```css
    @import "tailwindcss";
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

    @theme {
      --font-sans: "Inter", system-ui, sans-serif;

      /* Spacing (8-point system) */
      --spacing-xs: 4px;
      --spacing-sm: 8px;
      --spacing-md: 16px;
      --spacing-lg: 24px;
      --spacing-xl: 32px;
      --spacing-2xl: 48px;
      --spacing-3xl: 64px;
    }

    /* Base styles */
    html {
      font-family: var(--font-sans);
    }

    body {
      @apply bg-white text-slate-900;
    }

    .dark body {
      @apply bg-slate-900 text-slate-100;
    }
    ```
  </action>
  <verify>
    <automated>grep -l "Inter" src/index.css</automated>
  </verify>
  <done>TailwindCSS 主题配置完成</done>
</task>

</tasks>

<verification>
- [ ] 主题切换按钮可以切换 light/dark
- [ ] Sidebar 可以折叠/展开
- [ ] 导航项显示正确
- [ ] Footer 显示版本信息
</verification>

<success_criteria>
布局组件和主题系统完成，应用可以显示正确的 UI 结构。
</success_criteria>

<output>
After completion, create `.planning/phases/01-基础框架搭建/{phase}-03-SUMMARY.md`
</output>
