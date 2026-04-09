# 贡献指南

感谢你对 SEO Machine 的兴趣！以下是参与贡献的指南。

## 开发环境搭建

### 前置要求

- **Node.js** 18+（推荐 22 LTS）— [下载](https://nodejs.org)
- **Rust** 1.85+（含 cargo）— `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- **pnpm** 9+ — `npm install -g pnpm`
- **Python** 3.10+（可选，SEO 研究功能需要）

### 本地运行

```bash
git clone https://github.com/YOUR_USERNAME/seomachine.git
cd seomachine

# 安装前端依赖
pnpm install

# 启动开发模式（自动编译 Rust + 启动前端 HMR）
pnpm tauri dev
```

### 生产构建

```bash
pnpm tauri build
# 构建产物位于 src-tauri/target/release/bundle/
```

### 类型检查

```bash
pnpm tsc --noEmit
```

## 提 Issue

### Bug 报告

请使用 [Bug 报告模板](.github/ISSUE_TEMPLATE/bug_report.md)，确保包含：

- 复现步骤（最小化）
- 预期行为 vs 实际行为
- 操作系统和版本
- 截图或日志（如有）

### 功能请求

请使用 [功能请求模板](.github/ISSUE_TEMPLATE/feature_request.md)，描述使用场景和期望结果。

## 提 Pull Request

1. **Fork** 本仓库
2. 从 `main` 创建分支：`git checkout -b feat/your-feature`
3. 提交原子化的 commit，遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/)：
   - `feat:` 新功能
   - `fix:` Bug 修复
   - `docs:` 文档修改
   - `style:` 代码格式（不影响逻辑）
   - `refactor:` 重构
   - `chore:` 构建/工具链修改
4. 确保 `pnpm tsc --noEmit` 通过（无 TypeScript 错误）
5. 打开 PR，填写模板描述

## 代码规范

### TypeScript / React

- 使用 TypeScript strict 模式
- 组件使用函数式写法 + hooks
- 状态管理走 Zustand store，不用 prop drilling
- 新增数据库操作在 `src/lib/db.ts` 统一管理

### Rust

- 遵循标准 Rust 命名规范（snake_case）
- Tauri 命令放在 `src-tauri/src/commands/` 对应模块

### 文件结构

- 页面级组件放在 `src/pages/`
- 可复用 UI 组件放在 `src/components/`
- 副作用和数据获取逻辑放在 Zustand store

## 许可证

提交贡献即表示你同意将代码以 [MIT 许可证](LICENSE) 发布。
