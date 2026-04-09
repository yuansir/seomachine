import { useState, useEffect, useCallback } from "react";
import { Play, AlertCircle, CheckCircle, AlertTriangle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAnalysisStore, type AnalysisType, type AnalysisResults } from "@/stores/useAnalysisStore";
import { useEditorStore, type Article } from "@/stores/useEditorStore";
import { listArticlesFromDB } from "@/lib/db";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { EmptyAnalysis } from "@/components/features/EmptyState";
import { ProgressBar } from "@/components/features/ProgressBar";

function ScoreGauge({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-slate-200 dark:text-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={score >= 70 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500"}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-2xl font-bold">{score}</span>
        <span className="text-xs text-slate-500">/ 100</span>
      </div>
    </div>
  );
}

function SuggestionItem({ suggestion }: { suggestion: AnalysisResults["suggestions"][0] }) {
  const Icon = suggestion.type === "positive" ? CheckCircle : suggestion.type === "warning" ? AlertTriangle : AlertCircle;
  const colorClass = suggestion.type === "positive" ? "text-green-500" : suggestion.type === "warning" ? "text-yellow-500" : "text-red-500";

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
      <Icon className={`h-5 w-5 mt-0.5 ${colorClass}`} />
      <div className="flex-1">
        <div className="font-medium text-sm">{suggestion.category}</div>
        <div className="text-sm text-slate-600 dark:text-slate-300">{suggestion.message}</div>
        {suggestion.currentValue && suggestion.recommendedValue && (
          <div className="mt-1 text-xs text-slate-500">
            当前: {suggestion.currentValue} → 推荐: {suggestion.recommendedValue}
          </div>
        )}
      </div>
    </div>
  );
}

export function AnalysisPage() {
  const {
    selectedArticleId,
    analysisType,
    results,
    isAnalyzing,
    progress,
    setSelectedArticle,
    setAnalysisType,
    runAnalysis,
  } = useAnalysisStore();

  const { currentArticle } = useEditorStore();
  const [selectedArticle, setSelectedArticleLocal] = useState<Article | null>(null);
  const [dbArticles, setDbArticles] = useState<Article[]>([]);

  const loadDbArticles = useCallback(async () => {
    try {
      const rows = await listArticlesFromDB();
      setDbArticles(
        rows.map((r) => ({
          id: r.id,
          title: r.title,
          content: r.content,
          briefId: r.briefId,
          status: r.status,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        }))
      );
    } catch {
      // DB may not be available in dev mode
    }
  }, []);

  useEffect(() => {
    loadDbArticles();
  }, [loadDbArticles]);

  const handleStartAnalysis = async () => {
    const article = selectedArticle || currentArticle;
    if (!article) {
      toast.error("请先选择要分析的文章");
      return;
    }

    await runAnalysis(article.content);
    if (useAnalysisStore.getState().error) {
      toast.error(`分析失败: ${useAnalysisStore.getState().error}`);
    } else {
      toast.success("分析完成！");
    }
  };

  const handleSelectArticle = (id: string) => {
    const article = dbArticles.find((a) => a.id === id) || (currentArticle?.id === id ? currentArticle : null);
    setSelectedArticleLocal(article ?? null);
    setSelectedArticle(id);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">SEO 分析</h1>
        <p className="text-slate-500">分析文章 SEO 表现，获取优化建议</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>选择文章</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedArticleId || ""} onValueChange={(v) => v && handleSelectArticle(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择文章..." />
                </SelectTrigger>
                <SelectContent>
                  {currentArticle && (
                    <SelectItem key={currentArticle.id} value={currentArticle.id}>
                      {currentArticle.title} (当前)
                    </SelectItem>
                  )}
                  {dbArticles
                    .filter((a) => a.id !== currentArticle?.id)
                    .map((article) => (
                      <SelectItem key={article.id} value={article.id}>
                        {article.title}
                      </SelectItem>
                    ))}
                  {dbArticles.length === 0 && !currentArticle && (
                    <SelectItem value="_none" disabled>
                      暂无文章
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              {selectedArticle && (
                <div className="text-sm text-slate-500">
                  <p>状态: <Badge variant={selectedArticle.status === "published" ? "default" : "secondary"}>{selectedArticle.status}</Badge></p>
                  <p>创建: {selectedArticle.createdAt}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>分析类型</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={analysisType} onValueChange={(v) => setAnalysisType(v as AnalysisType)}>
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="keyword">关键词</TabsTrigger>
                  <TabsTrigger value="readability">可读性</TabsTrigger>
                  <TabsTrigger value="seo">SEO 质量</TabsTrigger>
                  <TabsTrigger value="comprehensive">综合</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          <Button
            onClick={handleStartAnalysis}
            disabled={isAnalyzing || (!selectedArticleId && !currentArticle)}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <BarChart3 className="h-4 w-4 mr-2 animate-spin" />
                分析中... {progress}%
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                开始分析
              </>
            )}
          </Button>

          {isAnalyzing && <ProgressBar value={progress} />}
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-2 space-y-6">
          {results ? (
            <>
              {/* Overall Score */}
              <Card>
                <CardHeader>
                  <CardTitle>综合评分</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-8">
                  <ScoreGauge score={results.overallScore} size={160} />
                </CardContent>
              </Card>

              {/* Scores Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">SEO 质量</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center">
                    <ScoreGauge score={results.seoQualityScore.score} size={100} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">可读性</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center">
                    <ScoreGauge score={results.readabilityScore.score} size={100} />
                  </CardContent>
                </Card>
              </div>

              {/* Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle>优化建议</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {results.suggestions.map((suggestion, i) => (
                    <SuggestionItem key={i} suggestion={suggestion} />
                  ))}
                </CardContent>
              </Card>

              {/* Keyword Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>关键词分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 border-b">
                        <th className="pb-2">关键词</th>
                        <th className="pb-2">密度</th>
                        <th className="pb-2">出现次数</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.keywordAnalysis.map((kw, i) => (
                        <tr key={i} className="border-b dark:border-slate-700">
                          <td className="py-2 font-medium">{kw.keyword}</td>
                          <td className="py-2">{kw.density}%</td>
                          <td className="py-2">{kw.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </>
          ) : (
            <EmptyAnalysis />
          )}
        </div>
      </div>
    </div>
  );
}
