import { useState } from "react";
import { FileText, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useEditorStore, type Article } from "@/stores/useEditorStore";
import { toast } from "sonner";

// Mock articles
const mockArticles: Article[] = [
  { id: "1", title: "SEO 最佳实践指南", content: "# SEO 最佳实践...\n\n这是一篇关于 SEO 的文章...", status: "draft", createdAt: "2024-01-15", updatedAt: "2024-01-15" },
  { id: "2", title: "内容营销完整教程", content: "# 内容营销...\n\n内容营销是...", status: "published", createdAt: "2024-01-10", updatedAt: "2024-01-12" },
  { id: "3", title: "关键词研究入门", content: "# 关键词研究...\n\n关键词研究是...", status: "draft", createdAt: "2024-01-08", updatedAt: "2024-01-09" },
  { id: "4", title: "技术 SEO 清单", content: "# 技术 SEO...\n\n技术 SEO 包括...", status: "published", createdAt: "2024-01-05", updatedAt: "2024-01-06" },
];

export function ArticlesPage() {
  const { loadArticle } = useEditorStore();
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "published">("all");

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || article.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (article: Article) => {
    loadArticle(article);
    toast.success(`已加载文章: ${article.title}`);
    // Navigate to editor - in real app would use router
  };

  const handleDelete = (id: string) => {
    setArticles(articles.filter((a) => a.id !== id));
    toast.success("文章已删除");
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
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
            >
              全部
            </Button>
            <Button
              variant={filterStatus === "draft" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("draft")}
            >
              草稿
            </Button>
            <Button
              variant={filterStatus === "published" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("published")}
            >
              已发布
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      <div className="space-y-4">
        {filteredArticles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-500">没有找到文章</p>
            </CardContent>
          </Card>
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
                    创建于 {article.createdAt} · 更新于 {article.updatedAt}
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
