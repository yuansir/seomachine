import { create } from "zustand";
import { saveArticleToDB } from "@/lib/db";

export interface Article {
  id: string;
  title: string;
  content: string;
  briefId?: string;
  createdAt: string;
  updatedAt: string;
  status: "draft" | "published";
}

interface EditorState {
  currentArticle: Article | null;
  content: string;
  isDirty: boolean;
  history: string[];
  historyIndex: number;
  error: string | null;

  loadArticle: (article: Article) => void;
  updateTitle: (title: string) => void;
  updateContent: (content: string) => void;
  saveArticle: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  handleEditorError: (error: unknown) => void;
  clearError: () => void;
}

const MAX_HISTORY = 50;

export const useEditorStore = create<EditorState>()((set, get) => ({
  currentArticle: null,
  content: "",
  isDirty: false,
  history: [""],
  historyIndex: 0,
  error: null,

  loadArticle: (article) => {
    set({
      currentArticle: article,
      content: article.content,
      isDirty: false,
      history: [article.content],
      historyIndex: 0,
      error: null,
    });
  },

  updateTitle: (title) => {
    const { currentArticle } = get();
    if (!currentArticle) return;
    set({ currentArticle: { ...currentArticle, title }, isDirty: true });
  },

  updateContent: (content) => {
    const { history, historyIndex } = get();

    // Add to history if content changed
    const newHistory = history.slice(0, historyIndex + 1);
    if (newHistory[newHistory.length - 1] !== content) {
      newHistory.push(content);
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }
    }

    set({
      content,
      isDirty: true,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  saveArticle: async () => {
    const { currentArticle, content } = get();
    if (!currentArticle) return;

    const updatedAt = new Date().toISOString();
    const persistedId = await saveArticleToDB({
      id: currentArticle.id,
      title: currentArticle.title,
      content,
      status: currentArticle.status,
    });

    set({
      currentArticle: { ...currentArticle, id: persistedId, content, updatedAt },
      isDirty: false,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        historyIndex: newIndex,
        content: history[newIndex],
        isDirty: true,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        historyIndex: newIndex,
        content: history[newIndex],
        isDirty: true,
      });
    }
  },

  reset: () => {
    set({
      currentArticle: null,
      content: "",
      isDirty: false,
      history: [""],
      historyIndex: 0,
      error: null,
    });
  },

  handleEditorError: (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    set({ error: message });
  },

  clearError: () => {
    set({ error: null });
  },
}));
