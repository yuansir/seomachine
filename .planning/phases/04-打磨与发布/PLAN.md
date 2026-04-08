# Phase 4: 打磨与发布 (Polish and Release)

---
phase: 04-打磨与发布
plan: 04-01
type: execute
wave: 1
depends_on: []
files_modified:
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
    - "API errors display user-friendly toast messages"
    - "Network failures show retry option with cached data"
    - "Python script failures show actionable error messages"
    - "All async operations have loading states"
  artifacts:
    - path: "src/lib/api-client.ts"
      provides: "Centralized API client with retry logic"
      contains: "fetchWithRetry, ApiError class"
    - path: "src/components/features/ErrorBoundary.tsx"
      provides: "React error boundary for graceful degradation"
      contains: "ErrorBoundary component"
    - path: "src/hooks/useApiError.ts"
      provides: "Error handling hook for stores"
      contains: "useApiError hook"
  key_links:
    - from: "src/lib/python.ts"
      to: "src/lib/api-client.ts"
      via: "import and use fetchWithRetry"
    - from: "src/stores/*.ts"
      to: "src/hooks/useApiError.ts"
      via: "useApiError hook for error state"
---

<objective>
Implement comprehensive error handling and retry logic across the application. Ensure all API calls, Python script invocations, and network operations fail gracefully with user-friendly messages and recovery options.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@src/lib/python.ts
@src/stores/useResearchStore.ts
@src/stores/useWriteStore.ts
@src-tauri/src/commands/python.rs

From src/lib/python.ts (current):
```typescript
// Progress event listener pattern already exists
const unlisten = await listen<ProgressPayload>("research-progress", (event) => {
  console.log(`Progress: ${event.payload.progress}% - ${event.payload.message}`);
});

// invoke call that needs error wrapping
const result = await invoke<string>("run_python_script", { script, args });
```

From src/stores/useResearchStore.ts:
```typescript
// Store already has: isResearching, progress, error fields
// Error handling needs to be more robust
setError: (error) => set({ error }),
```

<interfaces>
<!-- Key types the executor needs -->

From @tauri-apps/api/core:
```typescript
invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T>
```

From src/stores/useResearchStore.ts:
```typescript
interface ResearchState {
  isResearching: boolean;
  progress: number;
  error: string | null;
  setError: (error: string | null) => void;
  setProgress: (progress: number) => void;
  setIsResearching: (isResearching: boolean) => void;
}
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create API client with retry logic</name>
  <files>src/lib/api-client.ts</files>
  <action>
Create centralized API client with retry logic and error handling:

1. Create `src/lib/api-client.ts` with:
   - `ApiError` class extending Error with status code, retryable flag
   - `fetchWithRetry(url, options, maxRetries, backoffMs)` function
   - `isRetryable(status)` helper for 5xx and network errors
   - Exponential backoff implementation
   - Network status detection using navigator.onLine

2. Export helper for detecting offline state:
```typescript
export function isOnline(): boolean
export function onNetworkChange(callback: (online: boolean) => void): () => void
```

3. Integrate with existing python.ts by replacing direct invoke calls with wrapped versions

Per D-02: Use toast notifications for error display (already integrated via sonner)
</action>
  <verify>
    <automated>npm run build 2>&1 | head -20</automated>
  </verify>
  <done>API client exports fetchWithRetry, ApiError, isOnline, onNetworkChange</done>
</task>

<task type="auto">
  <name>Task 2: Enhance Python script error handling</name>
  <files>src-tauri/src/commands/python.rs, src/lib/python.ts</files>
  <action>
Enhance Python script error handling in Rust and TypeScript:

**Rust (src-tauri/src/commands/python.rs):**
1. Improve error messages from Python scripts:
   - Parse stderr for common Python errors (ImportError, SyntaxError, TimeoutError)
   - Map Python error types to user-friendly Chinese messages
   - Include script name and arguments in error for debugging

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
1. Wrap invoke call with try-catch and better error transformation
2. Add error categorization: NetworkError, ScriptError, TimeoutError
3. Show actionable error messages (e.g., "Python script not found" -> "Please reinstall the application")

Per D-02: Errors shown via toast notifications
</action>
  <verify>
    <automated>cargo check --manifest-path src-tauri/Cargo.toml 2>&1 | head -20</automated>
  </verify>
  <done>Python script errors return user-friendly messages in Chinese</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Verify error handling across flows</name>
  <files>N/A - manual verification required</files>
  <action>
Human verification of error handling implementation across all flows.

Per T-401, T-402, T-403: Error handling must work across all API calls, network failures, and script executions.
</action>
  <verify>
    <manual>See how-to-verify below</manual>
  </verify>
  <done>All error scenarios tested and approved</done>
  <what-built>Error handling implementation: API client with retry, Python error enhancement</what-built>
  <how-to-verify>
    Test these scenarios:
    1. Research with invalid API key -> should show toast with actionable message
    2. Kill Python process -> should show "Script execution failed" toast with retry option
    3. Disconnect network -> should show "Offline" indicator and cached results if available
    4. All loading states should show Progress bar with percentage
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
- Build succeeds: `npm run build` passes
- Rust compiles: `cargo check` passes
- Error types exported from api-client.ts
- Python errors show Chinese user messages
</verification>

<success_criteria>
- API errors display toast with retry option when applicable
- Network failures trigger offline mode indicator
- Python script errors are user-friendly (not raw stderr)
- All stores handle error state properly
</success_criteria>

<output>
After completion, create `.planning/phases/04-打磨与发布/04-01-SUMMARY.md`
</output>

---

---
phase: 04-打磨与发布
plan: 04-02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/ui/progress.tsx
  - src/components/features/EmptyState.tsx
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
    - "Theme transitions smoothly without flash"
  artifacts:
    - path: "src/components/features/EmptyState.tsx"
      provides: "Reusable empty state with guide card pattern"
      contains: "EmptyState component with icon, title, description, action"
    - path: "src/components/features/KeyboardShortcuts.tsx"
      provides: "Global keyboard shortcut handler"
      contains: "useKeyboardShortcuts hook"
  key_links:
    - from: "src/pages/*.tsx"
      to: "src/components/features/EmptyState.tsx"
      via: "import and use in place of text placeholders"
    - from: "src/components/features/KeyboardShortcuts.tsx"
      to: "src/App.tsx"
      via: "useKeyboardShortcuts hook at app level"
---

<objective>
Polish UI/UX with proper loading states, empty states with guidance, keyboard shortcuts, and theme refinements. Create reusable components for consistent UX patterns.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@src/components/ui/progress.tsx
@src/pages/Research.tsx
@src/pages/Write.tsx
@src/hooks/useTheme.ts

From src/components/ui/progress.tsx:
```typescript
// shadcn/ui Progress component - just wraps native progress
// Need to add percentage display wrapper
```

From src/pages/Research.tsx (line 169-174):
```typescript
// Current progress display:
{isResearching && (
  <div className="space-y-2">
    <Progress value={progress || 50} />
    <p className="text-sm text-slate-500 text-center">正在分析...</p>
  </div>
)}
// Missing: actual percentage value shown, real progress updates
```

From src/hooks/useTheme.ts (for T-413):
```typescript
// next-themes useTheme hook - need to ensure smooth transitions
```

<interfaces>
From shadcn/ui Progress component:
```typescript
// Standard Progress component props
interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}
```

From sonner toast (already used):
```typescript
toast.error(message, { action: { label: "Retry", onClick: () => {} } })
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create EmptyState component with guide card pattern</name>
  <files>src/components/features/EmptyState.tsx</files>
  <action>
Create reusable EmptyState component per D-04 (Guide cards):

1. Create `src/components/features/EmptyState.tsx`:
```typescript
interface EmptyStateProps {
  icon: React.ReactNode;        // Lucide icon
  title: string;                 // Main message
  description?: string;          // Optional detailed guidance
  action?: {
    label: string;               // Button text
    onClick: () => void;         // Action handler
  };
}
```

2. Use card styling with:
   - Centered icon (48px, muted color)
   - Bold title below icon
   - Optional description in muted text
   - Optional action button

3. Create pre-built empty states for common scenarios:
   - `EmptyResearch` - "开始关键词研究"
   - `EmptyArticle` - "创建您的第一篇文章"
   - `EmptyAnalysis` - "分析您的内容"
   - `EmptySearch` - "没有找到结果"

Per D-04: Guide card pattern with action button
</action>
  <verify>
    <automated>npm run build 2>&1 | head -30</automated>
  </verify>
  <done>EmptyState component exists with icon, title, description, action props</done>
</task>

<task type="auto">
  <name>Task 2: Create ProgressBar with percentage display</name>
  <files>src/components/features/ProgressBar.tsx</files>
  <action>
Create ProgressBar component with percentage display per D-03:

1. Create `src/components/features/ProgressBar.tsx`:
```typescript
interface ProgressBarProps {
  value: number;           // 0-100
  message?: string;         // Optional status message
  showPercentage?: boolean; // Default true
  size?: "sm" | "md" | "lg"; // Default "md"
  className?: string;
}
```

2. Display:
   - Progress bar (using shadcn/ui Progress)
   - Percentage text aligned right
   - Optional message below

3. Integrate with existing stores:
   - Update Research.tsx to use `<ProgressBar value={progress} message="正在分析..." />`
   - Update Write.tsx similarly
   - Remove hardcoded `|| 50` values

Per D-03: Progress Bar + Percentage for precise progress feedback
</action>
  <verify>
    <automated>npm run build 2>&1 | head -30</automated>
  </verify>
  <done>ProgressBar component displays percentage alongside progress bar</done>
</task>

<task type="auto">
  <name>Task 3: Implement keyboard shortcuts</name>
  <files>src/components/features/KeyboardShortcuts.tsx, src/App.tsx</files>
  <action>
Implement keyboard shortcuts support for T-411:

1. Create `src/components/features/KeyboardShortcuts.tsx`:
```typescript
interface ShortcutDefinition {
  key: string;              // e.g., "cmd+k", "ctrl+shift+s"
  handler: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutDefinition[]): void
export function KeyboardShortcutsProvider({ children }): JSX.Element
```

2. Define standard shortcuts:
   - `cmd/ctrl + s` - Save current work
   - `cmd/ctrl + n` - New article/research
   - `cmd/ctrl + ,` - Open settings
   - `Escape` - Close dialogs/modals

3. Integrate at App level:
   - Add KeyboardShortcutsProvider to App.tsx
   - Register shortcuts based on current page

4. Show shortcut hints in tooltips where applicable

Per U-004 from REQUIREMENTS.md: Support keyboard shortcuts
</action>
  <verify>
    <automated>npm run build 2>&1 | head -30</automated>
  </verify>
  <done>Keyboard shortcuts work for save, new, settings across pages</done>
</task>

<task type="auto">
  <name>Task 4: Theme polish and smooth transitions</name>
  <files>src/hooks/useTheme.ts, src/App.tsx</files>
  <action>
Polish theme transitions for T-413:

1. In useTheme.ts or App.tsx:
   - Add CSS transition for theme changes
   - Prevent flash of wrong theme on initial load

2. Add to global CSS (check if tailwind config has transition):
   - `transition-colors` for background and text
   - `transition-shadow` for cards
   - 150ms duration for smooth feel

3. Verify dark mode covers all components:
   - Cards, dialogs, dropdowns
   - Progress bars and badges
   - Input fields and buttons

Per U-003 from REQUIREMENTS.md: Support dark/light theme switching
</action>
  <verify>
    <automated>grep -r "dark:" src/ 2>/dev/null | wc -l; npm run build 2>&1 | head -10</automated>
  </verify>
  <done>Theme transitions smoothly without flash, dark mode covers all components</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 5: Verify UI/UX polish</name>
  <files>N/A - manual verification required</files>
  <action>
Human verification of UI/UX polish implementation.

Per T-410, T-411, T-413, T-414: Loading states, keyboard shortcuts, theme polish, and empty states must all be verified.
</action>
  <verify>
    <manual>See how-to-verify below</manual>
  </verify>
  <done>All UI/UX features verified</done>
  <what-built>EmptyState components, ProgressBar with percentage, keyboard shortcuts, theme polish</what-built>
  <how-to-verify>
    Test these scenarios:
    1. Go to Research page without data -> should show EmptyState with guide card
    2. Start research -> ProgressBar shows real percentage updating
    3. Press cmd+s anywhere -> should trigger save action
    4. Toggle theme -> should transition smoothly without flash
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
- Theme transitions smoothly
</verification>

<success_criteria>
- All pages with no data show EmptyState guide cards
- Progress operations show real percentage (0-100%)
- Keyboard shortcuts work for save, new, settings
- Theme toggles smoothly without flash
</success_criteria>

<output>
After completion, create `.planning/phases/04-打磨与发布/04-02-SUMMARY.md`
</output>

---

---
phase: 04-打磨与发布
plan: 04-03
type: execute
wave: 2
depends_on: []
files_modified:
  - src-tauri/tauri.conf.json
  - src-tauri/Cargo.toml
  - icons/
  - python-scripts/
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
    - "Python scripts bundled via PyInstaller"
  artifacts:
    - path: "icons/"
      provides: "App icons in all required sizes"
      contains: "32x32.png, 128x128.png, 128x128@2x.png, icon.icns, icon.ico"
    - path: "src-tauri/tauri.conf.json"
      provides: "App metadata configuration"
      contains: "productName, version, identifier"
    - path: "python-scripts/*.spec"
      provides: "PyInstaller spec files"
      contains: "pyinstaller configuration"
  key_links:
    - from: "src-tauri/tauri.conf.json"
      to: "icons/"
      via: "icon path references"
    - from: "src-tauri/Cargo.toml"
      to: "src-tauri/tauri.conf.json"
      via: "version from Cargo.toml"
---

<objective>
Configure application metadata, create app icons, and build the macOS .dmg installer package. Also prepare PyInstaller configuration for Python script packaging.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@src-tauri/tauri.conf.json
@src-tauri/Cargo.toml

From tauri.conf.json (current):
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

Icons already referenced but likely don't exist. Need to create them.

Per D-01: PyInstaller for Python scripts as single executable
</context>
</context>

<tasks>

<task type="checkpoint:decision" gate="blocking">
  <name>Task 0: Confirm icon approach</name>
  <files>N/A - decision task</files>
  <action>
Decision: Choose icon generation method for Phase 4 packaging.

Per T-420: Configure Tauri application icon.
</action>
  <verify>
    <manual>See options below</manual>
  </verify>
  <done>Icon approach selected</done>
  <decision>Choose icon generation method</decision>
  <context>Need to create app icons for macOS (.icns) and Windows (.ico) and PNG sizes. Icons directory is referenced in tauri.conf.json but files may not exist.</context>
  <options>
    <option id="option-a">
      <name>Use placeholder icons (development)</name>
      <pros>Quick to implement, can proceed immediately</pros>
      <cons>Not suitable for production release</cons>
    </option>
    <option id="option-b">
      <name>Create simple SVG and auto-generate icons</name>
      <pros>Programmatic, reproducible</pros>
      <cons>May not look professional</cons>
    </option>
    <option id="option-c">
      <name>Manual icon creation (user provides)</name>
      <pros>Professional quality</pros>
      <cons>Requires user to provide files</cons>
    </option>
  </options>
  <resume-signal>Select: option-a, option-b, or option-c</resume-signal>
</task>

<task type="auto">
  <name>Task 1: Configure app metadata</name>
  <files>src-tauri/tauri.conf.json, src-tauri/Cargo.toml</files>
  <action>
Update app metadata in tauri.conf.json and Cargo.toml:

1. Update tauri.conf.json:
   - productName: "SEO Machine" (already correct)
   - version: "1.0.0" (bump from 0.1.0 for release)
   - identifier: "com.seomachine.app" (already correct)
   - Add app copyright: "Copyright 2026 SEO Machine"
   - Add bundle category for macOS

2. Sync version between Cargo.toml and tauri.conf.json:
   - Both should be "1.0.0"

3. Update Cargo.toml:
   - description: "SEO-optimized content creation tool"
   - authors: ["Your Name"]

Per T-421: Configure app name and version
</action>
  <verify>
    <automated>grep -E '"version"|"productName"' src-tauri/tauri.conf.json</automated>
  </verify>
  <done>App metadata configured with proper name, version, identifier</done>
</task>

<task type="auto">
  <name>Task 2: Create PyInstaller spec for Python scripts</name>
  <files>python-scripts/seomachine.spec</files>
  <action>
Create PyInstaller spec file for bundling Python scripts per D-01:

1. Create `python-scripts/seomachine.spec`:
```python
# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['research_quick_wins.py', ...],
    pathex=[],
    binaries=[],
    datas=[...],  # Include data files if any
    hiddenimports=[
        'json', 'requests', 'anthropic', 'dataforseo_client'
    ],
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
    console=True,  # Set to False for GUI-only
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
```

2. Document how to build:
   - `pyinstaller seomachine.spec`
   - Output in `dist/seomachine`

Per D-01: PyInstaller single file for Python packaging
</action>
  <verify>
    <automated>ls -la python-scripts/*.spec 2>/dev/null || echo "No spec files yet"</automated>
  </verify>
  <done>PyInstaller spec file created for Python script packaging</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Build macOS .dmg package</name>
  <files>N/A - build verification task</files>
  <action>
Human verification of macOS .dmg build.

Per T-422: Package macOS installer (.dmg)
Per T-423: Package Windows installer (.exe) - optional on macOS dev
</action>
  <verify>
    <manual>See how-to-verify below</manual>
  </verify>
  <done>.dmg package verified functional</done>
  <what-built>App metadata configured, Python packaging prepared, icons created</what-built>
  <how-to-verify>
    Steps to build and verify:
    1. Run: `npm run tauri build -- --target universal-apple-darwin`
    2. Check that .dmg was created in src-tauri/target/release/bundle/dmg/
    3. Mount the .dmg and verify app launches
    4. Verify app icon displays correctly
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
- App version is 1.0.0 in both Cargo.toml and tauri.conf.json
- PyInstaller spec file exists
- .dmg package is generated
- App launches from .dmg
</verification>

<success_criteria>
- App icon displays in macOS
- Version shows as 1.0.0 in About dialog
- .dmg installer is generated and functional
- Python scripts can be packaged via PyInstaller
</success_criteria>

<output>
After completion, create `.planning/phases/04-打磨与发布/04-03-SUMMARY.md`
</output>
