import OpenAI from 'openai';
import type { LLMConfig, GenerationOptions, LLMMessage, LLMProvider } from '../types';

export function createOpenAICompatProvider(config: LLMConfig): LLMProvider {
  // For OpenAI-compatible, baseURL must be provided
  if (!config.baseURL) {
    throw new Error("OpenAI 兼容模式需要配置 Base URL，请在设置中填写 API Base URL");
  }
  const baseURL = config.baseURL.endsWith('/v1')
    ? config.baseURL
    : `${config.baseURL}/v1`;

  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL,
  });

  return {
    name: 'OpenAI Compatible',
    provider: 'openai-compat' as const,

    async generate(
      messages: LLMMessage[],
      options: GenerationOptions = {}
    ): Promise<string> {
      const stream = await client.chat.completions.create({
        model: config.model || 'gpt-4o-mini',
        messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
        temperature: options.temperature ?? config.temperature,
        max_tokens: options.maxTokens ?? config.maxTokens,
        stream: true,
      }, { signal: options.signal });

      let fullContent = '';
      const ESTIMATED_CHARS = 6000;

      for await (const chunk of stream) {
        if (options.signal?.aborted) break;

        const delta = chunk.choices[0]?.delta?.content || '';
        fullContent += delta;

        if (options.onChunk) {
          options.onChunk(fullContent);
        }

        if (options.onProgress) {
          const progress = Math.min(
            Math.round((fullContent.length / ESTIMATED_CHARS) * 100),
            99
          );
          options.onProgress(progress);
        }
      }

      if (options.onProgress) {
        options.onProgress(100);
      }

      return fullContent;
    },

    getClient() {
      return client;
    },
  };
}
