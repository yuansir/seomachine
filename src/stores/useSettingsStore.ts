import { create } from "zustand";
import { load, Store } from "@tauri-apps/plugin-store";

interface SettingsState {
  claudeApiKey: string | null;
  dataforseoApiKey: string | null;
  wordpressUrl: string | null;
  wordpressUsername: string | null;
  wordpressAppPassword: string | null;
  isLoading: boolean;
  setApiKey: (provider: "claude" | "dataforseo", key: string) => Promise<void>;
  setWordPress: (url: string, username: string, password: string) => Promise<void>;
  loadSettings: () => Promise<void>;
}

let store: Store | null = null;

async function getStore(): Promise<Store> {
  if (!store) {
    store = await load("settings.json");
  }
  return store;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  claudeApiKey: null,
  dataforseoApiKey: null,
  wordpressUrl: null,
  wordpressUsername: null,
  wordpressAppPassword: null,
  isLoading: true,

  setApiKey: async (provider, key) => {
    const s = await getStore();
    const keyName = provider === "claude" ? "claudeApiKey" : "dataforseoApiKey";
    await s.set(keyName, key);
    await s.save();
    if (provider === "claude") {
      set({ claudeApiKey: key });
    } else {
      set({ dataforseoApiKey: key });
    }
  },

  setWordPress: async (url, username, password) => {
    const s = await getStore();
    await s.set("wordpressUrl", url);
    await s.set("wordpressUsername", username);
    await s.set("wordpressAppPassword", password);
    await s.save();
    set({ wordpressUrl: url, wordpressUsername: username, wordpressAppPassword: password });
  },

  loadSettings: async () => {
    set({ isLoading: true });
    const s = await getStore();
    const claudeApiKey = await s.get<string>("claudeApiKey");
    const dataforseoApiKey = await s.get<string>("dataforseoApiKey");
    const wordpressUrl = await s.get<string>("wordpressUrl");
    const wordpressUsername = await s.get<string>("wordpressUsername");
    const wordpressAppPassword = await s.get<string>("wordpressAppPassword");
    set({
      claudeApiKey,
      dataforseoApiKey,
      wordpressUrl,
      wordpressUsername,
      wordpressAppPassword,
      isLoading: false
    });
  },
}));