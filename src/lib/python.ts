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
  keywords: string[]
): Promise<ResearchResult> {
  const script = RESEARCH_SCRIPTS[type];
  const args = keywords.flatMap((k) => ["--keywords", k]);

  // Listen for progress events
  const unlisten = await listen<ProgressPayload>("research-progress", (event) => {
    console.log(`Progress: ${event.payload.progress}% - ${event.payload.message}`);
  });

  try {
    const result = await invoke<string>("run_python_script", {
      script,
      args,
    });

    // Parse the JSON output from Python script
    const parsed = JSON.parse(result);

    return {
      id: crypto.randomUUID(),
      type,
      keywords: parsed.keywords || [],
      contentSuggestions: parsed.content_suggestions || [],
      seoScore: parsed.seo_score || 0,
      topCompetitors: parsed.top_competitors || [],
      generatedAt: new Date().toISOString(),
      rawOutput: result,
    };
  } finally {
    unlisten();
  }
}

export async function cancelResearch(): Promise<void> {
  // TODO: Implement cancellation via Rust command
  console.log("Research cancellation not yet implemented");
}
