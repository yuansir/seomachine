---
phase: 01-基础框架搭建
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/ui/button.tsx
  - src/components/ui/card.tsx
  - src/components/ui/input.tsx
  - src/components/ui/switch.tsx
  - src/components/ui/tabs.tsx
  - src/components/ui/badge.tsx
  - src/components/ui/dialog.tsx
  - src/components/ui/sheet.tsx
  - src/components/ui/progress.tsx
  - src/components/ui/skeleton.tsx
  - src/components/ui/toast.tsx
  - src/components/ui/toaster.tsx
  - src/hooks/use-toast.ts
autonomous: true
requirements:
  - REQ-R-002
  - REQ-R-007
---

<objective>
安装和配置 shadcn/ui 组件库，复制 Phase 1 所需的 UI 组件。
</objective>

<context>
@/tmp/seomachine/.planning/phases/01-基础框架搭建/01-UI-SPEC.md

## UI-SPEC Component Requirements (Phase 1)
| Component | Purpose |
|-----------|---------|
| Button | Primary CTA, secondary actions |
| Input | API key fields, search |
| Card | Content containers |
| Dialog | Confirmations, modals |
| Sheet | Settings panel, sidebars |
| Tabs | Navigation between sections |
| Badge | Status indicators |
| Toast | Success/error notifications |
| Skeleton | Loading states |
| Progress | Progress indicators |
| Switch | Toggle settings (dark mode) |
| Select | Dropdown selections |
</context>

<tasks>

<task type="auto">
  <name>Task 1: Initialize shadcn/ui</name>
  <files>components.json, src/lib/utils.ts</files>
  <action>
    初始化 shadcn/ui CLI：

    ```bash
    cd /tmp/seomachine
    npx shadcn@latest init -y -d
    ```

    配置 components.json：
    - style: default
    - baseColor: slate
    - cssVariables: true
    - aliases.components: @/components
    - aliases.utils: @/lib/utils

    确保 src/lib/utils.ts 存在且包含 cn() 函数。
  </action>
  <verify>
    <automated>test -f components.json && test -f src/lib/utils.ts</automated>
  </verify>
  <done>shadcn/ui CLI 初始化完成</done>
</task>

<task type="auto">
  <name>Task 2: Add shadcn/ui components</name>
  <files>src/components/ui/button.tsx, src/components/ui/card.tsx, src/components/ui/input.tsx, src/components/ui/switch.tsx, src/components/ui/tabs.tsx, src/components/ui/badge.tsx, src/components/ui/dialog.tsx, src/components/ui/sheet.tsx, src/components/ui/progress.tsx, src/components/ui/skeleton.tsx</files>
  <action>
    使用 shadcn CLI 添加 Phase 1 所需的组件：

    ```bash
    cd /tmp/seomachine
    npx shadcn@latest add button card input switch tabs badge dialog sheet progress skeleton -y
    ```

    每个组件会创建对应的 .tsx 文件在 src/components/ui/ 目录。

    注意：不使用 Select 组件（Phase 2+ 需要时添加）
  </action>
  <verify>
    <automated>ls src/components/ui/button.tsx src/components/ui/card.tsx src/components/ui/input.tsx</automated>
  </verify>
  <done>shadcn/ui 组件添加完成</done>
</task>

<task type="auto">
  <name>Task 3: Add Toast component</name>
  <files>src/components/ui/toast.tsx, src/components/ui/toaster.tsx, src/hooks/use-toast.ts</files>
  <action>
    添加 Toast 组件和相关 hook：

    ```bash
    cd /tmp/seomachine
    npx shadcn@latest add toast -y
    ```

    这会创建：
    - src/components/ui/toast.tsx
    - src/components/ui/toaster.tsx
    - src/hooks/use-toast.ts
  </action>
  <verify>
    <automated>ls src/components/ui/toast.tsx src/hooks/use-toast.ts</automated>
  </verify>
  <done>Toast 组件添加完成</done>
</task>

</tasks>

<verification>
- [ ] components.json 存在
- [ ] src/components/ui/ 包含所有 Phase 1 组件
- [ ] 所有组件可以正常导入
</verification>

<success_criteria>
shadcn/ui 组件库配置完成，所有 Phase 1 所需组件已添加。
</success_criteria>

<output>
After completion, create `.planning/phases/01-基础框架搭建/{phase}-02-SUMMARY.md`
</output>
