<!-- GSD:project-start source:PROJECT.md -->
## Project

**SEO Machine — Tauri 桌面客户端**
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Tauri** | 2.x (latest stable) | Desktop framework | Smaller binary size (<600KB vs Electron's ~150MB), Rust backend for performance, native security audit, uses system webview |
| **React** | 18.x | UI framework | Largest ecosystem for React, works with any React-compatible state management |
| **TypeScript** | 5.x | Type safety | Catches errors at compile time, better DX with autocomplete |
| **Vite** | 6.x | Build tool | Fast HMR, optimized builds, native ESM |
| **pnpm** | 9.x | Package manager | Faster installs, better disk space efficiency, strict mode |
### UI Layer
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **TailwindCSS** | 4.x | Utility CSS | Rapid UI development, tree-shakes unused styles, consistent design system |
| **shadcn/ui** | latest | Component library | Accessible components built on Radix, copy-paste (not a dependency), customizable |
| **Radix UI** | latest | Headless components | Unstyled, accessible primitives that shadcn/ui builds upon |
| **Lucide React** | latest | Icons | Tree-shakeable, consistent design, MIT license |
### State Management
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Zustand** | 5.x | Global state | Minimal boilerplate, TypeScript-first, works with persist middleware |
| **@tauri-apps/plugin-store** | 2.x | Persistent settings | Simple key-value storage for user preferences |
### Local Storage
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **@tauri-apps/plugin-sql** | 2.x | SQLite database | Structured data storage (articles, projects, keywords), migrations support |
| **SQLite** | via plugin | Database engine | Zero-config, single-file, ACID compliant, sufficient for desktop use |
### API Integration
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Native fetch** | built-in | HTTP requests | GA4, GSC, DataForSEO API calls |
| **Claude SDK** | @anthropic-ai/sdk | AI API client | Official SDK, handles retries, streaming support |
### Python Integration (for SEO scripts)
| Technology | Purpose | Why |
|------------|---------|-----|
| **Rust subprocess** | Call Python from Tauri | Tauri commands invoke Python scripts via std::process::Command |
| **Python 3.10+** | Script runtime | NLTK, TextStat, DataForSEO client libraries |
## Project Structure
## Installation
### Frontend Dependencies
# Create Tauri app with React + TypeScript
# Install core dependencies
# Install shadcn/ui
# Install Tauri plugins
# Install AI SDK
### Rust Dependencies (src-tauri/Cargo.toml)
## Alternatives Considered
### UI Framework Alternatives
| Alternative | Why NOT Recommended |
|-------------|---------------------|
| **Next.js** | Overkill for desktop app, SSR not needed, adds complexity |
| **SolidJS** | Smaller ecosystem, fewer UI component libraries |
| **Vue** | Good option but React has larger SEO/content-tooling ecosystem |
| **Svelte** | Good option but React has more state management choices |
| **Raw Radix UI** | Too low-level, shadcn/ui provides better defaults and copy-paste model |
| **Material UI** | Heavy bundle size, over-designed, not easily customizable |
| **Chakra UI** | Maintenance concerns, better alternatives exist |
### State Management Alternatives
| Alternative | Why NOT Recommended |
|-------------|---------------------|
| **Jotai** | Atomic model adds complexity for this use case |
| **Redux Toolkit** | Too much boilerplate for desktop app complexity |
| **MobX** | Over-engineered for this use case |
| **React Context** | Can work but Zustand is cleaner for multiple stores |
### Python Integration Alternatives
| Alternative | Why NOT Recommended |
|-------------|---------------------|
| **PyO3 (Rust Python bindings)** | Complex setup, overkill since Python scripts are standalone |
| **Embedded Python in Rust** | Version conflicts, deployment complexity |
| **Rewrite Python in Rust** | Time-consuming, Python scripts already exist and work |
| **Node.js native modules** | Not applicable for Python SEO libraries |
## Python Script Strategy
### Decision: Keep Python Scripts, Invoke via Rust Commands
### Implementation Pattern
#[tauri::command]
### Frontend Invocation
### Script Location
- Keep Python scripts in `python-scripts/` directory at project root
- Bundle scripts with Tauri app using `resources` in tauri.conf.json
- Scripts run from app's resource path, not hardcoded paths
## Version Compatibility Matrix
| Component | Minimum | Recommended | Notes |
|-----------|---------|-------------|-------|
| Node.js | 18.x | 22.x LTS | For development |
| Rust | 1.70+ | 1.85+ | Tauri 2.x requirement |
| pnpm | 8.x | 9.x | Corepack recommended |
| Tauri CLI | 2.x | latest | Via npm |
| iOS/macOS | 11.0 | 13+ | For mobile builds |
## Build Commands
# Development
# Production build
# Cross-platform (requires toolchains)
## Sources
- [Tauri 2.x Official Docs](https://v2.tauri.app/start/)
- [Tauri SQL Plugin](https://v2.tauri.app/plugin/sql/)
- [Tauri Shell Plugin](https://v2.tauri.app/plugin/shell/)
- [Calling Rust from Frontend](https://v2.tauri.app/develop/calling-rust/)
- [React 18](https://react.dev/blog/2022/03/29/react-18)
- [TailwindCSS 4.x](https://tailwindcss.com/blog/tailwindcss-v4)
- [shadcn/ui](https://ui.shadcn.com/)
- [Zustand](https://zustand.docs.pmnd.rs/)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
