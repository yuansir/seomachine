# Phase 5 - LLM 集成决策上下文

## 核心决策

### API 配置方案
**决策**: 方案 B — OpenAI 兼容 API

**理由**: 灵活、通用，支持 DeepSeek、硅基流动等任何 OpenAI 兼容接口

### API 配置细节
| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| API Base URL | `https://api.deepseek.com` | OpenAI 兼容端点 |
| API Key | 用户输入 | 必填 |
| Model | `deepseek-chat` | 默认模型 |
| Temperature | `0.7` | 默认值 |
| Max Tokens | `4096` | 默认值 |

### 架构决策
- **LLM 客户端**: 统一接口，支持多提供商切换
- **调用方式**: OpenAI SDK (`openai` npm 包)
- **流式输出**: 支持打字机效果
- **提供商选择**: 提供 DeepSeek / OpenAI 兼容 / Claude 三选项

## 已确认事项
- ✅ 使用 OpenAI 兼容接口
- ✅ 默认模板即可（DeepSeek API 模板）
- ✅ 模型参数可配置

## 待实施任务
1. 创建 LLM 客户端抽象层
2. 实现 DeepSeek API 客户端
3. 实现 OpenAI 兼容 API 客户端
4. 添加设置界面配置项
5. 替换 Write.tsx 占位符为真实 LLM 调用
