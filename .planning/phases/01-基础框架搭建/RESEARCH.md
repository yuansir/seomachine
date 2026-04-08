# Phase 1: 基础框架搭建 - Research

**Researched:** 2026-04-08
**Domain:** Tauri 2.x + React + TypeScript Desktop Application Setup
**Confidence:** MEDIUM

## Summary

Phase 1 establishes the foundational Tauri 2.x desktop application with React 18, TypeScript 5, and shadcn/ui. Key technical decisions include using std::process::Command for Python script execution (not tauri-plugin-shell), SQLite via tauri-plugin-sql for structured data, and tauri-plugin-store for encrypted API key storage. Theme system defaults to light mode with dark mode toggle. Zustand manages global state with persistence middleware.

**Primary recommendation:** Use `npm create tauri-app@latest` with React + TypeScript template, then layer shadcn/ui components via CLI, configure TailwindCSS 4.x with Vite, and integrate Tauri plugins for SQL and store.

---

## User Constraints (from CONTEXT.md)

### Locked Decisions

| Decision | Value | Source |
|----------|-------|--------|
| **D-01:** Python invocation | Direct Rust `std::process::Command` | CONTEXT.md |
| **D-02:** Python output | JSON format | CONTEXT.md |
| **D-03:** API key storage | Backend relay via tauri-plugin-store | CONTEXT.md |
| **D-04:** Editor | @uiw/react-md-editor (Phase 2) | CONTEXT.md |
| **D-05:** Progress feedback | Tauri event system | CONTEXT.md |
| **D-06:** Database | SQLite via tauri-plugin-sql | CONTEXT.md |
| **D-07:** UI components | Full shadcn/ui | CONTEXT.md |
| **D-08:** Theme | Light-first, manual toggle | CONTEXT.md |

### Deferred Ideas (OUT OF SCOPE)

- Automation workflows (Phase 3+)
- Batch processing (Phase 3+)
- Team collaboration (future)
- Cloud sync (future)

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REQ-R-001 | Initialize Tauri 2.x + React + TypeScript project | Tauri CLI initialization, project structure |
| REQ-R-002 | Configure shadcn/ui + TailwindCSS 4.x | shadcn CLI init, TailwindCSS Vite plugin |
| REQ-R-003 | Configure Zustand state management | Zustand persist middleware with tauri-plugin-store |
| REQ-R-004 | Initialize SQLite database | tauri-plugin-sql initialization, schema creation |
| REQ-R-005 | Create basic layout and navigation | App shell structure, sidebar, header, footer |
| REQ-R-006 | Implement light/dark theme toggle | TailwindCSS dark mode, class-based switching |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Tauri** | 2.x (latest) | Desktop framework | Smaller binary (<600KB), Rust backend, native webview |
| **React** | 18.x | UI framework | Largest ecosystem, works with Zustand |
| **TypeScript** | 5.x | Type safety | Compile-time errors, better DX |
| **Vite** | 6.x | Build tool | Fast HMR, optimized builds |
| **pnpm** | 9.x | Package manager | Faster installs, disk efficiency |
| **TailwindCSS** | 4.x | Utility CSS | Tree-shaking, consistent design system |
| **shadcn/ui** | latest | Component library | Accessible, copy-paste (not dependency), Radix-based |
| **Zustand** | 5.x | State management | Minimal boilerplate, TypeScript-first |
| **@tauri-apps/plugin-sql** | 2.4.0 | SQLite database | Zero-config, ACID compliant |
| **@tauri-apps/plugin-store** | 2.4.2 | Encrypted storage | API key security |
| **Lucide React** | latest | Icons | Tree-shakeable, consistent design |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **@tauri-apps/api** | 2.10.1 | Tauri frontend API | Invoking Rust commands, event listening |
| **class-variance-authority** | latest | Component variants | shadcn/ui variant management |
| **clsx** | latest | Conditional classes | Merging Tailwind classes |
| **tailwind-merge** | latest | Class merging | shadcn/ui utility |

**Verified Versions (npm registry, 2026-04-08):**
- tauri: 0.15.0 (CLI)
- @tauri-apps/api: 2.10.1
- @tauri-apps/plugin-sql: 2.4.0
- @tauri-apps/plugin-store: 2.4.2
- zustand: 5.0.12
- tailwindcss: 4.2.2

**Installation:**
```bash
# Create Tauri app with React + TypeScript
npm create tauri-app@latest seomachine -- --template react-ts --manager pnpm

cd seomachine

# Install core dependencies
pnpm install

# Install Tauri plugins
pnpm add @tauri-apps/api @tauri-apps/plugin-sql @tauri-apps/plugin-store

# Install UI dependencies
pnpm add tailwindcss @tailwindcss/vite class-variance-authority clsx tailwind-merge lucide-react

# Install Zustand
pnpm add zustand
```

---

## Architecture Patterns

### Recommended Project Structure

```
seomachine/
├── src/                          # React frontend
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components (copied, not installed)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...
│   │   ├── layout/              # App shell components
│   │   │   ├── AppShell.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   └── features/            # Feature components (placeholder)
│   │       ├── research/
│   │       ├── writing/
│   │       ├── editor/
│   │       ├── analysis/
│   │       └── publish/
│   ├── stores/                   # Zustand stores
│   │   ├── useThemeStore.ts
│   │   ├── useSettingsStore.ts
│   │   └── useAppStore.ts
│   ├── hooks/                   # Custom hooks
│   │   ├── useTheme.ts
│   │   └── useSettings.ts
│   ├── lib/
│   │   ├── utils.ts             # cn() utility, etc.
│   │   └── db.ts                # Database client wrapper
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                # TailwindCSS imports
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs              # Entry point
│   │   ├── lib.rs               # Library root
│   │   ├── commands/            # Tauri commands
│   │   │   ├── mod.rs
│   │   │   ├── python.rs        # Python script invocation
│   │   │   └── db.rs            # Database commands
│   │   └── db.rs                # Database initialization
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── icons/
├── python-scripts/               # Python scripts (from source project)
│   ├── research_quick_wins.py
│   ├── research_priorities_comprehensive.py
│   └── ...
└── package.json
```

### Pattern 1: Tauri Command Registration

**What:** Rust functions decorated with `#[tauri::command]` exposed to frontend
**When to use:** Any Rust functionality called from React

```rust
// src-tauri/src/commands/python.rs
use tauri::AppHandle;
use std::process::Command;
use std::io::Read;

#[tauri::command]
pub async fn run_python_script(
    app: AppHandle,
    script: String,
    args: Vec<String>,
) -> Result<String, String> {
    // Get resource path for bundled scripts
    let resource_path = app.path().resource_dir()
        .map_err(|e| e.to_string())?;
    let script_path = resource_path.join("python-scripts").join(&script);

    let output = Command::new("python3")
        .arg(script_path.to_str().unwrap_or(&script))
        .args(&args)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        String::from_utf8(output.stdout).map_err(|e| e.to_string())
    } else {
        Err(String::from_utf8(output.stderr).unwrap_or_default())
    }
}
```

**Module registration in lib.rs:**
```rust
// src-tauri/src/lib.rs
mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            commands::python::run_python_script,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Pattern 2: Event-Driven Progress Updates

**What:** Tauri event system for long-running operation feedback
**When to use:** Python scripts, article generation, research operations

```rust
// Rust: Emit progress event
#[tauri::command]
async fn run_research_script(app: AppHandle, topic: String) -> Result<String, String> {
    // Emit start event
    app.emit("progress", serde_json::json!({
        "stage": "starting",
        "message": "Starting research..."
    })).map_err(|e| e.to_string())?;

    // Run script with progress emissions
    let output = Command::new("python3")
        .arg(format!("python-scripts/research_quick_wins.py"))
        .arg(&topic)
        .output()
        .map_err(|e| e.to_string())?;

    // Emit completion event
    app.emit("progress", serde_json::json!({
        "stage": "complete",
        "message": "Research complete"
    })).map_err(|e| e.to_string())?;

    String::from_utf8(output.stdout).map_err(|e| e.to_string())
}
```

```typescript
// React: Listen for progress events
import { listen } from "@tauri-apps/api/event";

useEffect(() => {
    const unlisten = listen<{ stage: string; message: string }>("progress", (event) => {
        setProgress(event.payload);
    });

    return () => { unlisten.then(fn => fn()); };
}, []);
```

### Pattern 3: Zustand Store with Persistence

**What:** Global state persisted via tauri-plugin-store
**When to use:** Settings, theme preference, API key references

```typescript
// src/stores/useThemeStore.ts
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
        }
    )
);
```

### Pattern 4: shadcn/ui Theme Integration

**What:** TailwindCSS 4.x dark mode with class-based switching
**When to use:** Theme toggle implementation

```typescript
// src/hooks/useTheme.ts
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

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark mode toggle | Custom CSS class switching | TailwindCSS `dark:` classes + `class` strategy | Built-in, handles all components |
| API key storage | localStorage or sessionStorage | tauri-plugin-store | Encrypted at rest, OS keychain integration |
| Database queries | Raw SQL string building | tauri-plugin-sql with prepared statements | SQL injection prevention |
| Component variants | Multiple conditional className | class-variance-authority (CVA) | Centralized variant logic used by shadcn |
| Class merging | Template literal concatenation | clsx + tailwind-merge via `cn()` | Handles edge cases, deduplication |

---

## Common Pitfalls

### Pitfall 1: TailwindCSS 4.x Vite Plugin Misconfiguration

**What goes wrong:** Dark mode classes don't apply, styles bleed between components
**Why it happens:** TailwindCSS 4.x uses `@tailwindcss/vite` plugin, not PostCSS
**How to avoid:**
```typescript
// vite.config.ts (TailwindCSS 4.x correct setup)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
});
```

**Warning signs:** Styles not updating on hot reload, `dark:` classes ignored

### Pitfall 2: tauri-plugin-store Encryption Key Not Set

**What goes wrong:** Sensitive data stored without encryption
**Why it happens:** Plugin requires explicit encryption configuration
**How to avoid:**
```rust
// In tauri.conf.json
{
    "plugins": {
        "store": {}
    }
}
```
For encryption, Tauri 2.x uses OS keychain by default on macOS/Windows. On Linux, it falls back to `kwallet` or `libsecret`.

**Warning signs:** Store files readable as plain JSON, security audit warnings

### Pitfall 3: Database Path Resolution

**What goes wrong:** Database created in wrong location, not persisted
**Why it happens:** Using relative paths without proper resource directory resolution
**How to avoid:**
```rust
// Always resolve database path via Tauri path API
let db_path = app.path().app_data_dir()
    .map_err(|e| e.to_string())?
    .join("seomachine.db");
```

**Warning signs:** Database resets on app restart, data loss

### Pitfall 4: Python Script Path Issues

**What goes wrong:** Scripts fail to execute, file not found errors
**Why it happens:** Hardcoded paths, working directory issues, resource bundling not configured
**How to avoid:**
```json
// tauri.conf.json - bundle scripts as resources
{
    "bundle": {
        "resources": {
            "python-scripts/*": "python-scripts/"
        }
    }
}
```

**Warning signs:** `python3: can't open file` errors in logs

### Pitfall 5: Zustand Persist Without Hydration Check

**What goes wrong:** Flash of incorrect theme on initial load
**Why it happens:** SSR-style hydration mismatch between stored and rendered state
**How to avoid:**
```typescript
// Check if persist has hydrated before rendering
const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: "light",
            setTheme: (theme) => set({ theme }),
        }),
        {
            name: "theme-storage",
            onRehydrateStorage: () => (state) => {
                // Sync theme to DOM after rehydration
                document.documentElement.classList.add(state?.theme || "light");
            }
        }
    )
);
```

**Warning signs:** Flicker on page load, theme briefly wrong

---

## Code Examples

### Database Initialization (SQLite)

```rust
// src-tauri/src/db.rs
use tauri_plugin_sql::{Migration, MigrationKind};

pub fn get_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: r#"
                CREATE TABLE IF NOT EXISTS articles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    meta_title TEXT,
                    meta_description TEXT,
                    primary_keyword TEXT,
                    status TEXT DEFAULT 'draft',
                    research_id INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    published_at DATETIME,
                    wordpress_url TEXT,
                    FOREIGN KEY (research_id) REFERENCES researches(id)
                );

                CREATE TABLE IF NOT EXISTS researches (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    topic TEXT NOT NULL,
                    research_type TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS publish_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    article_id INTEGER NOT NULL,
                    wordpress_url TEXT,
                    status TEXT,
                    error_message TEXT,
                    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (article_id) REFERENCES articles(id)
                );
            "#,
            kind: MigrationKind::Up,
        },
    ]
}
```

```rust
// Registration in lib.rs
use tauri_plugin_sql::{Builder as SqlBuilder, Migration};

plugin(
    SqlBuilder::default()
        .add_migrations("sqlite:seomachine.db", get_migrations())
        .build()
)
```

### Settings Store (Zustand + tauri-plugin-store)

```typescript
// src/stores/useSettingsStore.ts
import { create } from "zustand";
import { Store } from "@tauri-apps/plugin-store";

interface SettingsState {
    claudeApiKey: string | null;
    dataforseoApiKey: string | null;
    wordpressUrl: string | null;
    wordpressUsername: string | null;
    wordpressAppPassword: string | null;
    setApiKey: (provider: "claude" | "dataforseo", key: string) => void;
    setWordPress: (url: string, username: string, password: string) => void;
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

    setApiKey: async (provider, key) => {
        const s = await getStore();
        if (provider === "claude") {
            await s.set("claudeApiKey", key);
            set({ claudeApiKey: key });
        } else {
            await s.set("dataforseoApiKey", key);
            set({ dataforseoApiKey: key });
        }
    },

    setWordPress: async (url, username, password) => {
        const s = await getStore();
        await s.set("wordpressUrl", url);
        await s.set("wordpressUsername", username);
        await s.set("wordpressAppPassword", password);
        set({ wordpressUrl: url, wordpressUsername: username, wordpressAppPassword: password });
    },

    loadSettings: async () => {
        const s = await getStore();
        const claudeApiKey = await s.get<string>("claudeApiKey");
        const dataforseoApiKey = await s.get<string>("dataforseoApiKey");
        const wordpressUrl = await s.get<string>("wordpressUrl");
        const wordpressUsername = await s.get<string>("wordpressUsername");
        const wordpressAppPassword = await s.get<string>("wordpressAppPassword");
        set({ claudeApiKey, dataforseoApiKey, wordpressUrl, wordpressUsername, wordpressAppPassword });
    },
}));
```

### Rust Command for Settings Access (Backend Relay Pattern)

```rust
// src-tauri/src/commands/settings.rs
use tauri_plugin_store::StoreExt;

#[tauri::command]
pub async fn get_api_key(app: tauri::AppHandle, provider: String) -> Result<String, String> {
    let store = app.store("settings.json").map_err(|e| e.to_string())?;
    let key = match provider.as_str() {
        "claude" => store.get("claudeApiKey"),
        "dataforseo" => store.get("dataforseoApiKey"),
        _ => None,
    };
    key.and_then(|k| k.as_str().map(String::from))
        .ok_or_else(|| "Key not found".to_string())
}

#[tauri::command]
pub async fn set_api_key(app: tauri::AppHandle, provider: String, value: String) -> Result<(), String> {
    let store = app.store("settings.json").map_err(|e| e.to_string())?;
    let key_name = match provider.as_str() {
        "claude" => "claudeApiKey",
        "dataforseo" => "dataforseoApiKey",
        _ => return Err("Invalid provider".to_string()),
    };
    store.set(key_name, serde_json::json!(value));
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Electron | Tauri 2.x | 2024 | ~150MB -> ~600KB binary, Rust backend |
| CSS modules | TailwindCSS utility classes | 2020+ | Faster development, consistent design |
| Redux | Zustand | 2022+ | 90% less boilerplate |
| component libraries (MUI) | shadcn/ui copy-paste | 2023+ | No bundle bloat, full customization |
| localStorage | tauri-plugin-store | 2023+ | Encrypted storage, OS keychain |
| Raw SQL | tauri-plugin-sql | 2023+ | Type-safe queries, migrations |

**Deprecated/outdated:**
- `tailwind.config.js` (TailwindCSS 4.x uses CSS-based config)
- `tauri-plugin-shell` for Python (CONTEXT.md decision: use std::process::Command)

---

## Open Questions

1. **Python environment detection**
   - What we know: Python 3.10+ required, scripts invoked via `python3`
   - What's unclear: How to handle systems without Python, fallback messaging
   - Recommendation: Check Python availability on startup, show setup wizard if missing

2. **Resource path for bundled scripts**
   - What we know: Scripts should be in `resources/python-scripts/`
   - What's unclear: Whether `app.path().resource_dir()` works consistently across platforms
   - Recommendation: Test on macOS, Windows, Linux before Phase 2

3. **Store encryption details**
   - What we know: tauri-plugin-store provides encryption
   - What's unclear: Exact encryption mechanism per OS, keychain integration specifics
   - Recommendation: Verify API key storage passes security audit in Phase 4

---

## Environment Availability

> Step 2.6: SKIPPED (no external dependencies identified beyond those bundled with Tauri)

Phase 1 is a project scaffolding phase with no external tool dependencies. All required tools are installed via npm/pnpm and Cargo.

**Required tools (assumed available on developer machine):**
- Node.js 18.x+ (for pnpm)
- Rust 1.70+ (for Tauri)
- pnpm 9.x (package manager)

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test:unit` |
| Full suite command | `pnpm test` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REQ-R-001 | Tauri app initializes without errors | smoke | `pnpm tauri dev` (manual check) | N/A |
| REQ-R-002 | shadcn/ui components render | unit | `pnpm test:unit tests/components.test.ts` | Wave 0 |
| REQ-R-003 | Zustand stores persist and hydrate | unit | `pnpm test:unit tests/stores.test.ts` | Wave 0 |
| REQ-R-004 | Database migrations run on first launch | integration | `pnpm test:unit tests/db.test.ts` | Wave 0 |
| REQ-R-005 | Navigation switches content area | smoke | Manual verification | N/A |
| REQ-R-006 | Theme toggle updates all components | unit | `pnpm test:unit tests/theme.test.ts` | Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm test:unit --run`
- **Per wave merge:** `pnpm test`
- **Phase gate:** All tests green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/components.test.ts` - Tests for shadcn/ui components rendering
- [ ] `tests/stores.test.ts` - Tests for Zustand store persistence
- [ ] `tests/db.test.ts` - Tests for database initialization and migrations
- [ ] `tests/theme.test.ts` - Tests for theme switching
- [ ] `vitest.config.ts` - Vitest configuration
- [ ] Framework install: `pnpm add -D vitest @testing-library/react jsdom`

---

## Sources

### Primary (HIGH confidence)

- Project CLAUDE.md - SEO Machine technology stack specification
- `.planning/research/tauri-python-integration.md` - Verified Python integration patterns
- `.planning/research/ui-components.md` - Verified UI component selection
- npm registry versions (2026-04-08) - Package version verification

### Secondary (MEDIUM confidence)

- Tauri 2.x official documentation patterns (based on existing research files)
- shadcn/ui official docs (based on existing knowledge)
- Zustand persist middleware patterns (based on library documentation)

### Tertiary (LOW confidence - marked for validation)

- TailwindCSS 4.x Vite plugin configuration (new version, limited production reports)
- tauri-plugin-sql migration patterns (based on library structure)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Based on verified project CLAUDE.md and existing research
- Architecture: MEDIUM - Patterns verified but Tauri 2.x specifics need testing
- Pitfalls: MEDIUM - Common patterns identified but some are assumptions

**Research date:** 2026-04-08
**Valid until:** 2026-05-08 (30 days for stable phase)
