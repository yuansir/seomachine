export type ProviderType = 'deepseek' | 'openai-compat';

export interface LLMConfig {
  provider: ProviderType;
  apiKey: string;
  baseURL: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  onChunk?: (text: string) => void;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

export interface LLMProvider {
  name: string;
  provider: ProviderType;
  generate: (messages: LLMMessage[], options?: GenerationOptions) => Promise<string>;
  getClient: () => unknown;
}
