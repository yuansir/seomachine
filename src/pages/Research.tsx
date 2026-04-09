import { useState } from "react";
import { Search, Play, Save, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useResearchStore, type ResearchType } from "@/stores/useResearchStore";
import { runResearch } from "@/lib/python";
import { saveResearchToDB } from "@/lib/db";
import { toast } from "sonner";
import { EmptyResearch } from "@/components/features/EmptyState";
import { ProgressBar } from "@/components/features/ProgressBar";

export function ResearchPage() {
  const {
    researchType,
    keywords,
    results,
    isResearching,
    progress,
    setResearchType,
    setKeywords,
    setResults,
    setIsResearching,
    setProgress,
    clearResults,
  } = useResearchStore();

  const [keywordInput, setKeywordInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  const handleStartResearch = async () => {
    if (keywords.length === 0) {
      toast.error("请至少添加一个关键词");
      return;
    }

    setIsResearching(true);
    setProgress(0);
    clearResults();

    try {
      const result = await runResearch(researchType, keywords);
      setResults(result);
      toast.success("研究完成！");
    } catch (error) {
      toast.error(`研究失败: ${error}`);
    } finally {
      setIsResearching(false);
    }
  };

  const handleSaveResults = async () => {
    if (!results) return;
    setIsSaving(true);
    try {
      const topic = results.keywords[0]?.keyword ?? keywords[0] ?? "unknown";
      await saveResearchToDB({
        topic,
        type: results.type,
        content: JSON.stringify(results),
      });
      toast.success("研究简报已保存到数据库");
    } catch (error) {
      toast.error(`保存失败: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportResults = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `research-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("导出成功");
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">主题研究</h1>
        <p className="text-slate-500">输入关键词，获取 SEO 优化建议和内容灵感</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Research Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>研究类型</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                value={researchType}
                onValueChange={(v) => setResearchType(v as ResearchType)}
              >
                <TabsList className="w-full">
                  <TabsTrigger value="quick" className="flex-1">快速研究</TabsTrigger>
                  <TabsTrigger value="comprehensive" className="flex-1">全面研究</TabsTrigger>
                  <TabsTrigger value="competitor" className="flex-1">竞品分析</TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-sm text-slate-500 mt-3">
                {researchType === "quick" && "快速识别高价值关键词和快速获胜机会"}
                {researchType === "comprehensive" && "深入分析关键词、搜索意图和内容策略"}
                {researchType === "competitor" && "分析竞争对手的关键词策略和内容差距"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>关键词</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="输入关键词..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
                />
                <Button onClick={handleAddKeyword} variant="secondary">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {keywords.map((kw) => (
                  <Badge key={kw} variant="secondary" className="pl-2 pr-1 py-1">
                    {kw}
                    <button
                      onClick={() => handleRemoveKeyword(kw)}
                      className="ml-2 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>

              {keywords.length === 0 && (
                <p className="text-sm text-slate-400">添加关键词开始研究</p>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={handleStartResearch}
            disabled={isResearching || keywords.length === 0}
            className="w-full"
            size="lg"
          >
            {isResearching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                研究中...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                开始研究
              </>
            )}
          </Button>

          {isResearching && (
            <ProgressBar value={progress || 0} message="正在分析..." />
          )}
        </div>

        {/* Right: Results */}
        <div className="space-y-6">
          {results ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>研究结果</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveResults}
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {isSaving ? "保存中..." : "保存"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportResults}>
                      <Download className="h-4 w-4 mr-1" />
                      导出
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">SEO 评分</span>
                    <Badge variant={results.seoScore >= 70 ? "default" : "destructive"}>
                      {results.seoScore}/100
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">关键词分析</h4>
                    <div className="space-y-2">
                      {results.keywords.slice(0, 5).map((kw, i) => (
                        <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{kw.keyword}</span>
                            <span className="text-sm text-slate-500">
                              搜索量: {kw.volume.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm text-slate-500 mt-1">
                            难度: {kw.difficulty}/100
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {results.contentSuggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">内容建议</h4>
                      <div className="space-y-2">
                        {results.contentSuggestions.slice(0, 3).map((suggestion, i) => (
                          <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                            <div className="font-medium">{suggestion.title}</div>
                            <p className="text-sm text-slate-500 mt-1">
                              {suggestion.metaDescription}
                            </p>
                            <div className="text-xs text-slate-400 mt-2">
                              建议字数: {suggestion.wordCount}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <EmptyResearch />
          )}
        </div>
      </div>
    </div>
  );
}
