# Phase 4: 打磨与发布 (Polish and Release)

---

## Plan 04-01: Error Handling and Retry Logic

---
phase: 04-打磨与发布
plan: 04-01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/api-client.ts
  - src/components/features/ErrorBoundary.tsx
  - src/hooks/useOnlineStatus.ts
  - src/lib/python.ts
  - src/stores/useResearchStore.ts
  - src/stores/useWriteStore.ts
  - src/stores/useEditorStore.ts
  - src-tauri/src/commands/python.rs
autonomous: false
requirements:
  - T-401
  - T-402
  - T-403
  - T-404

must_haves:
  truths:
    - "API errors display user-friendly toast messages via toast.promise()"
    - "Network failures show retry option with cached data"
    - "Python script failures show actionable error messages"
    - "All async operations have loading states with ProgressBar"
  artifacts:
    - path: "src/lib/api-client.ts"
      provides: "Centralized API client with @tanstack/react-query retry logic"
      contains: "fetchWithRetry, ApiError class, isOnline hook"
    - path: "src/components/features/ErrorBoundary.tsx"
      provides: "React error boundary for graceful degradation"
      contains: "ErrorBoundary, FallbackProps"
    - path: "src/hooks/useOnlineStatus.ts"
      provides: "Network status detection hook"
      contains: "useOnlineStatus hook"
  key_links:
    - from: "src/lib/python.ts"
      to: "src/lib/api-client.ts"
      via: "import and use fetchWithRetry"
    - from: "src/stores/*.ts"
      to: "src/hooks/useApiError.ts"
      via: "useApiError hook for error state"
    - from: "src/App.tsx"
      to: "src/components/features/ErrorBoundary.tsx"
      via: "Wrap app with ErrorBoundary"
---

<objective>
Implement comprehensive error handling using @tanstack/react-query for API retry/caching, react-error-boundary for render errors, and enhanced Python script error messages. All errors display via toast notifications per D-02.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@src/lib/python.ts
@src/stores/useResearchStore.ts
@src/stores/useWriteStore.ts
@src-tauri/src/commands/python.rs
@src/components/ui/sonner.tsx

From src/components/ui/sonner.tsx:
```typescript
// sonner is already configured - Toaster component exists
```

From src/lib/python.ts (existing pattern):
```typescript
// invoke call that needs error wrapping
const result = await invoke<string>("run_python_script", { script, args });
// Progress event listener pattern already exists
const unlisten = await listen<ProgressPayload>("research-progress", (event) => {
  console.log(`Progress: ${event.payload.progress}% - ${event.payload.message}`);
});
```

<interfaces>
From @tauri-apps/api/core:
```typescript
invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T>
```

From sonner toast.promise():
```typescript
toast.promise(promise, {
  loading: "正在处理...",
  success: (data) => "操作成功",
  error: (err) => `错误: ${err}`
})
```

From @tanstack/react-query (recommended per research):
```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
// retry: 3, retryDelay: exponential backoff
// placeholderData for cached results during refetch
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install @tanstack/react-query and react-error-boundary</name>
  <files>package.json</files>
  <action>
Install required packages per research findings:

1. Run: `pnpm add @tanstack/react-query react-error-boundary`
2. These enable:
   - @tanstack/react-query: API retry with exponential backoff, offline caching
   - react-error-boundary: Catch React render errors gracefully

Per research: "Don't hand-roll retry logic, use @tanstack/react-query" (Architecture Patterns section)
</action>
  <verify>
    <automated>grep -q "@tanstack/react-query" package.json && grep -q "react-error-boundary" package.json</automated>
  </verify>
  <done>@tanstack/react-query and react-error-boundary installed</done>
</task>

<task type="auto">
  <name>Task 2: Create API client with retry logic</name>
  <files>src/lib/api-client.ts</files>
  <action>
Create centralized API client with @tanstack/react-query integration per T-401, T-402:

1. Create `src/lib/api-client.ts` with:
   - `ApiError` class extending Error with status code, retryable flag
   - `fetchWithRetry(url, options, maxRetries)` using @tanstack/react-query
   - `isRetryable(status)` helper for 5xx and network errors
   - Export `useOnlineStatus` hook using navigator.onLine + event listeners

2. QueryClient configuration:
   - defaultOptions.queries.retry: 3
   - defaultOptions.queries.retryDelay: exponential backoff (1000 * 2^attempt)
   - defaultOptions.queries.staleTime: 5 minutes
   - Network status detection for offline mode

3. Example integration with python.ts invoke calls:
```typescript
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

// Instead of direct invoke, wrap with toast.promise()
toast.promise(
  invoke<string>("run_python_script", { script, args }),
  {
    loading: "正在研究...",
    success: (data) => "研究完成",
    error: (err) => `研究失败: ${err}`
  }
);
```

Per D-02: Use toast notifications for error display via sonner
</action>
  <verify>
    <automated>npm run build 2>&1 | head -20</automated>
  </verify>
  <done>API client exports QueryClient, fetchWithRetry, ApiError, isOnline</done>
</task>

<task type="auto">
  <name>Task 3: Create ErrorBoundary component</name>
  <files>src/components/features/ErrorBoundary.tsx</files>
  <action>
Create error boundary component per T-401:

1. Create `src/components/features/ErrorBoundary.tsx`:
```typescript
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

function Fallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-4 border border-red-300 rounded-lg bg-red-50">
      <h3 className="font-semibold text-red-800">出错了</h3>
      <p className="text-sm text-red-600">{error.message}</p>
      <Button onClick={resetErrorBoundary} variant="outline" className="mt-2">
        重试
      </Button>
    </div>
  );
}

export function GlobalErrorBoundary({ children }) {
  return (
    <ReactErrorBoundary FallbackComponent={Fallback} onReset={() => {}}>
      {children}
    </ReactErrorBoundary>
  );
}
```

2. Integrate in App.tsx - wrap the entire app:
```tsx
<GlobalErrorBoundary>
  <AppShell>...</AppShell>
</GlobalErrorBoundary>
```

Per research Pitfall 3: "Toast inside Error Boundary - Use global error handler that calls toast directly, or render toasts outside boundary"
</action>
  <verify>
    <automated>npm run build 2>&1 | head -20</automated>
  </verify>
  <done>ErrorBoundary component exists and wraps App</done>
</task>

<task type="auto">
  <name>Task 4: Enhance Python script error handling</name>
  <files>src-tauri/src/commands/python.rs, src/lib/python.ts</files>
  <action>
Enhance Python script error handling per T-403:

**Rust (src-tauri/src/commands/python.rs):**
1. Improve error messages from Python scripts:
   - Parse stderr for common Python errors (ImportError, SyntaxError, TimeoutError)
   - Map Python error types to user-friendly Chinese messages
   - Include script name in error for debugging

2. Add timeout support (30 second default):
```rust
std::process::Command::new("python3")
    .arg(script_path)
    .args(&args)
    .output_async()
    .timeout(Duration::from_secs(30))
```

3. Add stderr capture even on success (for warnings)

**TypeScript (src/lib/python.ts):**
1. Wrap invoke call with toast.promise() for async operations:
```typescript
export async function runResearch(type: ResearchType, keywords: string[]) {
  return toast.promise(
    invoke<string>("run_python_script", { script, args }),
    {
      loading: "正在研究...",
      success: (data) => {
        unlisten();
        return "研究完成";
      },
      error: (err) => {
        unlisten();
        return `研究失败: ${err}`;
      }
    }
  );
}
```

2. Add error categorization: NetworkError, ScriptError, TimeoutError

Per D-02: Errors shown via toast notifications
</action>
  <verify>
    <automated>cargo check --manifest-path src-tauri/Cargo.toml 2>&1 | head -20</automated>
  </verify>
  <done>Python script errors return user-friendly messages in Chinese</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 5: Verify error handling across flows</name>
  <files>N/A - manual verification required</files>
  <action>
Human verification of error handling implementation across all flows.

Per T-401, T-402, T-403: Error handling must work across all API calls, network failures, and script executions.
</action>
  <verify>
    <manual>See how-to-verify below</manual>
  </verify>
  <done>All error scenarios tested and approved</done>
  <what-built>Error handling implementation: @tanstack/react-query with retry, ErrorBoundary, enhanced Python errors</what-built>
  <how-to-verify>
    Test these scenarios:
    1. Research with invalid API key -> should show toast with actionable message
    2. Kill Python process -> should show "Script execution failed" toast with retry option
    3. Disconnect network -> should show "Offline" indicator and cached results if available
    4. All loading states should show Progress bar with percentage via toast.promise()
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
- Build succeeds: `npm run build` passes
- Rust compiles: `cargo check` passes
- Error types exported from api-client.ts
- Python errors show Chinese user messages
- @tanstack/react-query QueryClient configured
</verification>

<success_criteria>
- API errors display toast with retry option when applicable
- Network failures trigger offline mode indicator
- Python script errors are user-friendly (not raw stderr)
- All stores handle error state properly
- ErrorBoundary catches render errors without crashing app
</success_criteria>

<output>
After completion, create `.planning/phases/04-打磨与发布/04-01-SUMMARY.md`
</output>

---

## Plan 04-02: UI/UX Polish

---
phase: 04-打磨与发布
plan: 04-02
type: execute
wave: 1
depends_on: []
files_modified:
  - index.html
  - src/components/features/EmptyState.tsx
  - src/components/features/ProgressBar.tsx
  - src/components/features/KeyboardShortcuts.tsx
  - src/pages/Research.tsx
  - src/pages/Write.tsx
  - src/pages/Editor.tsx
  - src/pages/Analysis.tsx
  - src/pages/Articles.tsx
  - src/hooks/useTheme.ts
autonomous: false
requirements:
  - T-410
  - T-411
  - T-412
  - T-413
  - T-414

must_haves:
  truths:
    - "All pages show EmptyState component with guide when no data"
    - "Progress bar displays real percentage during operations"
    - "Keyboard shortcuts work for common actions"
    - "Theme transitions smoothly without flash on load"
  artifacts:
    - path: "index.html"
      provides: "Theme flash prevention inline script"
      contains: "Script that reads localStorage before React loads"
    - path: "src/components/features/EmptyState.tsx"
      provides: "Reusable empty state with guide card pattern"
      contains: "EmptyState component with icon, title, description, action"
    - path: "src/components/features/KeyboardShortcuts.tsx"
      provides: "Global keyboard shortcut handler"
      contains: "useKeyboardShortcuts hook using @tauri-apps/plugin-global-shortcut"
  key_links:
    - from: "index.html"
      to: "src/hooks/useTheme.ts"
      via: "Inline script sets theme class before React hydration"
    - from: "src/pages/*.tsx"
      to: "src/components/features/EmptyState.tsx"
      via: "import and use in place of text placeholders"
    - from: "src/App.tsx"
      to: "src/components/features/KeyboardShortcuts.tsx"
      via: "useKeyboardShortcuts hook at app level"
---

<objective>
Polish UI/UX with theme flash prevention (inline script in index.html), EmptyState guide cards per D-04, ProgressBar with percentage per D-03, and keyboard shortcuts using @tauri-apps/plugin-global-shortcut + react-hotkeys-hook.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@src/components/ui/progress.tsx
@src/pages/Research.tsx
@src/pages/Write.tsx
@src/hooks/useTheme.ts
@index.html

From index.html (current - MISSING theme flash prevention):
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Tauri + React + Typescript</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

From src/pages/Research.tsx (progress display):
```typescript
// Current progress - missing real percentage:
{isResearching && (
  <div className="space-y-2">
    <Progress value={progress || 50} />
    <p className="text-sm text-slate-500 text-center">正在分析...</p>
  </div>
)}
```

Research finding: Theme flash prevention needs inline script in index.html before React loads.

<interfaces>
From @tauri-apps/plugin-global-shortcut:
```typescript
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
await register("CommandOrControl+S", (event) => {
  if (event.state === "Pressed") handleSave();
});
```

From react-hotkeys-hook:
```typescript
import { useHotkeys } from "react-hotkeys-hook";
useHotkeys("ctrl+s", (e) => {
  e.preventDefault();
  handleSave();
});
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install keyboard shortcut libraries</name>
  <files>package.json</files>
  <action>
Install keyboard shortcut libraries per research findings for T-411:

1. Run: `pnpm add @tauri-apps/plugin-global-shortcut react-hotkeys-hook`

2. These enable:
   - @tauri-apps/plugin-global-shortcut: App-wide shortcuts (work when app not focused)
   - react-hotkeys-hook: Component-level shortcuts (page-specific)

Per research: "Keyboard shortcuts not implemented - Need both @tauri-apps/plugin-global-shortcut and react-hotkeys-hook"
</action>
  <verify>
    <automated>grep -q "plugin-global-shortcut" package.json && grep -q "react-hotkeys-hook" package.json</automated>
  </verify>
  <done>@tauri-apps/plugin-global-shortcut and react-hotkeys-hook installed</done>
</task>

<task type="auto">
  <name>Task 2: Add theme flash prevention inline script to index.html</name>
  <files>index.html</files>
  <action>
Add inline theme script to prevent theme flash per T-413 (research finding Pitfall 1):

Replace index.html with:

```html
<!doctype html>
<html lang="en">
  <head>
    <script>
      // Immediately apply theme to prevent flash of wrong theme
      (function() {
        const stored = localStorage.getItem("theme-storage");
        const theme = stored ? JSON.parse(stored).state.theme : "system";
        const resolved = theme === "system"
          ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
          : theme;
        document.documentElement.classList.add(resolved);
      })();
    </script>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SEO Machine</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

This script runs BEFORE React loads, preventing the theme flash described in research Pitfall 1:
- "Theme Flash on Load: App briefly shows wrong theme before React hydrates"
- "How to avoid: Add inline script in index.html that reads localStorage before React loads"

Per research recommendation for T-413
</action>
  <verify>
    <automated>grep -q "theme-storage" index.html && grep -q "document.documentElement.classList" index.html</automated>
  </verify>
  <done>index.html has inline script that sets theme before React hydrates</done>
</task>

<task type="auto">
  <name>Task 3: Create EmptyState component with guide card pattern</name>
  <files>src/components/features/EmptyState.tsx</files>
  <action>
Create reusable EmptyState component per D-04 (Guide cards) for T-414:

1. Create `src/components/features/EmptyState.tsx`:
```typescript
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center p-8 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </Card>
  );
}

// Pre-built empty states
export function EmptyResearch(props) { /* ... */ }
export function EmptyArticle(props) { /* ... */ }
export function EmptyAnalysis(props) { /* ... */ }
export function EmptySearch(props) { /* ... */ }
```

2. Use card styling per D-04:
   - Centered icon (48px, muted color)
   - Bold title below icon
   - Optional description in muted text
   - Optional action button

3. Replace existing placeholder text in pages with EmptyState components:
   - Research.tsx, Write.tsx, Editor.tsx, Analysis.tsx, Articles.tsx

Per D-04: Guide card pattern with action button
</action>
  <verify>
    <automated>npm run build 2>&1 | head -30</automated>
  </verify>
  <done>EmptyState component exists with icon, title, description, action props</done>
</task>

<task type="auto">
  <name>Task 4: Create ProgressBar with percentage display</name>
  <files>src/components/features/ProgressBar.tsx</files>
  <action>
Create ProgressBar component with percentage display per D-03 for T-410:

1. Create `src/components/features/ProgressBar.tsx`:
```typescript
import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  value: number;           // 0-100
  message?: string;          // Optional status message
  showPercentage?: boolean; // Default true
}

export function ProgressBar({ value, message, showPercentage = true }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Progress value={value} className="flex-1" />
        {showPercentage && <span className="text-sm font-medium w-12">{value}%</span>}
      </div>
      {message && <p className="text-sm text-muted-foreground text-center">{message}</p>}
    </div>
  );
}
```

2. Update Research.tsx to use ProgressBar:
   - Remove hardcoded `|| 50` values
   - Use `<ProgressBar value={progress} message="正在分析..." />`

3. Update Write.tsx similarly

Per D-03: Progress Bar + Percentage for precise progress feedback
</action>
  <verify>
    <automated>npm run build 2>&1 | head -30</automated>
  </verify>
  <done>ProgressBar component displays percentage alongside progress bar</done>
</task>

<task type="auto">
  <name>Task 5: Implement keyboard shortcuts</name>
  <files>src/components/features/KeyboardShortcuts.tsx, src/App.tsx</files>
  <action>
Implement keyboard shortcuts for T-411 using research-recommended libraries:

1. Create `src/components/features/KeyboardShortcuts.tsx`:
```typescript
import { useEffect } from "react";
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { useHotkeys } from "react-hotkeys-hook";

interface ShortcutDefinition {
  key: string;
  handler: () => void;
  description: string;
}

// Global shortcuts (work when app not focused)
export function useGlobalShortcut(shortcut: string, handler: () => void) {
  useEffect(() => {
    register(shortcut, (event) => {
      if (event.state === "Pressed") handler();
    });
    return () => unregisterAll();
  }, [shortcut, handler]);
}

// Component-level shortcuts
export function useKeyboardShortcuts(shortcuts: ShortcutDefinition[]) {
  shortcuts.forEach(({ key, handler }) => {
    useHotkeys(key, (e) => {
      e.preventDefault();
      handler();
    });
  });
}
```

2. Define standard shortcuts:
   - `cmd/ctrl + s` - Save current work
   - `cmd/ctrl + n` - New article/research
   - `cmd/ctrl + ,` - Open settings
   - `Escape` - Close dialogs/modals

3. Integrate at App level and page level:
   - Add useGlobalShortcut in App.tsx for app-wide shortcuts
   - Add useKeyboardShortcuts in specific pages for page-specific shortcuts

Per research: "@tauri-apps/plugin-global-shortcut + react-hotkeys-hook recommended"
</action>
  <verify>
    <automated>npm run build 2>&1 | head -30</automated>
  </verify>
  <done>Keyboard shortcuts work for save, new, settings across pages</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 6: Verify UI/UX polish</name>
  <files>N/A - manual verification required</files>
  <action>
Human verification of UI/UX polish implementation.

Per T-410, T-411, T-413, T-414: Loading states, keyboard shortcuts, theme polish, and empty states must all be verified.
</action>
  <verify>
    <manual>See how-to-verify below</manual>
  </verify>
  <done>All UI/UX features verified</done>
  <what-built>EmptyState components, ProgressBar with percentage, keyboard shortcuts, theme flash prevention</what-built>
  <how-to-verify>
    Test these scenarios:
    1. Open app in dark mode -> should NOT flash to light mode first (theme flash prevention)
    2. Go to Research page without data -> should show EmptyState with guide card
    3. Start research -> ProgressBar shows real percentage updating
    4. Press cmd+s anywhere -> should trigger save action
    5. Go to each page -> empty states should show appropriate guidance
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
- Build succeeds: `npm run build` passes
- EmptyState component exists and is used in pages
- ProgressBar shows percentage
- Keyboard shortcuts respond
- Theme transitions smoothly without flash (no flicker on load)
</verification>

<success_criteria>
- All pages with no data show EmptyState guide cards
- Progress operations show real percentage (0-100%)
- Keyboard shortcuts work for save, new, settings
- Theme toggles smoothly without flash on initial load
</success_criteria>

<output>
After completion, create `.planning/phases/04-打磨与发布/04-02-SUMMARY.md`
</output>

---

## Plan 04-03: Packaging and Distribution

---
phase: 04-打磨与发布
plan: 04-03
type: execute
wave: 2
depends_on: []
files_modified:
  - src-tauri/tauri.conf.json
  - src-tauri/Cargo.toml
  - src-tauri/icons/
  - python-scripts/seomachine.spec
  - docs/
autonomous: false
requirements:
  - T-420
  - T-421
  - T-422
  - T-423
  - T-424

must_haves:
  truths:
    - "App icon displays in macOS dock and menu bar"
    - "App name and version visible in About dialog"
    - "macOS .dmg installer is generated"
    - "Python scripts bundled via PyInstaller single file"
  artifacts:
    - path: "src-tauri/icons/"
      provides: "App icons in all required sizes"
      contains: "32x32.png, 128x128.png, 128x128@2x.png, icon.icns, icon.ico"
    - path: "src-tauri/tauri.conf.json"
      provides: "App metadata configuration"
      contains: "productName, version, identifier"
    - path: "python-scripts/seomachine.spec"
      provides: "PyInstaller spec for single-file Python bundle"
      contains: "pyinstaller configuration per D-01"
  key_links:
    - from: "src-tauri/tauri.conf.json"
      to: "src-tauri/icons/"
      via: "icon path references"
    - from: "src-tauri/Cargo.toml"
      to: "src-tauri/tauri.conf.json"
      via: "version reference"
    - from: "python-scripts/seomachine.spec"
      to: "src-tauri/tauri.conf.json"
      via: "bundled Python referenced in resources"
---

<objective>
Configure application metadata (version bump to 1.0.0), verify icon configuration, create PyInstaller spec for Python script bundling per D-01, and build macOS .dmg installer. Also create basic user documentation.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@src-tauri/tauri.conf.json
@src-tauri/Cargo.toml

From src-tauri/tauri.conf.json (current):
```json
{
  "productName": "SEO Machine",
  "version": "0.1.0",
  "identifier": "com.seomachine.app",
  "bundle": {
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

Icon files exist in src-tauri/icons/ (verified via glob):
- 32x32.png, 128x128.png, 128x128@2x.png
- icon.icns, icon.ico

Per D-01: PyInstaller single file for Python scripts
Per research: "Icons directory missing" was incorrect - icons exist

<interfaces>
PyInstaller spec file structure:
```python
a = Analysis(['script1.py', 'script2.py'], ...)
exe = EXE(pyz, a.scripts, a.binaries, ..., name='seomachine', ...)
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Configure app metadata and version bump</name>
  <files>src-tauri/tauri.conf.json, src-tauri/Cargo.toml</files>
  <action>
Update app metadata for release per T-421:

1. Update tauri.conf.json:
   - version: "1.0.0" (bump from 0.1.0 for release)
   - productName: "SEO Machine" (already correct)
   - identifier: "com.seomachine.app" (already correct)
   - Add bundle category for macOS: "public.app-category.productivity"
   - Add copyright: "Copyright 2026 SEO Machine"

2. Sync version between Cargo.toml and tauri.conf.json:
   - Update Cargo.toml version to "1.0.0"

3. Update Cargo.toml:
   - description: "SEO-optimized content creation tool"
   - authors: ["Your Name <email@example.com>"]

4. Verify icon paths are correct (icons already exist):
```json
"icon": [
  "icons/32x32.png",
  "icons/128x128.png",
  "icons/128x128@2x.png",
  "icons/icon.icns",
  "icons/icon.ico"
]
```

Per T-421: Configure app name and version
</action>
  <verify>
    <automated>grep -E '"version"|"productName"' src-tauri/tauri.conf.json</automated>
  </verify>
  <done>App metadata configured with name "SEO Machine" and version "1.0.0"</done>
</task>

<task type="auto">
  <name>Task 2: Create PyInstaller spec for Python scripts</name>
  <files>python-scripts/seomachine.spec</files>
  <action>
Create PyInstaller spec file for bundling Python scripts per D-01 (T-420):

1. Create `python-scripts/seomachine.spec`:
```python
# -*- mode: python ; coding: utf-8 -*-
from PyInstaller.utils.hooks import collect_all, collect_submodules

block_cipher = None

# Collect all needed submodules and data
hiddenimports = collect_submodules('dataforseo_client')
hiddenimports += collect_submodules('anthropic')
hiddenimports += ['json', 'requests', 'urllib3', 'certifi']

a = Analysis(
    ['research_quick_wins.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='seomachine',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,  # GUI app, no console window
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
```

2. List all Python scripts to include:
   - research_quick_wins.py, research_competitor_gaps.py
   - research_performance_matrix.py, research_priorities_comprehensive.py
   - research_serp_analysis.py, research_topic_clusters.py
   - research_trending.py
   - seo_baseline_analysis.py, seo_bofu_rankings.py
   - seo_competitor_analysis.py

3. Document build command:
   - `pyinstaller seomachine.spec --noconfirm`
   - Output in `python-scripts/dist/seomachine`

Per D-01: PyInstaller single file for Python packaging
</action>
  <verify>
    <automated>ls -la python-scripts/*.spec 2>/dev/null || echo "No spec files yet"</automated>
  </verify>
  <done>PyInstaller spec file created for Python script packaging</done>
</task>

<task type="auto">
  <name>Task 3: Update tauri.conf.json for Python bundle</name>
  <files>src-tauri/tauri.conf.json</files>
  <action>
Update tauri.conf.json to reference bundled Python executable per D-01:

1. Update bundle resources to include PyInstaller output:
```json
"bundle": {
  "active": true,
  "targets": ["dmg", "app"],  // macOS targets
  "icon": [...],
  "resources": {
    "../python-scripts/dist/seomachine": "seomachine"
  }
}
```

2. This bundles the PyInstaller output into the Tauri app resources

Per D-01: PyInstaller single file - bundle with Tauri app

Note: The Python scripts are currently referenced via:
`"resources": { "../python-scripts/*": "python-scripts/" }`
Update to point to PyInstaller output instead.
</action>
  <verify>
    <automated>grep -A5 '"resources"' src-tauri/tauri.conf.json</automated>
  </verify>
  <done>tauri.conf.json resources updated for PyInstaller bundle</done>
</task>

<task type="auto">
  <name>Task 4: Create user documentation</name>
  <files>docs/README.md</files>
  <action>
Create basic user documentation per T-424:

1. Create `docs/README.md`:
```markdown
# SEO Machine

SEO Machine is a desktop application for SEO-optimized content creation.

## Features

- **Topic Research**: Analyze keywords, competitors, and trends
- **Article Writing**: Generate SEO-optimized articles with AI
- **Content Editor**: Edit and refine your content
- **SEO Analysis**: Evaluate content quality and readability
- **WordPress Publishing**: Publish directly to your WordPress site

## Installation

### macOS
1. Download `SEO Machine-x.x.x.dmg`
2. Open the DMG file
3. Drag `SEO Machine.app` to Applications
4. Launch from Applications or Dock

### Windows
1. Download `SEO Machine-x.x.x.msi`
2. Run the installer
3. Launch from Start Menu

## System Requirements

- macOS 11.0 or later
- Windows 10 or later
- 4GB RAM minimum
- 500MB disk space

## Getting Started

1. Launch SEO Machine
2. Configure your API keys in Settings:
   - Claude API key for content generation
   - DataForSEO API key for keyword research
3. Start by creating a new research project
4. Generate articles and publish to WordPress

## Keyboard Shortcuts

- `Cmd/Ctrl + S`: Save current work
- `Cmd/Ctrl + N`: New article/research
- `Cmd/Ctrl + ,`: Open settings
- `Escape`: Close dialogs

## Troubleshooting

### Python script errors
If you see "Python script not found", please reinstall the application.

### API errors
Check your API keys in Settings and ensure they are valid.
```

Per T-424: Create user use documentation
</action>
  <verify>
    <automated>ls -la docs/ 2>/dev/null || echo "No docs directory yet"</automated>
  </verify>
  <done>docs/README.md created with user documentation</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 5: Build and verify macOS .dmg package</name>
  <files>N/A - build verification task</files>
  <action>
Human verification of macOS .dmg build per T-422.

Note: Icons already exist in src-tauri/icons/. This task focuses on building the .dmg.

Per T-422: Package macOS installer (.dmg)
Per T-423: Package Windows installer (.exe) - optional on macOS dev
</action>
  <verify>
    <manual>See how-to-verify below</manual>
  </verify>
  <done>.dmg package verified functional</done>
  <what-built>App metadata configured (1.0.0), Python packaging prepared, user docs created</what-built>
  <how-to-verify>
    Steps to build and verify:
    1. Run: `npm run tauri build -- --target universal-apple-darwin`
    2. Check that .dmg was created in src-tauri/target/release/bundle/dmg/
    3. Mount the .dmg and verify app launches
    4. Verify app icon displays correctly in Dock
    5. Verify version shows as 1.0.0 in About dialog
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
- App version is 1.0.0 in both Cargo.toml and tauri.conf.json
- PyInstaller spec file exists
- Icons exist at correct paths in src-tauri/icons/
- .dmg package is generated
- App launches from .dmg
- User documentation exists in docs/README.md
</verification>

<success_criteria>
- App icon displays in macOS
- Version shows as 1.0.0 in About dialog
- .dmg installer is generated and functional
- Python scripts can be packaged via PyInstaller spec
- User documentation is complete
</success_criteria>

<output>
After completion, create `.planning/phases/04-打磨与发布/04-03-SUMMARY.md`
</output>

---

## Wave Structure

| Wave | Plans | Autonomous |
|------|-------|------------|
| 1 | 04-01 (Error Handling), 04-02 (UI/UX Polish) | No (both have checkpoints) |
| 2 | 04-03 (Packaging) | No (has build checkpoint) |

## Dependencies

- 04-01 and 04-02 can run in parallel (Wave 1)
- 04-03 depends on icon configuration but icons already exist, so can start after 04-02 completes or in parallel

## Next Steps

Execute: `/gsd:execute-phase 04-打磨与发布`

<sub>`/clear` first - fresh context window</sub>
