import OpenAI from 'openai';
import type { LLMConfig, GenerationOptions, LLMMessage, LLMProvider } from '../types';

export function createDeepSeekProvider(config: LLMConfig): LLMProvider {
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL || 'https://api.deepseek.com/v1',
  });

  return {
    name: 'DeepSeek',
    provider: 'deepseek' as const,

    async generate(
      messages: LLMMessage[],
      options: GenerationOptions = {}
    ): Promise<string> {
      const stream = await client.chat.completions.create({
        model: config.model || 'deepseek-chat',
        messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
        temperature: options.temperature ?? config.temperature,
        max_tokens: options.maxTokens ?? config.maxTokens,
        stream: true,
      }, { signal: options.signal });

      let fullContent = '';
      const ESTIMATED_CHARS = 2000;

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
