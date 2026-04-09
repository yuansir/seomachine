import { create } from "zustand";
import { saveArticleToDB } from "@/lib/db";
import type { ResearchResult } from "./useResearchStore";

export type ArticleLength = "short" | "medium" | "long";
export type ContentStyle = "professional" | "conversational" | "technical";

// Alias so Write.tsx can import the same name it already uses
export type ResearchBrief = ResearchResult;

export interface ArticleConfig {
  title: string;
  length: ArticleLength;
  style: ContentStyle;
}

export interface GeneratedArticle {
  id: string;
  title: string;
  content: string;
  briefId?: string;
  createdAt: string;
  updatedAt: string;
}

interface WriteState {
  selectedBrief: ResearchResult | null;
  articleConfig: ArticleConfig;
  generatedContent: string;
  isGenerating: boolean;
  progress: number;
  generationId: string | null;
  error: string | null;

  selectBrief: (brief: ResearchResult | null) => void;
  updateConfig: (config: Partial<ArticleConfig>) => void;
  setGeneratedContent: (content: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  handleWriteError: (error: unknown) => void;
  saveArticle: () => Promise<GeneratedArticle | null>;
  reset: () => void;
}

const initialConfig: ArticleConfig = {
  title: "",
  length: "medium",
  style: "professional",
};

export const useWriteStore = create<WriteState>()((set, get) => ({
  selectedBrief: null,
  articleConfig: initialConfig,
  generatedContent: "",
  isGenerating: false,
  progress: 0,
  generationId: null,
  error: null,

  selectBrief: (brief) => set({ selectedBrief: brief }),

  updateConfig: (config) =>
    set((state) => ({
      articleConfig: { ...state.articleConfig, ...config },
    })),

  setGeneratedContent: (content) => set({ generatedContent: content }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setProgress: (progress) => set({ progress }),
  setError: (error) => set({ error }),

  handleWriteError: (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    set({ error: message, isGenerating: false, progress: 0 });
  },

  saveArticle: async () => {
    const { generatedContent, articleConfig, selectedBrief } = get();
    if (!generatedContent) return null;

    const title = articleConfig.title.trim() || "未命名文章";
    const id = await saveArticleToDB({
      title,
      content: generatedContent,
      status: "draft",
      briefId: selectedBrief?.id,
    });

    const article: GeneratedArticle = {
      id,
      title,
      content: generatedContent,
      briefId: selectedBrief?.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return article;
  },

  reset: () =>
    set({
      selectedBrief: null,
      articleConfig: initialConfig,
      generatedContent: "",
      isGenerating: false,
      progress: 0,
      generationId: null,
      error: null,
    }),
}));

