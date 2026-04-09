import { useState, useEffect } from "react";
import { Play, Save, FileText, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWriteStore } from "@/stores/useWriteStore";
import { useNavigationStore } from "@/stores/useNavigationStore";
import { useLLMProviderStore } from "@/stores/useLLMProviderStore";
import { createDeepSeekProvider, createOpenAICompatProvider } from "@/lib/llm";
import { listResearchFromDB, type DBResearchResult } from "@/lib/db";
import type { LLMMessage } from "@/lib/llm/types";
import type { ResearchBrief, ArticleConfig } from "@/stores/useWriteStore";
import { toast } from "sonner";
import { EmptyArticle } from "@/components/features/EmptyState";
import { ProgressBar } from "@/components/features/ProgressBar";

export function WritePage() {
  const {
    selectedBrief,
    articleConfig,
    generatedContent,
    isGenerating,
    progress,
    selectBrief,
    updateConfig,
    setGeneratedContent,
    setIsGenerating,
    setProgress,
    saveArticle,
  } = useWriteStore();

  const { navigate } = useNavigationStore();
  const [isSaving, setIsSaving] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [savedBriefs, setSavedBriefs] = useState<DBResearchResult[]>([]);

  // Load saved research briefs from DB on mount
  useEffect(() => {
    listResearchFromDB()
      .then(setSavedBriefs)
      .catch(() => {/* DB not available in dev mode */});
  }, []);

  // Abort streaming on unmount to prevent updates to unmounted component
  useEffect(() => {
    return () => {
      abortController?.abort();
    };
  }, [abortController]);

  const handleSelectBrief = (briefId: string) => {
    const dbBrief = savedBriefs.find((b) => b.id === briefId);
    if (!dbBrief) return;
    try {
      const parsed = JSON.parse(dbBrief.content) as ResearchBrief;
      selectBrief({ ...parsed, id: briefId });
    } catch {
      toast.error("研究简报数据解析失败");
    }
  };

  const handleGenerate = async () => {
    if (!selectedBrief && !articleConfig.title) {
      toast.error("请先选择一个研究简报或输入标题");
      return;
    }

    const config = useLLMProviderStore.getState();
    if (!config.isConfigured) {
      toast.error("请先在设置中配置 LLM API 密钥");
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);
    setIsGenerating(true);
    setProgress(0);
    setGeneratedContent("");

    try {
      const messages: LLMMessage[] = buildArticlePrompt(selectedBrief, articleConfig);

      const provider =
        config.provider === "deepseek"
          ? createDeepSeekProvider(config.getConfig())
          : createOpenAICompatProvider(config.getConfig());

      const generated = await provider.generate(messages, {
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        signal: controller.signal,
        onChunk: (text) => setGeneratedContent(text),
        onProgress: (p) => setProgress(p),
      });

      setGeneratedContent(generated);
      toast.success("文章生成完成！");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        toast.info("生成已取消");
      } else {
        toast.error(`生成失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    } finally {
      setIsGenerating(false);
      setAbortController(null);
    }
  };

  function buildArticlePrompt(brief: ResearchBrief | null, config: ArticleConfig): LLMMessage[] {
    const lengthMap = { short: "~500字", medium: "~1000字", long: "~2000字" };
    const styleMap = { professional: "专业正式", conversational: "通俗易懂", technical: "技术深入" };

    const systemPrompt = `你是一个专业的SEO文章写作助手。请根据用户提供的关键词和研究数据，生成一篇SEO优化的高质量文章。

要求：
- 文章结构清晰，包含H1、H2、H3标题（使用Markdown格式）
- 内容深度足够，有实际价值
- 适当融入关键词，但不要堆砌
- 包含内部链接和外部链接的建议（用Markdown格式）
- 字数要求：${lengthMap[config.length]}
- 风格：${styleMap[config.style]}`;

    const userContent = brief
      ? `关键词：${brief.keywords.map((k) => k.keyword).join(", ")}
SEO评分：${brief.seoScore}/100
内容建议：${brief.contentSuggestions.map((s) => `- ${s.title}: ${s.metaDescription}`).join("\n")}`
      : `文章标题：${config.title}`;

    return [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ];
  }

  const handleSave = async () => {
    if (!generatedContent) return;
    setIsSaving(true);
    try {
      const article = await saveArticle();
      if (article) {
        toast.success("文章已保存！");
        navigate("editor", { articleId: article.id });
      }
    } catch (error) {
      toast.error(`保存失败: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenInEditor = () => {
    if (!generatedContent) return;
    // Navigate to editor, content will be pre-loaded from Write store
    navigate("editor");
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">文章撰写</h1>
        <p className="text-slate-500">基于研究简报生成 SEO 优化内容</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>研究简报</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={selectedBrief?.id ?? ""}
                onValueChange={(v) => v && handleSelectBrief(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择已保存的研究简报..." />
                </SelectTrigger>
                <SelectContent>
                  {savedBriefs.length === 0 && (
                    <SelectItem value="_none" disabled>
                      暂无已保存的研究简报
                    </SelectItem>
                  )}
                  {savedBriefs.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.topic} ({b.researchType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedBrief && (
                <div className="text-sm text-slate-500">
                  <p>关键词: {selectedBrief.keywords.slice(0, 3).map((k) => k.keyword).join(", ")}</p>
                  <p className="mt-1">SEO 评分: {selectedBrief.seoScore}/100</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>文章配置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">自定义标题</label>
                <Input
                  value={articleConfig.title}
                  onChange={(e) => updateConfig({ title: e.target.value })}
                  placeholder="文章标题（可选）"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">文章长度</label>
                <Select
                  value={articleConfig.length}
                  onValueChange={(v) => updateConfig({ length: v as "short" | "medium" | "long" })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">短篇 (~500字)</SelectItem>
                    <SelectItem value="medium">中篇 (~1000字)</SelectItem>
                    <SelectItem value="long">长篇 (~2000字)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">内容风格</label>
                <Select
                  value={articleConfig.style}
                  onValueChange={(v) =>
                    updateConfig({ style: v as "professional" | "conversational" | "technical" })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">专业</SelectItem>
                    <SelectItem value="conversational">通俗</SelectItem>
                    <SelectItem value="technical">技术</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={isGenerating ? () => abortController?.abort() : handleGenerate}
            disabled={!isGenerating && !selectedBrief && !articleConfig.title}
            className="w-full"
            size="lg"
            variant={isGenerating ? "destructive" : "default"}
          >
            {isGenerating ? (
              <>
                <X className="h-4 w-4 mr-2" />
                取消生成
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                生成文章
              </>
            )}
          </Button>

          {isGenerating && <ProgressBar value={progress} />}
        </div>

        {/* Right: Preview */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>文章预览</CardTitle>
              {generatedContent && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <><Loader2 className="h-4 w-4 mr-1 animate-spin" />保存中...</>
                    ) : (
                      <><Save className="h-4 w-4 mr-1" />保存到数据库</>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleOpenInEditor}>
                    <FileText className="h-4 w-4 mr-1" />
                    在编辑器中打开
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {generatedContent ? (
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm font-sans">{generatedContent}</pre>
                </div>
              ) : (
                <EmptyArticle />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
