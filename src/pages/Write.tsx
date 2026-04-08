import { useState } from "react";
import { Play, Save, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useWriteStore } from "@/stores/useWriteStore";
import { useResearchStore } from "@/stores/useResearchStore";
import { toast } from "sonner";

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

  const { results: savedResearch } = useResearchStore();
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectBrief = (briefId: string) => {
    if (savedResearch && savedResearch.id === briefId) {
      selectBrief(savedResearch);
    }
  };

  const handleGenerate = async () => {
    if (!selectedBrief && !articleConfig.title) {
      toast.error("请先选择一个研究简报或输入标题");
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate generation progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setProgress(i);
      }

      // Placeholder for generated content
      const generated = `# ${articleConfig.title || selectedBrief?.keywords[0]?.keyword || "Generated Article"}

This is a placeholder for the generated article content. In a full implementation, this would call the Claude API.

## Introduction

Based on the research data, this article aims to provide comprehensive coverage.

## Key Points

${selectedBrief?.contentSuggestions.map((s) => `- ${s.title}`).join("\n") || "- Point 1\n- Point 2"}

## Conclusion

This article provides actionable insights.
`;

      setGeneratedContent(generated);
      toast.success("文章生成完成！");
    } catch (error) {
      toast.error(`生成失败: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const article = await saveArticle();
      if (article) {
        toast.success("文章已保存");
      }
    } catch (error) {
      toast.error(`保存失败: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenInEditor = () => {
    toast.info("将在编辑器中打开...");
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
                value={selectedBrief?.id || ""}
                onValueChange={(v) => v && handleSelectBrief(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择研究简报..." />
                </SelectTrigger>
                <SelectContent>
                  {savedResearch && (
                    <SelectItem value={savedResearch.id}>
                      {savedResearch.keywords[0]?.keyword || "当前研究"}
                    </SelectItem>
                  )}
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
                  placeholder="文章标题..."
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
                  onValueChange={(v) => updateConfig({ style: v as "professional" | "conversational" | "technical" })}
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
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                生成中... {progress}%
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                生成文章
              </>
            )}
          </Button>

          {isGenerating && <Progress value={progress} className="mt-2" />}
        </div>

        {/* Right: Preview */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>文章预览</CardTitle>
              {generatedContent && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-1" />
                    {isSaving ? "保存中..." : "保存"}
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
                  <pre className="whitespace-pre-wrap text-sm font-sans">
                    {generatedContent}
                  </pre>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>生成的文章将显示在这里</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
