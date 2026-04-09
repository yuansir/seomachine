import { create } from 'zustand';
import { load, Store } from '@tauri-apps/plugin-store';
import type { ProviderType, LLMConfig } from '@/lib/llm/types';

interface LLMProviderState {
  provider: ProviderType;
  apiKey: string;
  baseURL: string;
  model: string;
  temperature: number;
  maxTokens: number;
  isConfigured: boolean;
  isLoading: boolean;
  setProvider: (provider: ProviderType) => void;
  setApiKey: (key: string) => Promise<void>;
  setBaseURL: (url: string) => Promise<void>;
  setModel: (model: string) => Promise<void>;
  setTemperature: (temp: number) => Promise<void>;
  setMaxTokens: (tokens: number) => Promise<void>;
  loadConfig: () => Promise<void>;
  getConfig: () => LLMConfig;
}

let store: Store | null = null;

async function getStore(): Promise<Store> {
  if (!store) {
    store = await load('llm-settings.json');
  }
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
  isLoading: true,

  setProvider: (provider) => {
    const updates: Partial<LLMProviderState> = { provider };
    if (provider === 'deepseek') {
      updates.baseURL = 'https://api.deepseek.com';
      updates.model = 'deepseek-chat';
    }
    set(updates);
    // Persist provider, baseURL, and model changes
    getStore()
      .then(async (s) => {
        await s.set('llmProvider', provider);
        if (updates.baseURL) await s.set('llmBaseURL', updates.baseURL);
        if (updates.model) await s.set('llmModel', updates.model);
        await s.save();
      })
      .catch(() => { /* silent — in-memory update already applied */ });
  },

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

  setModel: async (model) => {
    const s = await getStore();
    await s.set('llmModel', model);
    await s.save();
    set({ model });
  },
  setTemperature: async (temperature) => {
    const s = await getStore();
    await s.set('llmTemperature', temperature);
    await s.save();
    set({ temperature });
  },
  setMaxTokens: async (maxTokens) => {
    const s = await getStore();
    await s.set('llmMaxTokens', maxTokens);
    await s.save();
    set({ maxTokens });
  },

  loadConfig: async () => {
    set({ isLoading: true });
    const s = await getStore();
    const apiKey = await s.get<string>('llmApiKey');
    const baseURL = await s.get<string>('llmBaseURL');
    const model = await s.get<string>('llmModel');
    const temperature = await s.get<number>('llmTemperature');
    const maxTokens = await s.get<number>('llmMaxTokens');
    const provider = await s.get<ProviderType>('llmProvider');

    set({
      apiKey: apiKey || '',
      baseURL: baseURL || 'https://api.deepseek.com',
      model: model || 'deepseek-chat',
      temperature: temperature ?? 0.7,
      maxTokens: maxTokens ?? 4096,
      provider: provider || 'deepseek',
      isConfigured: !!apiKey,
      isLoading: false,
    });
  },

  getConfig: () => {
    const state = get();
    return {
      provider: state.provider,
      apiKey: state.apiKey,
      baseURL: state.baseURL,
      model: state.model,
      temperature: state.temperature,
      maxTokens: state.maxTokens,
    };
  },
}));
