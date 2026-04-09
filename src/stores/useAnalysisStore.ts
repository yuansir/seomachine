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

// ─── helpers ──────────────────────────────────────────────

function countSyllables(word: string): number {
  const w = word.toLowerCase();
  if (w.length <= 3) return 1;
  const m = w.match(/[aeiouy]+/g);
  return Math.max(1, m ? m.length : 1);
}

function extractPlainText(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .trim();
}

const STOP_WORDS = new Set([
  "the","and","for","with","this","that","are","was","were","will","have","has",
  "had","not","but","from","they","their","what","when","which","who","how","its",
  "also","been","can","into","you","your","our","more","than","about","would",
  "there","other","some","then","these","through","each","just","should","may",
  "such","where","most","his","her","him","she","a","an","in","is","it","of",
  "to","be","as","at","by","or","on","we","i","do","so","if","my","me","up","do",
  "go","no","us","he","am","very","all","any","yet","both","now","own","out",
]);

function runClientAnalysis(content: string): AnalysisResults {
  const plain = extractPlainText(content);

  // ── word tokens (handles Chinese + English) ──
  const en = plain.match(/\b[a-zA-Z]{3,}\b/g) ?? [];
  const zh = plain.match(/[\u4e00-\u9fff]{2,6}/g) ?? [];
  const allTokens = [...en.map((w) => w.toLowerCase()), ...zh];
  const totalWords = Math.max(1, allTokens.length);

  // ── keyword frequency ──
  const freq: Record<string, number> = {};
  allTokens.forEach((t) => {
    if (!STOP_WORDS.has(t)) freq[t] = (freq[t] ?? 0) + 1;
  });

  const keywordAnalysis: KeywordAnalysis[] = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([keyword, count]) => ({
      keyword,
      count,
      density: parseFloat(((count / totalWords) * 100).toFixed(2)),
      positions: [],
    }));

  // ── readability (Flesch approx, English-oriented) ──
  const sentences = plain.split(/[.!?。！？]+/).filter((s) => s.trim().length > 0);
  const syllables = en.reduce((acc, w) => acc + countSyllables(w), 0);
  const avgSentLen = sentences.length > 0 ? totalWords / sentences.length : 0;
  const avgSyl = en.length > 0 ? syllables / en.length : 1.5;
  const rawFlesch = Math.max(0, Math.min(100, 206.835 - 1.015 * avgSentLen - 84.6 * avgSyl));
  const complexWds = en.filter((w) => countSyllables(w) >= 3);

  const gradeMap = [
    { min: 90, grade: "初中 5-6 年级" },
    { min: 80, grade: "初中 6-7 年级" },
    { min: 70, grade: "初中 7-8 年级" },
    { min: 60, grade: "高中" },
    { min: 50, grade: "大学" },
    { min: 0,  grade: "专业/学术" },
  ];
  const grade = gradeMap.find((g) => rawFlesch >= g.min)?.grade ?? "专业/学术";

  const readabilityScore: ReadabilityScore = {
    score: Math.round(rawFlesch),
    grade,
    avgSentenceLength: parseFloat(avgSentLen.toFixed(1)),
    avgWordLength: parseFloat((en.join("").length / Math.max(1, en.length)).toFixed(1)),
    percentComplexWords: parseFloat((complexWds.length / Math.max(1, en.length) * 100).toFixed(1)),
  };

  // ── SEO quality ──
  const h1 = (content.match(/^#\s+.+/gm) ?? []).length;
  const h2 = (content.match(/^##\s+.+/gm) ?? []).length;
  const h3 = (content.match(/^###\s+.+/gm) ?? []).length;
  const links = (content.match(/\[.+?\]\(.+?\)/g) ?? []).length;

  const titleOpt  = h1 === 1 ? 100 : h1 === 0 ? 0 : 60;
  const structure = Math.min(100, h2 * 15 + h3 * 8);
  const linkScore = Math.min(100, links * 25);
  const wordScore = Math.min(100, Math.round((totalWords / 1500) * 100));
  const kdScore   =
    keywordAnalysis.length > 0 &&
    keywordAnalysis[0].density >= 0.5 &&
    keywordAnalysis[0].density <= 3.5
      ? 80
      : 40;

  const seoOverall = Math.round((titleOpt + structure + linkScore + wordScore + kdScore) / 5);

  const seoQualityScore: SEOQualityScore = {
    score: seoOverall,
    titleOptimization: titleOpt,
    metaDescriptionOptimization: 50,
    headingStructure: structure,
    keywordDensity: kdScore,
    internalLinks: Math.min(100, links * 35),
    externalLinks: Math.min(100, links * 20),
    contentLength: wordScore,
  };

  // ── suggestions ──
  const suggestions: OptimizationSuggestion[] = [];

  if (h1 === 0) {
    suggestions.push({ type: "critical", category: "标题结构", message: "缺少 H1 标题，请添加一个主标题" });
  } else if (h1 > 1) {
    suggestions.push({
      type: "warning", category: "标题结构",
      message: `存在 ${h1} 个 H1 标题，建议只保留一个`,
      currentValue: `${h1} 个`, recommendedValue: "1 个",
    });
  } else {
    suggestions.push({ type: "positive", category: "标题结构", message: "H1 主标题结构正确" });
  }

  if (h2 < 2) {
    suggestions.push({
      type: "warning", category: "内容结构",
      message: "H2 小节标题偏少，建议增加章节分割以提升可读性",
      currentValue: `${h2} 个`, recommendedValue: "3+ 个",
    });
  } else {
    suggestions.push({ type: "positive", category: "内容结构", message: `拥有 ${h2} 个 H2 标题，结构清晰` });
  }

  if (totalWords < 800) {
    suggestions.push({
      type: "critical", category: "内容长度",
      message: "内容字数不足，建议增至 1500 字以上",
      currentValue: `${totalWords} 字`, recommendedValue: "1500+ 字",
    });
  } else if (totalWords < 1500) {
    suggestions.push({
      type: "warning", category: "内容长度",
      message: "内容字数偏少，建议补充至 1500 字以上",
      currentValue: `${totalWords} 字`, recommendedValue: "1500+ 字",
    });
  } else {
    suggestions.push({ type: "positive", category: "内容长度", message: `内容字数充足（${totalWords} 字）` });
  }

  if (links === 0) {
    suggestions.push({ type: "critical", category: "链接", message: "没有超链接，建议添加 2-3 个内/外部权威链接" });
  } else if (links < 3) {
    suggestions.push({
      type: "warning", category: "链接",
      message: "链接数量偏少，建议增加内外链",
      currentValue: `${links} 个`, recommendedValue: "3+ 个",
    });
  } else {
    suggestions.push({ type: "positive", category: "链接", message: `已有 ${links} 个链接` });
  }

  if (keywordAnalysis.length > 0) {
    const top = keywordAnalysis[0];
    if (top.density > 3.5) {
      suggestions.push({
        type: "warning", category: "关键词密度",
        message: "主关键词密度偏高，有被判为关键词堆砌的风险",
        currentValue: `${top.density}%`, recommendedValue: "1-3%",
      });
    } else {
      suggestions.push({
        type: "positive", category: "关键词密度",
        message: `关键词 "${top.keyword}" 密度适中（${top.density}%）`,
      });
    }
  }

  if (avgSentLen > 25) {
    suggestions.push({
      type: "warning", category: "可读性",
      message: "平均句子较长，建议拆分为更短的句子",
      currentValue: `${avgSentLen.toFixed(0)} 词/句`, recommendedValue: "15-20 词/句",
    });
  } else {
    suggestions.push({ type: "positive", category: "可读性", message: "句子长度适中，易于阅读" });
  }

  const overallScore = Math.round(seoQualityScore.score * 0.6 + readabilityScore.score * 0.4);

  return { keywordAnalysis, readabilityScore, seoQualityScore, suggestions, overallScore };
}

// ─── store ──────────────────────────────────────────────

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

  runAnalysis: async (content: string) => {
    set({ isAnalyzing: true, progress: 0, error: null, results: null });

    try {
      set({ progress: 30 });
      await new Promise((r) => setTimeout(r, 80)); // let UI render

      set({ progress: 70 });
      await new Promise((r) => setTimeout(r, 80));

      const results = runClientAnalysis(content);
      set({ results, progress: 100 });
    } catch (error) {
      set({ error: `分析失败: ${error}` });
    } finally {
      set({ isAnalyzing: false });
    }
  },

  clearResults: () => set({ results: null, error: null }),
}));

