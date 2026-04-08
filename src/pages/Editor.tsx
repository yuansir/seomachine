import { useState, useEffect } from "react";
import { Save, Download, Copy, Undo, Redo, Bold, Italic, List, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useEditorStore, type Article } from "@/stores/useEditorStore";
import { toast } from "sonner";

interface EditorPageProps {
  articleId?: string;
}

export function EditorPage({ articleId }: EditorPageProps) {
  const {
    currentArticle,
    content,
    isDirty,
    history,
    historyIndex,
    loadArticle,
    updateContent,
    saveArticle,
    undo,
    redo,
  } = useEditorStore();

  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Load article if ID provided
  useEffect(() => {
    if (articleId) {
      // TODO: Load from database
      const mockArticle: Article = {
        id: articleId,
        title: "Sample Article",
        content: "# Sample Article\n\nStart writing your content here...",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "draft",
      };
      loadArticle(mockArticle);
    }
  }, [articleId, loadArticle]);

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
    a.click();
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
      content.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      content.substring(end);

    updateContent(newText);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1">
          <Input
            value={currentArticle?.title || ""}
            onChange={(e) => {
              if (currentArticle) {
                loadArticle({ ...currentArticle, title: e.target.value });
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
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? "保存中..." : "保存"}
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
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
        >
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
