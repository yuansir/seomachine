# Phase 4: 打磨与发布 - Research

**Researched:** 2026-04-08
**Domain:** Tauri 2.x + React error handling, PyInstaller bundling, macOS packaging, keyboard shortcuts, theme transitions
**Confidence:** MEDIUM (based on training knowledge; external docs inaccessible due to network restrictions)

## Summary

Phase 4 focuses on error handling, UI/UX polish, and packaging for the SEO Machine Tauri desktop app. The project already has a solid foundation: sonner for toasts, base-ui/progress for progress bars, and next-themes for theming. Key remaining work includes: implementing comprehensive error boundaries, adding retry logic for network failures, packaging Python scripts with PyInstaller, configuring proper macOS .dmg builds, adding keyboard shortcuts, and preventing theme flash on load.

**Primary recommendations:**
1. Extend existing sonner toast pattern to all API calls and Tauri commands
2. Use `tauri-plugin-shell` for PyInstaller-executed Python to avoid requiring system Python
3. Add inline theme script in index.html to prevent flash
4. Create a centralized error boundary component
5. Use Tauri 2.x bundler with proper icon configuration

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** PyInstaller 单文件 — Python 脚本打包成独立可执行文件
- **D-02:** Toast 通知 — 使用 sonner 展示错误
- **D-03:** Progress Bar + 百分比 — 使用 base-ui/progress 组件
- **D-04:** 引导提示卡片 — 适用于空状态引导

### Claude's Discretion
- Progress Bar 颜色和动画细节
- Toast 显示时长和位置
- 引导卡片文案内容

### Deferred Ideas (OUT OF SCOPE)
- None specified for Phase 4

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| T-401 | 实现所有 API 错误的优雅处理 | sonner already integrated; extend pattern |
| T-402 | 网络断开时的缓存和重试 | Need offline detection + retry queue |
| T-403 | 脚本执行失败的处理和提示 | Enhance run_python_script error handling |
| T-404 | 测试所有边界情况 | Need comprehensive error test suite |
| T-410 | 完善加载状态和进度指示器 | base-ui/progress already exists |
| T-411 | 添加键盘快捷键支持 | Not yet implemented; need hotkeys library |
| T-412 | 优化大量数据时列表性能 | Need virtualization for 1000+ articles |
| T-413 | 完善深色/浅色主题细节 | Theme flash prevention needed |
| T-414 | 空状态和引导提示卡片 | Design guide provided |
| T-420 | 配置应用图标 | Need icons/ directory |
| T-421 | 配置应用名称和版本 | tauri.conf.json needs update |
| T-422 | 打包 macOS 安装包 | Tauri bundler .dmg target |
| T-423 | 打包 Windows 安装包 | Tauri bundler .msi/.exe target |
| T-424 | 创建用户使用文档 | Markdown docs in project |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tauri | 2.x | Desktop framework | Already in use |
| React | 19.x | UI framework | Already in use |
| sonner | 2.0.x | Toast notifications | Already installed |
| base-ui/react | 1.3.x | Progress component | Already installed |

### Error Handling
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-query | 5.x | API caching/retry | API calls with offline support |
| sonner | 2.0.x | Toast notifications | All error/success feedback |
| react-error-boundary | 4.x | Error boundaries | Catch render errors |

### Keyboard Shortcuts
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tauri-apps/plugin-global-shortcut | 2.x | Global hotkeys | App-wide shortcuts |
| react-hotkeys-hook | 4.x | Component shortcuts | Page-specific shortcuts |

### Virtualization
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-virtual | 3.x | List virtualization | 100+ items in lists |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| base-ui/progress | shadcn/ui Progress | Project already uses base-ui |
| react-hotkeys-hook | useKeyboard | More popular, same functionality |
| @tanstack/react-query | SWR | Query is more feature-rich for caching |

**Installation:**
```bash
pnpm add sonner @tanstack/react-query react-error-boundary @tanstack/react-virtual
pnpm add @tauri-apps/plugin-global-shortcut
```

**Version verification:**
```bash
npm view sonner version      # 2.0.7 (installed)
npm view @tanstack/react-query version  # 5.x
npm view react-error-boundary version   # 4.x
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── ui/                 # Existing UI components
│   ├── features/           # Feature components
│   └── layout/            # AppShell, Sidebar, etc.
├── hooks/
│   ├── useTheme.ts        # Existing - needs flash prevention
│   ├── useKeyboardShortcuts.ts  # NEW - global shortcuts
│   └── useOnlineStatus.ts      # NEW - network detection
├── lib/
│   ├── python.ts          # Existing
│   ├── api.ts             # NEW - centralized API with retry
│   └── errors.ts          # NEW - error handling utilities
├── error-boundary/        # NEW
│   └── GlobalErrorBoundary.tsx
└── pages/                 # Existing pages
```

### Pattern 1: Toast Error Handling Pattern
**What:** Consistent error handling using sonner toasts
**When to use:** All async operations (API calls, Tauri commands)
**Example:**
```typescript
// Source: Based on SettingsPanel.tsx existing pattern
import { toast } from "sonner";

// Simple error handling
try {
  await saveArticle();
  toast.success("文章已保存");
} catch (error) {
  toast.error(`保存失败: ${error}`);
}

// With promise (loading state)
toast.promise(
  invoke<string>("run_python_script", { script, args }),
  {
    loading: "正在研究...",
    success: (data) => "研究完成",
    error: (err) => `研究失败: ${err}`,
  }
);
```

### Pattern 2: Error Boundary Component
**What:** Catch React render errors and display fallback UI
**When to use:** Wrap page components to prevent full app crashes
**Example:**
```typescript
// Source: react-error-boundary documentation
import { ErrorBoundary } from "react-error-boundary";

function Fallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-4 border border-red-300 rounded-lg">
      <h3 className="font-semibold">出错了</h3>
      <p className="text-sm text-red-600">{error.message}</p>
      <Button onClick={resetErrorBoundary}>重试</Button>
    </div>
  );
}

// Wrap page
<ErrorBoundary FallbackComponent={Fallback} onReset={() => setState({})}>
  <ResearchPage />
</ErrorBoundary>
```

### Pattern 3: Network Status + Retry Queue
**What:** Detect offline state and queue failed requests
**When to use:** API calls that may fail due to network issues
**Example:**
```typescript
// Source: @tanstack/react-query offline support
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOnlineStatus } from "./hooks/useOnlineStatus";

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

// Mutation with retry
const mutation = useMutation({
  mutationFn: publishArticle,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

### Pattern 4: Theme Flash Prevention
**What:** Inline script in HTML to set theme before React loads
**When to use:** Prevent flash of wrong theme on app start
**Example:**
```html
<!-- Source: next-themes recommended approach -->
<!doctype html>
<html lang="en">
  <head>
    <script>
      // Immediately apply theme to prevent flash
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
    <title>SEO Machine</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Pattern 5: Keyboard Shortcuts
**What:** Global and page-specific keyboard shortcuts
**When to use:** Navigation, common actions (save, search)
**Example:**
```typescript
// Source: @tauri-apps/plugin-global-shortcut
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";

// Global shortcuts (work even when app not focused)
await register("CommandOrControl+S", (event) => {
  if (event.state === "Pressed") {
    handleSave();
  }
});

// Component-level shortcuts (react-hotkeys-hook)
import { useHotkeys } from "react-hotkeys-hook";

function EditorPage() {
  useHotkeys("ctrl+s", (e) => {
    e.preventDefault();
    handleSave();
  });

  useHotkeys("ctrl+shift+p", () => {
    handlePublish();
  });
}
```

### Anti-Patterns to Avoid
- **Don't swallow errors:** Never catch errors without showing user feedback
- **Don't use window.alert():** Always use sonner toasts instead
- **Don't block UI during loading:** Use non-blocking async patterns
- **Don't assume network is available:** Always check navigator.onLine first

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toast notifications | Custom notification component | sonner | Already installed, accessible, mobile-friendly |
| List virtualization | Custom windowing | @tanstack/react-virtual | Handles edge cases, accessible |
| Offline detection | Manual network check polling | navigator.onLine + event listeners | Built into browser |
| API retry logic | Custom exponential backoff | @tanstack/react-query | Handles all edge cases |
| Error boundaries | try/catch in every component | react-error-boundary | Proper error propagation |

**Key insight:** The project already has the core pieces (sonner, progress bar). Phase 4 is about extending and connecting these pieces properly.

## Common Pitfalls

### Pitfall 1: Theme Flash on Load
**What goes wrong:** App briefly shows wrong theme before React hydrates
**Why it happens:** Theme stored in Zustand/persist, applied in useEffect after mount
**How to avoid:** Add inline `<script>` in index.html that reads localStorage before React loads
**Warning signs:** Flicker when refreshing page in dark mode

### Pitfall 2: Python Not Found in Production
**What goes wrong:** `python3` command fails in packaged app
**Why it happens:** User's system may not have Python installed
**How to avoid:** Use PyInstaller to bundle Python runtime with scripts
**Warning signs:** "python3: command not found" in packaged app logs

### Pitfall 3: Toast Inside Error Boundary
**What goes wrong:** Toasts don't render inside error boundary fallback
**Why it happens:** Error boundary catches render errors, toast may not mount
**How to avoid:** Use global error handler that calls toast directly, or render toasts outside boundary
**Warning signs:** Errors show blank screen instead of toast + fallback

### Pitfall 4: Memory Leaks with Event Listeners
**What goes wrong:** Progress listeners not cleaned up properly
**Why it happens:** unlisten() not called in all code paths
**How to avoid:** Always use try/finally or useCleanup hook for listeners
**Warning signs:** Warning about event listeners not removed in console

### Pitfall 5: Blocking Progress Updates
**What goes wrong:** Progress bar freezes during long Python scripts
**Why it happens:** Python script runs synchronously, only emits on complete
**How to avoid:** Stream output from Python, emit progress events incrementally
**Warning signs:** Progress jumps from 10% to 90% with no intermediate states

## Code Examples

Verified patterns from existing codebase and official sources:

### Error Handling with sonner (Existing Pattern - SettingsPanel.tsx)
```typescript
// Source: SettingsPanel.tsx lines 51-91
const handleSaveApiKeys = async () => {
  try {
    if (claudeKeyInput) {
      await setApiKey("claude", claudeKeyInput);
    }
    if (dataforseoKeyInput) {
      await setApiKey("dataforseo", dataforseoKeyInput);
    }
    toast.success("API 密钥已保存");
  } catch (error) {
    toast.error("保存失败");
  }
};

const handleTestConnection = async () => {
  try {
    toast.promise(
      invoke<boolean>("test_wordpress_connection"),
      {
        loading: "正在测试连接...",
        success: () => "连接成功",
        error: (err) => `连接失败: ${err}`,
      }
    );
  } catch (error) {
    toast.error("连接失败");
  }
};
```

### Progress Bar with Percentage (Existing - WritePage.tsx)
```typescript
// Source: WritePage.tsx lines 42-50, 207
const [progress, setProgress] = useState(0);

// During generation
for (let i = 0; i <= 100; i += 10) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  setProgress(i);
}

// In JSX
<Progress value={progress} className="mt-2" />
<span>{progress}%</span>
```

### Python Script Invocation with Progress (Existing - python.ts)
```typescript
// Source: python.ts lines 16-50
export async function runResearch(
  type: ResearchType,
  keywords: string[]
): Promise<ResearchResult> {
  const unlisten = await listen<ProgressPayload>("research-progress", (event) => {
    console.log(`Progress: ${event.payload.progress}% - ${event.payload.message}`);
  });

  try {
    const result = await invoke<string>("run_python_script", {
      script,
      args,
    });
    return JSON.parse(result);
  } finally {
    unlisten();
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom error handling | sonner + ErrorBoundary | Now | Consistent UX |
| System Python required | PyInstaller bundle | Decision D-01 | User-friendly deployment |
| CSS-only theming | next-themes + Zustand | Phase 1 | System preference support |
| No progress indication | base-ui/progress + events | Phase 2 | Better UX during long ops |

**Deprecated/outdated:**
- None in scope for Phase 4

## Open Questions

1. **PyInstaller Output Location**
   - What we know: User wants PyInstaller single file output
   - What's unclear: Where should the .exe be placed in Tauri resources?
   - Recommendation: Create `bin/` directory in project root, build Python scripts to `bin/`, reference in tauri.conf.json resources

2. **Global Shortcut Conflict Detection**
   - What we know: Need to register shortcuts for save (Ctrl+S), publish (Ctrl+Shift+P)
   - What's unclear: How to handle conflicts with OS or other apps' shortcuts
   - Recommendation: Use Tauri global-shortcut with error handling, fallback to component-level only

3. **Offline Data Persistence**
   - What we know: Need to cache research results when offline
   - What's unclear: What to cache and for how long?
   - Recommendation: Use @tanstack/react-query with persisted cache, clear after 7 days

4. **Progress Bar Color**
   - What we know: User specified "Progress Bar + 百分比"
   - What's unclear: Color scheme (brand color? success gradient?)
   - Recommendation: Use primary color from TailwindCSS theme, animate with CSS transitions

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Frontend build | Check system | 22.x | — |
| Rust | Tauri build | Check system | 1.85+ | — |
| Python 3 | Script dev/testing | System | 3.10+ | PyInstaller bundle |
| pnpm | Package manager | System | 9.x | npm |

**Missing dependencies with no fallback:**
- None identified

**Missing dependencies with fallback:**
- Python runtime: PyInstaller bundle in production (Python only needed for dev testing)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest |
| Config file | `vitest.config.ts` (check if exists) |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test:run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| T-401 | API errors show toast | Unit | `vitest run src/lib/api.test.ts` | No - create |
| T-402 | Offline queues request | Unit | `vitest run src/hooks/useOnlineStatus.test.ts` | No - create |
| T-403 | Python failure shows error | Integration | `vitest run src/lib/python.test.ts` | Partial |
| T-410 | Progress updates work | Unit | `vitest run src/components/ui/progress.test.tsx` | No |
| T-411 | Shortcuts trigger actions | Unit | `vitest run src/hooks/useKeyboardShortcuts.test.ts` | No |
| T-412 | 1000 items renders smoothly | Performance | Manual test with DevTools | — |
| T-413 | No theme flash on load | E2E | `pnpm test:e2e theme-flash` | No |
| T-414 | Empty states show guide cards | Unit | `vitest run src/components/features/empty-state.test.tsx` | No |

### Sampling Rate
- **Per task commit:** `pnpm test --run` for affected files
- **Per wave merge:** `pnpm test:run` full suite
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/api.ts` — centralized API with retry logic (T-401, T-402)
- [ ] `src/hooks/useOnlineStatus.ts` — network detection (T-402)
- [ ] `src/error-boundary/GlobalErrorBoundary.tsx` — error boundary component (T-401)
- [ ] `src/hooks/useKeyboardShortcuts.ts` — keyboard shortcut hook (T-411)
- [ ] `src/components/features/empty-state/EmptyStateCard.tsx` — guidance cards (T-414)
- [ ] `tests/` — test directory with test files
- [ ] Framework install: Vitest already in project? Check package.json

*(If no gaps: "None — existing test infrastructure covers all phase requirements")*

## Sources

### Primary (HIGH confidence - existing code)
- SettingsPanel.tsx - sonner toast patterns
- python.ts - Tauri invoke + event listener patterns
- WritePage.tsx - progress bar usage
- ResearchPage.tsx - error handling patterns

### Secondary (MEDIUM confidence - training knowledge)
- Tauri 2.x global-shortcut plugin API
- next-themes theme flash prevention
- @tanstack/react-query offline/caching

### Tertiary (LOW confidence - needs verification)
- PyInstaller bundling with Tauri resource paths
- macOS .dmg signing requirements
- Windows .exe installer configuration

## Metadata

**Confidence breakdown:**
- Error handling patterns: HIGH - verified by existing code
- Progress bar integration: HIGH - existing implementation
- Keyboard shortcuts: MEDIUM - based on training, need verification
- Theme flash prevention: MEDIUM - known pattern but not implemented
- PyInstaller bundling: MEDIUM - decision made but implementation needs research
- macOS packaging: LOW - needs verification of Tauri 2.x bundler

**Research date:** 2026-04-08
**Valid until:** 2026-05-08 (30 days for stable topics)

---

## Research Complete

**Phase:** 04 - 打磨与发布
**Confidence:** MEDIUM

### Key Findings
1. **Error handling foundation exists**: sonner is installed and used correctly in SettingsPanel. Need to extend pattern to all async operations.
2. **Progress infrastructure exists**: base-ui/progress is already set up with percentage support. Need to connect to Python script events properly.
3. **Python packaging decision is D-01**: PyInstaller single file - needs implementation research in planning phase.
4. **Theme flash prevention needed**: next-themes requires inline script in HTML to prevent flash.
5. **Keyboard shortcuts not implemented**: Need both @tauri-apps/plugin-global-shortcut and react-hotkeys-hook.
6. **Packaging config needs work**: tauri.conf.json has basic config but icons are missing.

### File Created
`.planning/phases/04-打磨与发布/04-RESEARCH.md`

### Open Questions for Planner
1. PyInstaller bundle path and resource configuration
2. Whether to use @tanstack/react-query or simpler retry logic
3. Keyboard shortcut conflict resolution strategy

### Ready for Planning
Research complete. Planner can now create PLAN.md files for:
- 04-01-PLAN.md - Error handling and retry logic
- 04-02-PLAN.md - UI/UX polish (loading states, empty states, keyboard shortcuts)
- 04-03-PLAN.md - Packaging (app icon, metadata, .dmg build)
