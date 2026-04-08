import { create } from "zustand";

export type ResearchType = "quick" | "comprehensive" | "competitor";

export interface KeywordAnalysis {
  keyword: string;
  volume: number;
  difficulty: number;
  opportunities: string[];
}

export interface ContentSuggestion {
  title: string;
  metaDescription: string;
  mainTopics: string[];
  wordCount: number;
}

export interface ResearchResult {
  id: string;
  type: ResearchType;
  keywords: KeywordAnalysis[];
  contentSuggestions: ContentSuggestion[];
  seoScore: number;
  topCompetitors: string[];
  generatedAt: string;
  rawOutput?: string;
}

interface ResearchState {
  researchType: ResearchType;
  keywords: string[];
  results: ResearchResult | null;
  isResearching: boolean;
  progress: number;
  error: string | null;

  setResearchType: (type: ResearchType) => void;
  setKeywords: (keywords: string[]) => void;
  setResults: (results: ResearchResult | null) => void;
  setIsResearching: (isResearching: boolean) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  clearResults: () => void;
}

export const useResearchStore = create<ResearchState>()((set) => ({
  researchType: "quick",
  keywords: [],
  results: null,
  isResearching: false,
  progress: 0,
  error: null,

  setResearchType: (type) => set({ researchType: type }),
  setKeywords: (keywords) => set({ keywords }),
  setResults: (results) => set({ results }),
  setIsResearching: (isResearching) => set({ isResearching }),
  setProgress: (progress) => set({ progress }),
  setError: (error) => set({ error }),
  clearResults: () => set({ results: null, error: null }),
}));
