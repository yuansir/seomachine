import { useState, useEffect, useCallback } from "react";
import { Edit, Trash2, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useEditorStore, type Article } from "@/stores/useEditorStore";
import { useNavigationStore } from "@/stores/useNavigationStore";
import { listArticlesFromDB, deleteArticleFromDB } from "@/lib/db";
import { toast } from "sonner";
import { EmptySearch } from "@/components/features/EmptyState";

export function ArticlesPage() {
  const { loadArticle } = useEditorStore();
  const { navigate } = useNavigationStore();

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "published">("all");

  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    try {
      const rows = await listArticlesFromDB();
      setArticles(
        rows.map((r) => ({
          id: r.id,
          title: r.title,
          content: r.content,
          briefId: r.briefId,
          status: r.status,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
      );
    } catch {
      // DB may not be initialised in dev-browser mode
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || article.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (article: Article) => {
    loadArticle(article);
    navigate("editor", { articleId: article.id });
    toast.success(`已加载文章: ${article.title}`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("确认删除此文章？此操作不可撤销。")) return;
    try {
      await deleteArticleFromDB(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      toast.success("文章已删除");
    } catch (error) {
      toast.error(`删除失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">文章管理</h1>
        <p className="text-slate-500">管理所有文章和内容</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="搜索文章..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "draft", "published"] as const).map((s) => (
              <Button
                key={s}
                variant={filterStatus === s ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(s)}
              >
                {s === "all" ? "全部" : s === "draft" ? "草稿" : "已发布"}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArticles.length === 0 ? (
            <EmptySearch message={articles.length === 0 ? "暂无文章，请先撰写并保存文章" : "没有找到匹配的文章"} />
          ) : (
            filteredArticles.map((article) => (
              <Card key={article.id} className="hover:border-slate-400 transition-colors">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{article.title}</h3>
                      <Badge
                        variant={article.status === "published" ? "default" : "secondary"}
                        className="shrink-0"
                      >
                        {article.status === "published" ? "已发布" : "草稿"}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      创建于 {new Date(article.createdAt).toLocaleDateString()} · 更新于{" "}
                      {new Date(article.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(article)}
                      title="编辑"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(article.id)}
                      title="删除"
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <div className="text-2xl font-bold">{articles.length}</div>
            <div className="text-sm text-slate-500">总文章数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <div className="text-2xl font-bold">
              {articles.filter((a) => a.status === "draft").length}
            </div>
            <div className="text-sm text-slate-500">草稿</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <div className="text-2xl font-bold">
              {articles.filter((a) => a.status === "published").length}
            </div>
            <div className="text-sm text-slate-500">已发布</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
