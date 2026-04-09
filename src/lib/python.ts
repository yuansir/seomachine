import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { ResearchResult, ResearchType } from "@/stores/useResearchStore";

interface ProgressPayload {
  progress: number;
  message: string;
}

const RESEARCH_SCRIPTS: Record<ResearchType, string> = {
  quick: "research_quick_wins.py",
  comprehensive: "research_priorities_comprehensive.py",
  competitor: "research_competitor_gaps.py",
};

export async function runResearch(
  type: ResearchType,
  keywords: string[],
  onProgress?: (progress: number) => void
): Promise<ResearchResult> {
  const script = RESEARCH_SCRIPTS[type];
  const args = keywords.flatMap((k) => ["--keywords", k]);

  // Listen for progress events from Python script
  const unlisten = await listen<ProgressPayload>("research-progress", (event) => {
    onProgress?.(event.payload.progress);
  });

  try {
    const result = await invoke<string>("run_python_script", {
      script,
      args,
    });

    unlisten();

    // Parse the JSON output from Python script
    const resultStr = result as string;
    const parsed = JSON.parse(resultStr);

    return {
      id: crypto.randomUUID(),
      type,
      keywords: parsed.keywords || [],
      contentSuggestions: parsed.content_suggestions || [],
      seoScore: parsed.seo_score || 0,
      topCompetitors: parsed.top_competitors || [],
      generatedAt: new Date().toISOString(),
      rawOutput: resultStr,
    };
  } catch (error) {
    unlisten();
    throw error;
  }
}

export async function cancelResearch(): Promise<void> {
  // TODO: Implement cancellation via Rust command
  console.log("Research cancellation not yet implemented");
}
