import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { AppShell } from "@/components/layout";
import { SettingsPanel } from "@/components/features/settings/SettingsPanel";
import { Card } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { ResearchPage } from "@/pages/Research";
import { WritePage } from "@/pages/Write";
import { EditorPage } from "@/pages/Editor";
import { AnalysisPage } from "@/pages/Analysis";
import { PublishPage } from "@/pages/Publish";
import { ArticlesPage } from "@/pages/Articles";
import { GlobalErrorBoundary } from "@/components/features/ErrorBoundary";
import { useNavigationStore } from "@/stores/useNavigationStore";

const pageTitles = {
  home: "欢迎使用 SEO Machine",
  research: "研究",
  write: "撰写",
  editor: "编辑器",
  analysis: "分析",
  publish: "发布",
  articles: "文章",
} as const;

const pageDescriptions = {
  home: "创建 SEO 优化内容的最简单方式",
  research: "研究和分析关键词",
  write: "撰写 SEO 优化内容",
  editor: "编辑和管理文章",
  analysis: "分析内容表现",
  publish: "发布内容到 WordPress",
  articles: "管理所有文章",
} as const;

function App() {
  useTheme(); // Apply theme on mount

  const { currentPage, navigate } = useNavigationStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleOpenSettings = () => {
    setSettingsOpen(true);
  };

  return (
    <GlobalErrorBoundary>
      <AppShell onOpenSettings={handleOpenSettings}>
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {pageTitles[currentPage]}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {pageDescriptions[currentPage]}
          </p>

          {currentPage === "home" && (
            <div className="mt-8 grid grid-cols-2 gap-4">
              <Card
                className="p-4 cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => setSettingsOpen(true)}
              >
                <h3 className="font-medium">开始使用</h3>
                <p className="text-sm text-slate-500 mt-1">配置 API 密钥</p>
              </Card>
              <Card
                className="p-4 cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => navigate("research")}
              >
                <h3 className="font-medium">开始研究</h3>
                <p className="text-sm text-slate-500 mt-1">分析关键词和竞争对手</p>
              </Card>
            </div>
          )}

          {currentPage === "research" && (
            <ResearchPage />
          )}

          {currentPage === "write" && (
            <WritePage />
          )}

          {currentPage === "editor" && (
            <EditorPage />
          )}

          {currentPage === "analysis" && (
            <AnalysisPage />
          )}

          {currentPage === "publish" && (
            <PublishPage />
          )}

          {currentPage === "articles" && (
            <ArticlesPage />
          )}
        </div>
      </AppShell>

      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
      <Toaster richColors position="top-right" />
    </GlobalErrorBoundary>
  );
}

export default App;