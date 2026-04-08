# Phase 5: LLM 集成 - Research

**Researched:** 2026-04-08
**Domain:** LLM API 集成 (OpenAI 兼容接口)
**Confidence:** MEDIUM

## Summary

Phase 5 implements real LLM integration using OpenAI-compatible APIs. DeepSeek is the default provider due to cost efficiency and OpenAI compatibility. The key technical decisions are: (1) use `openai` npm package v6.x with custom `baseURL`, (2) implement streaming with SSE for typewriter effect, (3) create a provider abstraction layer in Zustand for multi-provider support.

**Primary recommendation:** Install `openai` npm package, create a `LLMProvider` abstraction in `src/lib/llm/`, and update settings to include provider selection and API configuration.

---

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **API 配置方案**: 方案 B — OpenAI 兼容 API
- **API Base URL**: `https://api.deepseek.com` (or `/v1` suffix for OpenAI compatibility)
- **Model**: `deepseek-chat` (default)
- **Temperature**: `0.7` (default)
- **Max Tokens**: `4096` (default)
- **LLM 客户端**: 统一接口，支持多提供商切换
- **调用方式**: OpenAI SDK (`openai` npm 包)
- **流式输出**: 支持打字机效果
- **提供商选择**: DeepSeek / OpenAI 兼容 / Claude 三选项

### Claude's Discretion

- 具体实现细节 (store 结构、组件拆分)
- 错误处理UI反馈

### Deferred Ideas (OUT OF SCOPE)

- Claude API 直接集成 (Phase 5 仅实现 DeepSeek/OpenAI 兼容)
- 多模型同时调用

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LLM-01 | DeepSeek API 集成 | DeepSeek API 使用 OpenAI 兼容格式，`openai` SDK 支持 |
| LLM-02 | OpenAI 兼容 API 集成 | 通过 `baseURL` 配置支持硅基流动等 |
| LLM-03 | LLM 提供商选择界面 | Zustand store 设计，settings UI 更新 |
| LLM-04 | API 密钥和 Base URL 配置 | Settings store 扩展，`openai` ClientOptions |
| LLM-05 | 模型参数配置 | temperature, max_tokens 参数传递 |
| LLM-06 | 文章生成真实调用 LLM | 流式 API 调用，Write.tsx 更新 |
| LLM-07 | 生成进度显示 | 流式事件处理，progress 状态更新 |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **openai** | 6.33.0 (latest) | LLM API 客户端 | 官方 SDK，支持 OpenAI 兼容接口，TypeScript 原生 |
| **zustand** | 5.x | 全局状态管理 | 已存在于项目，llmProvider store |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **@tanstack/react-query** | 5.x | 服务端状态 | 已存在于项目，用于 LLM 调用缓存 |

**Installation:**
```bash
pnpm add openai
```

**Version verification:**
```bash
npm view openai version  # 6.33.0 (2026-04)
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── lib/
│   └── llm/
│       ├── index.ts           # 主入口，导出 LLM 客户端
│       ├── types.ts           # 类型定义
│       ├── providers/
│       │   ├── deepseek.ts    # DeepSeek 实现
│       │   ├── openai-compat.ts # OpenAI 兼容实现
│       │   └── types.ts       # Provider 接口
│       └── utils/
│           └── stream.ts      # 流式处理工具
├── stores/
│   └── useLLMProviderStore.ts # LLM 提供商配置 store
```

### Pattern 1: LLM Provider Abstraction

**What:** 工厂模式创建 LLM 客户端，支持多提供商切换

**When to use:** 需要在多个 LLM 提供商之间切换时

**Example:**
```typescript
// src/lib/llm/types.ts
export interface LLMConfig {
  provider: 'deepseek' | 'openai-compat' | 'claude';
  apiKey: string;
  baseURL?: string;  // OpenAI 兼容需要
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMProvider {
  name: string;
  config: LLMConfig;
  createClient(): OpenAI;
  getModel(): string;
}

// src/lib/llm/providers/deepseek.ts
import OpenAI from 'openai';

export function createDeepSeekProvider(apiKey: string, model = 'deepseek-chat', temperature = 0.7, maxTokens = 4096): LLMProvider {
  return {
    name: 'DeepSeek',
    config: { provider: 'deepseek', apiKey, model, temperature, maxTokens },
    createClient() {
      return new OpenAI({
        apiKey,
        baseURL: 'https://api.deepseek.com/v1',
      });
    },
    getModel() { return model; },
  };
}

// src/lib/llm/index.ts
import { createDeepSeekProvider, createOpenAICompatProvider } from './providers';

export type { LLMConfig, LLMProvider } from './types';

export function createLLMClient(config: LLMConfig) {
  switch (config.provider) {
    case 'deepseek':
      return createDeepSeekProvider(config.apiKey, config.model, config.temperature, config.maxTokens);
    case 'openai-compat':
      return createOpenAICompatProvider(config.apiKey, config.baseURL!, config.model, config.temperature, config.maxTokens);
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}
```

### Pattern 2: Streaming with Typewriter Effect

**What:** 使用 SSE 流式响应，前端增量更新实现打字机效果

**When to use:** 文章生成等长文本场景，需要实时显示生成进度

**Example:**
```typescript
// src/lib/llm/utils/stream.ts
export async function* streamToIterable(
  stream: AsyncIterable<OpenAI.Chat.ChatCompletionChunk>
): AsyncGenerator<string> {
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

// 在 Write.tsx 或 store 中使用
export async function generateArticle(
  client: OpenAI,
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  onChunk: (text: string) => void,
  onProgress: (progress: number) => void,
  signal: AbortSignal
) {
  const stream = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 4096,
  });

  let fullText = '';
  const estimatedTotal = 2000; // 预估总字数

  for await (const chunk of stream) {
    if (signal.aborted) break;

    const content = chunk.choices[0]?.delta?.content || '';
    fullText += content;
    onChunk(fullText);

    // 更新进度（基于已生成字符数占预估总数的百分比）
    const progress = Math.min(Math.round((fullText.length / estimatedTotal) * 100), 99);
    onProgress(progress);
  }

  onProgress(100);
  return fullText;
}
```

### Pattern 3: Zustand LLM Provider Store

**What:** 集中管理 LLM 提供商配置，支持动态切换

**When to use:** 需要在设置界面配置多个 LLM 提供商

**Example:**
```typescript
// src/stores/useLLMProviderStore.ts
import { create } from 'zustand';
import { load, Store } from '@tauri-apps/plugin-store';

export type ProviderType = 'deepseek' | 'openai-compat';

interface LLMProviderState {
  provider: ProviderType;
  apiKey: string;
  baseURL: string;
  model: string;
  temperature: number;
  maxTokens: number;
  isConfigured: boolean;
  setProvider: (provider: ProviderType) => void;
  setApiKey: (key: string) => Promise<void>;
  setBaseURL: (url: string) => Promise<void>;
  setModel: (model: string) => void;
  setTemperature: (temp: number) => void;
  setMaxTokens: (tokens: number) => void;
  loadConfig: () => Promise<void>;
}

let store: Store | null = null;
async function getStore(): Promise<Store> {
  if (!store) store = await load('llm-settings.json');
  return store;
}

export const useLLMProviderStore = create<LLMProviderState>()((set, get) => ({
  provider: 'deepseek',
  apiKey: '',
  baseURL: 'https://api.deepseek.com',
  model: 'deepseek-chat',
  temperature: 0.7,
  maxTokens: 4096,
  isConfigured: false,

  setProvider: (provider) => set({
    provider,
    baseURL: provider === 'deepseek' ? 'https://api.deepseek.com' : '',
  }),

  setApiKey: async (apiKey) => {
    const s = await getStore();
    await s.set('llmApiKey', apiKey);
    await s.save();
    set({ apiKey, isConfigured: !!apiKey });
  },

  setBaseURL: async (baseURL) => {
    const s = await getStore();
    await s.set('llmBaseURL', baseURL);
    await s.save();
    set({ baseURL });
  },

  setModel: (model) => set({ model }),
  setTemperature: (temperature) => set({ temperature }),
  setMaxTokens: (maxTokens) => set({ maxTokens }),

  loadConfig: async () => {
    const s = await getStore();
    const apiKey = await s.get<string>('llmApiKey');
    const baseURL = await s.get<string>('llmBaseURL');
    const model = await s.get<string>('llmModel');
    const temperature = await s.get<number>('llmTemperature');
    const maxTokens = await s.get<number>('llmMaxTokens');
    set({
      apiKey: apiKey || '',
      baseURL: baseURL || 'https://api.deepseek.com',
      model: model || 'deepseek-chat',
      temperature: temperature ?? 0.7,
      maxTokens: maxTokens ?? 4096,
      isConfigured: !!apiKey,
    });
  },
}));
```

### Anti-Patterns to Avoid

- **硬编码 API Key**: 绝不将 API Key 硬编码在代码中，必须存储在 tauri-plugin-store
- **同步阻塞调用**: LLM API 调用必须使用 async/await，流式响应必须使用 AsyncIterable
- **无超时配置**: 默认超时 60 秒，防止请求卡死

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| LLM 客户端 | 手写 fetch 调用 | `openai` npm 包 | SDK 处理错误、类型、流式、重试 |
| 流式解析 | 手写 SSE 解析 | SDK 内置 AsyncIterable | 简化代码，减少 bug |
| 错误类型 | 手写错误类 | SDK 内置 APIError 子类 | 统一错误处理，类型安全 |

**Key insight:** `openai` SDK 已经处理了 OpenAI 兼容 API 的所有细节，包括认证、流式、错误重试。只需配置 baseURL 即可。

---

## Common Pitfalls

### Pitfall 1: baseURL 路径错误

**What goes wrong:** API 调用返回 404 或认证失败

**Why it happens:** DeepSeek 需要 `/v1` 后缀，很多 OpenAI 兼容 API 也需要

**How to avoid:**
```typescript
// 正确：包含 /v1 后缀
baseURL: 'https://api.deepseek.com/v1'

// 错误：缺少后缀
baseURL: 'https://api.deepseek.com'
```

**Warning signs:** `APIError: 404` 或 `APIError: 401`

### Pitfall 2: 流式响应未正确处理 AbortSignal

**What goes wrong:** 用户点击取消后请求仍在后台运行

**Why it happens:** 没有传递 AbortController.signal 给 SDK

**How to avoid:**
```typescript
const controller = new AbortController();
// 在用户取消时
controller.abort();
// 在 SDK 调用时
client.chat.completions.create({ ..., signal: controller.signal });
```

### Pitfall 3: 流式更新频率过高

**What goes wrong:** UI 卡顿，因为每个 token 都触发重新渲染

**Why it happens:** 没有批量更新或节流

**How to avoid:** 使用 `requestAnimationFrame` 或累积一定字符数后再更新：
```typescript
let buffer = '';
const FLUSH_INTERVAL = 50; // ms

function flushBuffer() {
  if (buffer) {
    onChunk(buffer);
    buffer = '';
  }
}

// 每 50ms 或 buffer 超过 100 字符时刷新
```

---

## Code Examples

### OpenAI SDK Client Initialization (DeepSeek)

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'your-deepseek-api-key',
  baseURL: 'https://api.deepseek.com/v1',  // 关键：需要 /v1 后缀
});

// 非流式调用
const response = await client.chat.completions.create({
  model: 'deepseek-chat',
  messages: [
    { role: 'system', content: '你是一个SEO文章写作助手。' },
    { role: 'user', content: '写一篇关于React性能优化的文章' },
  ],
  temperature: 0.7,
  max_tokens: 4096,
});

console.log(response.choices[0].message.content);
```

### Streaming Response with Progress

```typescript
import OpenAI from 'openai';

const client = new OpenAI({ apiKey, baseURL: 'https://api.deepseek.com/v1' });

async function generateWithProgress(
  messages: any[],
  onChunk: (text: string) => void,
  onProgress: (p: number) => void,
  signal: AbortSignal
) {
  const stream = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 4096,
  });

  let fullContent = '';
  const ESTIMATED_CHARS = 2000;

  for await (const chunk of stream) {
    if (signal.aborted) break;

    const delta = chunk.choices[0]?.delta?.content || '';
    fullContent += delta;
    onChunk(fullContent);

    // 计算进度（基于实际字符数，不准确但可用）
    const progress = Math.min(
      Math.round((fullContent.length / ESTIMATED_CHARS) * 100),
      99
    );
    onProgress(progress);
  }

  onProgress(100);
  return fullContent;
}
```

### Error Handling

```typescript
import { OpenAI } from 'openai';

try {
  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages,
  });
} catch (error) {
  if (error instanceof OpenAI.APIError) {
    // 访问状态码、请求ID等
    console.error(`Error ${error.status}: ${error.message}`);
    console.error(`Request ID: ${error.request_id}`);

    // 检查错误类型
    if (error.status === 401) {
      // API Key 无效
    } else if (error.status === 429) {
      // 速率限制
    } else if (error.status === 500) {
      // 服务器错误，可重试
    }
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 手动 fetch 调用 | `openai` SDK | 始终 | 类型安全、错误处理、内置重试 |
| 完整响应后显示 | 流式 SSE | 始终 | 用户体验提升，实时看到生成进度 |
| 单模型硬编码 | Provider 抽象 | Phase 5 | 支持多提供商切换 |

**Deprecated/outdated:**
- `openai` v4.x API (旧版，不支持 Responses API)
- 使用 `EventSource` 手动处理 SSE (SDK 已封装)

---

## Open Questions

1. **Claude API 集成时机**
   - What we know: CONTEXT.md 说 Phase 5 仅实现 DeepSeek/OpenAI 兼容
   - What's unclear: Claude 是否需要在 Phase 5 支持，还是后续 phase
   - Recommendation: 保持 Phase 5 范围，Claude 支持在 Phase 6 考虑

2. **流式进度计算准确性**
   - What we know: 只能基于已生成字符数估算
   - What's unclear: 是否有更好的进度估算方式
   - Recommendation: 使用固定进度条或 indeterminate 状态，让用户知道正在生成中

3. **Provider 切换时状态清理**
   - What we know: 多 provider 支持
   - What's unclear: 切换 provider 时是否需要清理聊天历史
   - Recommendation: 每个 provider 维护独立的消息历史

---

## Environment Availability

> Step 2.6: SKIPPED (no external dependencies identified beyond npm packages)

The phase only requires installing the `openai` npm package. No external tools, CLI utilities, or services are needed beyond standard development tools.

---

## Sources

### Primary (HIGH confidence)
- DeepSeek API Documentation (api-docs.deepseek.com) - Base URL format, authentication, streaming
- OpenAI Node.js SDK GitHub (github.com/openai/openai-node) - Client initialization, streaming API
- npm registry (npmjs.com/package/openai) - Version verification: 6.33.0

### Secondary (MEDIUM confidence)
- OpenAI SDK README - Streaming patterns, error handling
- DeepSeek API OpenAI compatibility statement - Confirmed SDK compatibility

### Tertiary (LOW confidence)
- WebSearch results - Additional configuration patterns (marked for validation in implementation)

---

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - openai package confirmed, version verified
- Architecture: MEDIUM - Pattern based on SDK docs and existing codebase patterns
- Pitfalls: MEDIUM - Common issues identified, mitigation strategies proposed

**Research date:** 2026-04-08
**Valid until:** 2026-05-08 (30 days for stable domain)
