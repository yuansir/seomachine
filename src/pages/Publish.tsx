import { useState, useEffect, useCallback } from "react";
import { Upload, CheckCircle, XCircle, Loader2, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useEditorStore, type Article } from "@/stores/useEditorStore";
import { listArticlesFromDB, markArticlePublished } from "@/lib/db";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

interface PublishResult {
  success: boolean;
  post_id?: number;
  url?: string;
  message: string;
}

export function PublishPage() {
  const { currentArticle } = useEditorStore();

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [wpStatus, setWpStatus] = useState<boolean | null>(null);

  const loadArticles = useCallback(async () => {
    setIsLoadingArticles(true);
    try {
      const rows = await listArticlesFromDB();
      const list: Article[] = rows.map((r) => ({
        id: r.id,
        title: r.title,
        content: r.content,
        briefId: r.briefId,
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));
      setArticles(list);
      // Pre-select the article currently in the editor
      if (currentArticle && !selectedArticle) {
        const match = list.find((a) => a.id === currentArticle.id);
        if (match) setSelectedArticle(match);
      }
    } catch {
      setArticles([]);
    } finally {
      setIsLoadingArticles(false);
    }
  }, [currentArticle]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    checkWordPressStatus();
    loadArticles();
  }, [loadArticles]);

  const checkWordPressStatus = async () => {
    try {
      const status = await invoke<boolean>("check_wordpress_status");
      setWpStatus(status);
    } catch {
      setWpStatus(false);
    }
  };

  const handleSelectArticle = (id: string) => {
    const article = articles.find((a) => a.id === id) ?? null;
    setSelectedArticle(article);
    setPublishResult(null);
  };

  const handlePublish = async (status: "publish" | "draft") => {
    const article = selectedArticle ?? currentArticle;
    if (!article) {
      toast.error("请先选择要发布的文章");
      return;
    }

    setIsPublishing(true);
    setPublishResult(null);

    try {
      const result = await invoke<PublishResult>("publish_to_wordpress", {
        title: article.title,
        content: article.content,
        status,
      });

      setPublishResult(result);

      if (result.success) {
        toast.success("发布成功！");
        // Update article status in DB
        if (result.url && article.id) {
          await markArticlePublished(article.id, result.url);
          await loadArticles();
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      setPublishResult({ success: false, message: `发布失败: ${error}` });
      toast.error("发布失败");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">发布到 WordPress</h1>
        <p className="text-slate-500">将文章发布到你的 WordPress 网站</p>
      </div>

      {/* WordPress Status */}
      <Card className="mb-6">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            {wpStatus === null ? (
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            ) : wpStatus ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <div>
              <div className="font-medium">WordPress 连接状态</div>
              <div className="text-sm text-slate-500">
                {wpStatus === null ? "检查中..." : wpStatus ? "已连接" : "未连接，请在设置中配置"}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={checkWordPressStatus}>
            <RefreshCw className="h-4 w-4 mr-1" />
            重新检查
          </Button>
        </CardContent>
      </Card>

      {/* Article Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>选择文章</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingArticles ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : (
            <Select
              value={selectedArticle?.id ?? ""}
              onValueChange={(v) => v && handleSelectArticle(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择文章..." />
              </SelectTrigger>
              <SelectContent>
                {articles.length === 0 && (
                  <SelectItem value="_none" disabled>
                    暂无文章，请先在撰写页面生成并保存
                  </SelectItem>
                )}
                {articles.map((article) => (
                  <SelectItem key={article.id} value={article.id}>
                    {article.title}
                    {article.status === "published" ? " ✓" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {selectedArticle && (
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{selectedArticle.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    创建于 {new Date(selectedArticle.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-slate-500">
                    字数: {selectedArticle.content.length} 字符
                  </p>
                </div>
                <Badge variant={selectedArticle.status === "published" ? "default" : "secondary"}>
                  {selectedArticle.status === "published" ? "已发布" : "草稿"}
                </Badge>
              </div>
              <div className="mt-3 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                {selectedArticle.content.slice(0, 200)}...
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Publish Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>发布选项</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={() => handlePublish("publish")}
              disabled={isPublishing || (!selectedArticle && !currentArticle) || !wpStatus}
              size="lg"
            >
              {isPublishing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />发布中...</>
              ) : (
                <><Upload className="h-4 w-4 mr-2" />直接发布</>
              )}
            </Button>
            <Button
              onClick={() => handlePublish("draft")}
              disabled={isPublishing || (!selectedArticle && !currentArticle) || !wpStatus}
              variant="outline"
              size="lg"
            >
              保存为草稿
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Publish Result */}
      {publishResult && (
        <Card className={publishResult.success ? "border-green-500" : "border-red-500"}>
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              {publishResult.success ? (
                <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500 mt-0.5" />
              )}
              <div className="flex-1">
                <h3
                  className={`font-medium ${publishResult.success ? "text-green-600" : "text-red-600"}`}
                >
                  {publishResult.success ? "发布成功" : "发布失败"}
                </h3>
                <p className="text-sm text-slate-500 mt-1">{publishResult.message}</p>
                {publishResult.success && publishResult.url && (
                  <a
                    href={publishResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-sm text-blue-500 hover:text-blue-600"
                  >
                    <ExternalLink className="h-3 w-3" />
                    查看文章
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

