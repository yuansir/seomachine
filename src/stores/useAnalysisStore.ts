import { create } from "zustand";

export type AnalysisType = "keyword" | "readability" | "seo" | "comprehensive";

export interface KeywordAnalysis {
  keyword: string;
  density: number;
  count: number;
  positions: number[];
}

export interface ReadabilityScore {
  score: number;
  grade: string;
  avgSentenceLength: number;
  avgWordLength: number;
  percentComplexWords: number;
}

export interface SEOQualityScore {
  score: number;
  titleOptimization: number;
  metaDescriptionOptimization: number;
  headingStructure: number;
  keywordDensity: number;
  internalLinks: number;
  externalLinks: number;
  contentLength: number;
}

export interface OptimizationSuggestion {
  type: "positive" | "warning" | "critical";
  category: string;
  message: string;
  currentValue?: string;
  recommendedValue?: string;
}

export interface AnalysisResults {
  keywordAnalysis: KeywordAnalysis[];
  readabilityScore: ReadabilityScore;
  seoQualityScore: SEOQualityScore;
  suggestions: OptimizationSuggestion[];
  overallScore: number;
}

interface AnalysisState {
  selectedArticleId: string | null;
  analysisType: AnalysisType;
  results: AnalysisResults | null;
  isAnalyzing: boolean;
  progress: number;
  error: string | null;

  setSelectedArticle: (id: string | null) => void;
  setAnalysisType: (type: AnalysisType) => void;
  setResults: (results: AnalysisResults | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  runAnalysis: (content: string) => Promise<void>;
  clearResults: () => void;
}

export const useAnalysisStore = create<AnalysisState>()((set) => ({
  selectedArticleId: null,
  analysisType: "comprehensive",
  results: null,
  isAnalyzing: false,
  progress: 0,
  error: null,

  setSelectedArticle: (id) => set({ selectedArticleId: id }),
  setAnalysisType: (type) => set({ analysisType: type }),
  setResults: (results) => set({ results }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setProgress: (progress) => set({ progress }),
  setError: (error) => set({ error }),

  runAnalysis: async (_content: string) => {
    set({ isAnalyzing: true, progress: 0, error: null });

    try {
      // Simulate analysis progress
      for (let i = 0; i <= 100; i += 20) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        set({ progress: i });
      }

      // Placeholder results - in real implementation, this would call Python scripts
      const results: AnalysisResults = {
        keywordAnalysis: [
          { keyword: "SEO", density: 2.5, count: 15, positions: [1, 3, 5] },
          { keyword: "content", density: 1.8, count: 12, positions: [2, 4, 7] },
          { keyword: "ranking", density: 1.2, count: 8, positions: [6, 8] },
        ],
        readabilityScore: {
          score: 72,
          grade: "7th Grade",
          avgSentenceLength: 15.3,
          avgWordLength: 4.8,
          percentComplexWords: 12,
        },
        seoQualityScore: {
          score: 78,
          titleOptimization: 85,
          metaDescriptionOptimization: 70,
          headingStructure: 90,
          keywordDensity: 75,
          internalLinks: 60,
          externalLinks: 50,
          contentLength: 80,
        },
        suggestions: [
          {
            type: "positive",
            category: "标题",
            message: "标题长度适中，包含关键词",
            currentValue: "45 字符",
            recommendedValue: "50-60 字符",
          },
          {
            type: "warning",
            category: "关键词",
            message: "建议增加关键词密度",
            currentValue: "1.5%",
            recommendedValue: "2-3%",
          },
          {
            type: "critical",
            category: "链接",
            message: "缺少外部链接，建议添加 2-3 个权威来源",
          },
        ],
        overallScore: 75,
      };

      set({ results });
    } catch (error) {
      set({ error: `分析失败: ${error}` });
    } finally {
      set({ isAnalyzing: false, progress: 100 });
    }
  },

  clearResults: () => set({ results: null, error: null }),
}));
