<div align="center">

# SEO Machine

**AI 驱动的 SEO 内容创作桌面应用**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-green.svg)](https://github.com/yuansir/seomachine/releases)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows-lightgrey.svg)](#installation)
[![Built with Tauri](https://img.shields.io/badge/built%20with-Tauri-24C8D8.svg)](https://tauri.app)

关键词研究 · AI 辅助写作 · SEO 分析 · WordPress 一键发布

[下载](https://github.com/yuansir/seomachine/releases) · [报告 Bug](https://github.com/yuansir/seomachine/issues/new?template=bug_report.yml) · [功能请求](https://github.com/yuansir/seomachine/issues/new?template=feature_request.yml)

</div>

---

## ✨ 功能特性

| 功能 | 描述 |
|------|------|
| **🔍 关键词研究** | 通过 DataForSEO 获取搜索量、竞争度、趋势数据 |
| **🕵️ 竞品分析** | 发现竞争对手排名但你尚未覆盖的内容缺口 |
| **📊 SERP 分析** | 深度解析搜索结果页，理解排名因素 |
| **🧩 话题聚类** | 按主题分组内容创意，构建话题权威 |
| **⚡ 快速获胜** | 识别高影响力的即时优化机会 |
| **🤖 AI 写作** | 基于研究数据由 AI 生成 SEO 优化文章 |
| **✏️ 内置编辑器** | Markdown 编辑器，文章本地保存管理 |
| **📈 内容分析** | 可读性评分、关键词密度、SEO 质量分析 |
| **🚀 WordPress 发布** | 一键直发或保存为草稿到 WordPress |
| **🔒 本地优先** | 所有数据存储在本地 SQLite，不依赖外部服务 |

## 📦 安装

> 所有安装包均由 GitHub Actions 自动构建并附在 [Releases](https://github.com/yuansir/seomachine/releases) 页。**无需安装任何服务器或后端。**

### macOS（Apple Silicon / Intel）

| 文件 | 芯片 | 说明 |
|------|------|------|
| `SEO.Machine_0.1.0_aarch64.dmg` | Apple Silicon (M1/M2/M3) | 推荐 |
| `SEO.Machine_0.1.0_x64.dmg` | Intel Mac | |

1. 从 [Releases](https://github.com/yuansir/seomachine/releases) 下载对应架构的 `.dmg`
2. 打开 `.dmg`，将 `SEO Machine.app` 拖入 `/Applications`
3. **首次启动**：右键点击 App → **打开**（绕过 macOS Gatekeeper 安全提示）

### Windows（x64）

| 文件 | 说明 |
|------|------|
| `SEO.Machine_0.1.0_x64-setup.exe` | NSIS 安装包（推荐） |
| `SEO.Machine_0.1.0_x64_en-US.msi` | MSI 安装包 |

1. 从 [Releases](https://github.com/yuansir/seomachine/releases) 下载 `.exe` 安装包
2. 运行安装向导，按提示完成安装
3. 从开始菜单或桌面快捷方式启动

### 从源码构建

**环境要求：**
- Node.js 18+ （推荐 22 LTS）
- Rust 1.85+
- pnpm 9+
- Python 3.10+（SEO 研究脚本）

```bash
# 克隆仓库
git clone https://github.com/yuansir/seomachine.git
cd seomachine

# 安装前端依赖
pnpm install

# Python 研究脚本依赖（可选，仅研究功能需要）
pip install -r python-scripts/requirements.txt

# 开发模式运行
pnpm tauri dev

# 生产构建
pnpm tauri build
```

## 🚀 快速开始

### 1. 配置 LLM（AI 写作功能）

打开 **设置 → LLM**，添加 API 密钥：

| 提供商 | Base URL | 说明 |
|--------|----------|------|
| **DeepSeek** | 内置 | 填入 DeepSeek API Key |
| **OpenAI / 兼容接口** | 自定义 | 支持 OpenAI、Silicon Flow、Claude via OpenAI 兼容等 |

> Claude API 可通过 OpenAI 兼容模式接入：Base URL = `https://api.anthropic.com/v1`

### 2. 配置 DataForSEO（研究功能，可选）

前往 **设置 → API 密钥**，填入 [DataForSEO](https://dataforseo.com) API 密钥。不配置时研究功能不可用，但 AI 写作和编辑器功能正常使用。

### 3. 配置 WordPress（发布功能，可选）

前往 **设置 → WordPress**，填入：
- WordPress 站点地址（如 `https://yoursite.com`）
- 用户名
- [应用程序密码](https://wordpress.org/documentation/article/application-passwords/)（WordPress 5.6+ 内置支持）

### 工作流示例

```
研究页面 → 运行竞品分析 → 保存研究结果
    ↓
撰写页面 → 选择研究 Brief → AI 生成文章
    ↓
编辑器 → 润色内容 → 保存
    ↓
文章管理 → 选择文章 → 发布到 WordPress
```

## 🖥️ 系统要求

| 项目 | 最低要求 | 推荐配置 |
|------|----------|----------|
| 操作系统 | macOS 11 / Windows 10 | macOS 13 / Windows 11 |
| 内存 | 4 GB | 8 GB |
| 存储空间 | 200 MB | 500 MB |
| 分辨率 | 1280×720 | 1920×1080 |

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Cmd/Ctrl + ,` | 打开设置 |
| `Cmd/Ctrl + S` | 保存当前文章 |
| `Cmd/Ctrl + Z` | 撤销（编辑器内） |
| `Cmd/Ctrl + Shift + Z` | 重做（编辑器内） |

## 🛠️ 技术栈

- **前端**: React 19 + TypeScript 5 + TailwindCSS 4 + shadcn/ui
- **桌面框架**: [Tauri 2](https://tauri.app)（Rust 后端）
- **状态管理**: Zustand 5
- **本地数据库**: SQLite via `tauri-plugin-sql`
- **AI 接入**: OpenAI SDK（兼容 DeepSeek / OpenAI / Claude 等）
- **SEO 研究**: Python 脚本 via DataForSEO API

## 📁 项目结构

```
seomachine/
├── src/                    # React 前端源码
│   ├── components/         # UI 组件
│   ├── pages/              # 页面组件 (Research, Write, Editor, ...)
│   ├── stores/             # Zustand 状态管理
│   └── lib/                # 工具库 (db, llm, api-client)
├── src-tauri/              # Tauri / Rust 后端
│   ├── src/
│   │   ├── commands/       # Tauri 命令 (python, wordpress, keys)
│   │   └── db.rs           # SQLite 数据库初始化
│   └── tauri.conf.json
├── python-scripts/         # SEO 研究 Python 脚本
└── docs/                   # 文档
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 🔒 隐私

- **所有数据本地存储**：SQLite 数据库位于应用数据目录，不上传到任何服务器
- **API 密钥安全存储**：通过 `tauri-plugin-store` 加密存储在本地
- **网络请求**：仅通过你配置的 API（LLM 提供商、DataForSEO、WordPress）

## 📄 许可证

[MIT](LICENSE) © 2026 SEO Machine Contributors
