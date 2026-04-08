# SEO Machine Tauri 桌面应用项目

## 项目概述

将 SEO Machine（一个基于 Claude Code 的 SEO 内容创作工具）转换为 Tauri 桌面客户端，让用户无需使用命令行即可完成 SEO 内容创作工作。

### 源项目信息
- **GitHub**: https://github.com/TheCraigHewitt/seomachine
- **Stars**: 3,924
- **语言**: Python (Claude Code 工作空间)
- **功能**: SEO 关键词研究、文章撰写、内容优化、数据分析、WordPress 发布

### 核心价值主张
将复杂的 SEO 内容创作流程封装为用户友好的桌面应用，一键安装即可使用。

---

## 技术决策

### Tauri vs Electron 选择理由
| 因素 | Tauri | Electron |
|------|-------|----------|
| 二进制大小 | ~600KB | ~150MB |
| 内存占用 | 低 | 高 |
| 安全性 | Rust 原生审计 | 需要额外配置 |
| Python 集成 | 通过 std::process::Command | 可行但重量级 |
| 系统资源 | 极低 | 较高 |

**决策**: Tauri 2.x ✅

### 技术栈
| 组件 | 选择 | 版本 |
|------|------|------|
| 桌面框架 | Tauri | 2.x |
| 前端框架 | React | 18.x |
| 类型系统 | TypeScript | 5.x |
| 构建工具 | Vite | 6.x |
| 包管理器 | pnpm | 9.x |
| UI 组件库 | shadcn/ui | latest |
| 状态管理 | Zustand | 5.x |
| 本地数据库 | SQLite (tauri-plugin-sql) | 2.x |
| 持久化存储 | tauri-plugin-store | 2.x |
| Python 集成 | Rust std::process::Command | - |

### Python 脚本集成策略
```rust
#[tauri::command]
fn run_seo_research(topic: String) -> Result<String, String> {
    let output = std::process::Command::new("python3")
        .arg("research_quick_wins.py")
        .arg(&topic)
        .current_dir("./python-scripts")
        .output()
        .map_err(|e| e.to_string())?;

    String::from_utf8(output.stdout).map_err(|e| e.to_string())
}
```

---

## 项目边界

### 包含范围
1. 主题研究界面（输入主题 → 研究脚本 → 展示简报）
2. 文章撰写界面（调用 Claude API → 生成文章）
3. 文章编辑器（查看、编辑、导出 Markdown/HTML）
4. SEO 分析面板（关键词密度、可读性、质量评分）
5. WordPress 发布功能
6. 本地数据库存储（文章、研究报告、项目配置）
7. API 密钥安全管理

### 不包含范围（Phase 1-3）
- WordPress 站点管理（多站点支持）
- 批量文章处理
- 自动化定时发布
- 团队协作功能
- 云端同步

---

## 用户体验目标

### 安装体验
- 下载安装包 → 双击安装 → 打开应用 → 开始使用
- 无需配置 Python 环境（打包 Python 运行时）
- 无需命令行操作

### 核心工作流
```
1. 设置 API 密钥（一次配置）
       ↓
2. 输入主题，开始研究
       ↓
3. 查看研究简报，确认方向
       ↓
4. 一键生成文章
       ↓
5. 编辑器中查看和修改
       ↓
6. SEO 分析 → 优化建议
       ↓
7. 发布到 WordPress
```

### UI 设计方向
- **主题**: 深色模式为主（符合内容创作者习惯）
- **风格**: 简洁文档风格，减少干扰，突出内容
- **布局**: 左侧导航 + 右侧内容区
- **字体**: 等宽字体用于编辑器，衬线字体用于阅读

---

## 成功标准

### 功能验收
- [ ] 用户可以在 5 分钟内完成安装并运行
- [ ] 主题研究功能在 30 秒内返回结果
- [ ] 文章生成功能正常工作
- [ ] 文章可以成功发布到 WordPress
- [ ] SEO 分析面板显示准确的评分和建议

### 性能指标
- 应用启动时间 < 3 秒
- 研究脚本执行 < 30 秒
- 界面响应时间 < 100ms

### 用户满意度
- 界面直观，无需文档即可上手
- 错误信息清晰，解决问题容易
