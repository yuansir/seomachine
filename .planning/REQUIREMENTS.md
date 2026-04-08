# SEO Machine Tauri 桌面应用 - 需求规格

## 一、功能需求

### 1.1 初始化与配置

#### API 密钥管理
- [ ] **R-001**: 用户可以输入和保存 Anthropic Claude API 密钥
- [ ] **R-002**: 用户可以输入和保存 DataForSEO API 密钥
- [ ] **R-003**: API 密钥安全存储（使用 tauri-plugin-store 加密存储）
- [ ] **R-004**: 支持查看、修改、删除已保存的密钥
- [ ] **R-005**: 密钥修改后立即生效

#### WordPress 配置
- [ ] **R-010**: 用户可以配置 WordPress 站点 URL
- [ ] **R-011**: 用户可以输入 WordPress 用户名和应用密码
- [ ] **R-012**: 支持测试连接验证配置正确性

### 1.2 主题研究

#### 研究输入
- [ ] **R-020**: 用户输入主题关键词
- [ ] **R-021**: 支持选择研究类型（快速研究、全面研究、竞品分析）
- [ ] **R-022**: 研究过程显示进度指示器

#### 研究输出
- [ ] **R-023**: 显示关键词研究和竞品分析结果
- [ ] **R-024**: 展示推荐的文章大纲（H1/H2/H3 结构）
- [ ] **R-025**: 显示目标字数建议
- [ ] **R-026**: 展示内部链接建议
- [ ] **R-027**: 研究报告保存到本地数据库
- [ ] **R-028**: 研究报告支持导出为 Markdown 文件

### 1.3 文章撰写

#### 撰写界面
- [ ] **R-030**: 基于研究简报生成文章
- [ ] **R-031**: 显示正在生成文章的指示器
- [ ] **R-032**: 支持中断文章生成
- [ ] **R-033**: 生成的文章自动保存到数据库

#### 文章内容
- [ ] **R-040**: 生成 2000-3000+ 字的 SEO 优化文章
- [ ] **R-041**: 文章包含 H1/H2/H3 标题结构
- [ ] **R-042**: 文章自动包含内部和外部链接
- [ ] **R-043**: 自动生成 Meta Title（50-60 字符）
- [ ] **R-044**: 自动生成 Meta Description（150-160 字符）

### 1.4 文章编辑器

#### 编辑功能
- [ ] **R-050**: 在应用内查看和编辑文章内容
- [ ] **R-051**: 支持 Markdown 语法高亮
- [ ] **R-052**: 支持实时预览 Markdown 渲染效果
- [ ] **R-053**: 支持撤销/重做操作
- [ ] **R-054**: 支持保存手动修改

#### 文件操作
- [ ] **R-055**: 文章保存到本地 SQLite 数据库
- [ ] **R-056**: 支持导出为 Markdown 文件
- [ ] **R-057**: 支持导出为 HTML 文件
- [ ] **R-058**: 支持复制文章到剪贴板

### 1.5 SEO 分析

#### 分析功能
- [ ] **R-060**: 关键词密度分析（显示百分比、分布热力图）
- [ ] **R-061**: 可读性评分（Flesch Reading Ease）
- [ ] **R-062**: SEO 质量评分（0-100 分）
- [ ] **R-063**: 搜索意图分析
- [ ] **R-064**: 内容长度与竞品对比

#### 分析输出
- [ ] **R-065**: 显示详细的 SEO 优化建议列表
- [ ] **R-066**: 标注关键问题（关键词堆砌、可读性差等）
- [ ] **R-067**: 分析报告保存到数据库

### 1.6 WordPress 发布

#### 发布功能
- [ ] **R-070**: 将文章发布到配置的 WordPress 站点
- [ ] **R-071**: 自动添加 Yoast SEO 元数据
- [ ] **R-072**: 显示发布状态和结果
- [ ] **R-073**: 支持发布前预览

#### 发布后
- [ ] **R-074**: 保存发布记录到数据库
- [ ] **R-075**: 支持查看已发布文章列表
- [ ] **R-076**: 支持复制已发布文章的 URL

### 1.7 数据管理

#### 本地存储
- [ ] **R-080**: SQLite 数据库存储所有数据
- [ ] **R-081**: 支持文章草稿管理
- [ ] **R-082**: 支持研究简报管理
- [ ] **R-083**: 支持配置信息存储

#### 导入导出
- [ ] **R-090**: 支持导入本地 Markdown 文件
- [ ] **R-091**: 支持备份整个数据库
- [ ] **R-092**: 支持数据库恢复

---

## 二、非功能需求

### 2.1 性能需求
- **P-001**: 应用冷启动时间 < 3 秒
- **P-002**: 界面操作响应时间 < 100ms
- **P-003**: 研究脚本执行时间显示进度

### 2.2 安全性需求
- **S-001**: API 密钥加密存储
- **S-002**: 不在日志中输出敏感信息
- **S-003**: WordPress 密码不显示明文

### 2.3 兼容性需求
- **C-001**: 支持 macOS 12+
- **C-002**: 支持 Windows 10+
- **C-003**: 支持 Linux (Ubuntu 20.04+)

### 2.4 用户体验需求
- **U-001**: 所有操作都有视觉反馈
- **U-002**: 错误信息清晰、可操作
- **U-003**: 支持深色/浅色主题切换
- **U-004**: 支持键盘快捷键

---

## 三、Milestone v1.1 新增需求：LLM 集成

### 3.10 LLM 提供商支持
- [x] **LLM-01**: DeepSeek API 集成
- [x] **LLM-02**: OpenAI 兼容 API 集成（支持硅基流动等）
- [x] **LLM-03**: LLM 提供商选择界面（Claude / DeepSeek / OpenAI）
- [x] **LLM-04**: API 密钥和 Base URL 配置
- [x] **LLM-05**: 模型参数配置（temperature, max_tokens）
- [x] **LLM-06**: 文章生成真实调用 LLM
- [x] **LLM-07**: 生成进度显示

---

## 三、技术约束

### 3.1 Python 环境
- 应用打包 Python 3.10+ 运行时
- 所有 Python 依赖预先安装
- 脚本路径通过 Tauri 资源路径访问

### 3.2 API 调用
- Claude API 调用使用官方 SDK
- DataForSEO API 有速率限制，需要实现缓存
- 所有 API 错误需要优雅处理

### 3.3 数据库 Schema
```sql
-- 文章表
CREATE TABLE articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    primary_keyword TEXT,
    status TEXT DEFAULT 'draft', -- draft, published
    research_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    published_at DATETIME,
    wordpress_url TEXT,
    FOREIGN KEY (research_id) REFERENCES researches(id)
);

-- 研究简报表
CREATE TABLE researches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic TEXT NOT NULL,
    research_type TEXT NOT NULL, -- quick, comprehensive, competitor
    content TEXT NOT NULL, -- JSON 研究内容
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 配置表
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 发布记录表
CREATE TABLE publish_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    wordpress_url TEXT,
    status TEXT, -- success, failed
    error_message TEXT,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id)
);
```

---

## 四、验收标准

### 4.1 核心流程验收
1. ✅ 用户首次打开应用 → 引导设置 API 密钥
2. ✅ 输入主题 → 30秒内显示研究简报
3. ✅ 点击生成文章 → 显示进度 → 生成完成
4. ✅ 编辑文章 → 保存成功
5. ✅ 点击发布 → WordPress 发布成功

### 4.2 边界情况处理
1. API 密钥错误 → 显示具体错误信息
2. 网络断开 → 缓存结果，提示重试
3. 研究脚本执行失败 → 显示错误，允许重试
4. WordPress 发布失败 → 保存草稿，显示错误原因

### 4.3 性能验收
1. 启动时间 < 3 秒
2. 页面切换 < 100ms
3. 大量文章（1000+）时列表加载 < 1 秒
