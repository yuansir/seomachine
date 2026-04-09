import { useState, useEffect } from "react";
import { Save, Download, Copy, Undo, Redo, Bold, Italic, List, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useEditorStore } from "@/stores/useEditorStore";
import { useNavigationStore } from "@/stores/useNavigationStore";
import { useWriteStore } from "@/stores/useWriteStore";
import { getArticleFromDB } from "@/lib/db";
import { toast } from "sonner";

export function EditorPage() {
  const {
    currentArticle,
    content,
    isDirty,
    history,
    historyIndex,
    loadArticle,
    updateTitle,
    updateContent,
    saveArticle,
    undo,
    redo,
  } = useEditorStore();

  const { editorArticleId } = useNavigationStore();
  const { generatedContent } = useWriteStore();

  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Load article from DB when navigated with an ID
  useEffect(() => {
    if (!editorArticleId) {
      // If no DB id but we have just-generated content, load it into the editor
      if (generatedContent && !currentArticle) {
        loadArticle({
          id: crypto.randomUUID(),
          title: "未命名文章",
          content: generatedContent,
          status: "draft",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      return;
    }

    setIsLoading(true);
    getArticleFromDB(editorArticleId)
      .then((article) => {
        if (article) {
          loadArticle({
            id: article.id,
            title: article.title,
            content: article.content,
            briefId: article.briefId,
            status: article.status,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
          });
        } else {
          toast.error("文章不存在");
        }
      })
      .catch(() => toast.error("加载文章失败"))
      .finally(() => setIsLoading(false));
  }, [editorArticleId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveArticle();
      toast.success("文章已保存");
    } catch (error) {
      toast.error(`保存失败: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(content);
    toast.success("已复制到剪贴板");
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentArticle?.title || "article"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("导出成功");
  };

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText =
      content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
    updateContent(newText);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1">
          <Input
            value={currentArticle?.title ?? ""}
            onChange={(e) => {
              if (currentArticle) {
                updateTitle(e.target.value);
              }
            }}
            placeholder="文章标题..."
            className="text-2xl font-semibold border-none focus:ring-0 px-0"
          />
          {isDirty && (
            <span className="text-sm text-amber-500 mt-1 block">未保存的更改</span>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? (
              <><Loader2 className="h-4 w-4 mr-1 animate-spin" />保存中...</>
            ) : (
              <><Save className="h-4 w-4 mr-1" />保存</>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
            <Copy className="h-4 w-4 mr-1" />
            复制
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportMarkdown}>
            <Download className="h-4 w-4 mr-1" />
            导出
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo}>
          <Redo className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600" />
        <Button variant="ghost" size="sm" onClick={() => insertMarkdown("**", "**")}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertMarkdown("*", "*")}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertMarkdown("\n- ")}>
          <List className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button
          variant={showPreview ? "default" : "outline"}
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
        >
          <FileText className="h-4 w-4 mr-1" />
          预览
        </Button>
      </div>

      {/* Editor */}
      <div className={showPreview ? "grid grid-cols-2 gap-4" : ""}>
        <Card>
          <CardContent className="p-0">
            <Textarea
              value={content}
              onChange={(e) => updateContent(e.target.value)}
              placeholder="开始撰写..."
              className="min-h-[500px] font-mono text-sm border-0 focus:ring-0 resize-none"
            />
          </CardContent>
        </Card>

        {showPreview && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">预览</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm">{content}</pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
