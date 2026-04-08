import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { AppShell } from "@/components/layout";
import { SettingsPanel } from "@/components/features/settings/SettingsPanel";
import { Card } from "@/components/ui/card";
import { ResearchPage } from "@/pages/Research";
import { WritePage } from "@/pages/Write";
import { EditorPage } from "@/pages/Editor";
import { AnalysisPage } from "@/pages/Analysis";
import { PublishPage } from "@/pages/Publish";
import { ArticlesPage } from "@/pages/Articles";

type Page = "home" | "research" | "write" | "editor" | "analysis" | "publish" | "articles" | "settings";

const pageTitles: Record<Page, string> = {
  home: "欢迎使用 SEO Machine",
  research: "研究",
  write: "撰写",
  editor: "编辑器",
  analysis: "分析",
  publish: "发布",
  articles: "文章",
  settings: "设置",
};

const pageDescriptions: Record<Page, string> = {
  home: "创建 SEO 优化内容的最简单方式",
  research: "研究和分析关键词",
  write: "撰写 SEO 优化内容",
  editor: "编辑和管理文章",
  analysis: "分析内容表现",
  publish: "发布内容到 WordPress",
  articles: "管理所有文章",
  settings: "配置应用程序设置",
};

function App() {
  useTheme(); // Apply theme on mount

  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Listen for navigation changes from sidebar
  useState(() => {
    const handleNavigation = () => {
      const path = window.location.pathname;
      if (path === "/settings") {
        setSettingsOpen(true);
      } else {
        const page = path.slice(1) as Page;
        if (page in pageTitles) {
          setCurrentPage(page);
        }
      }
    };

    // Check initial path
    handleNavigation();

    // Listen for popstate events (back/forward navigation)
    window.addEventListener("popstate", handleNavigation);

    return () => {
      window.removeEventListener("popstate", handleNavigation);
    };
  });

  const handleOpenSettings = () => {
    setSettingsOpen(true);
  };

  return (
    <>
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
                onClick={() => setCurrentPage("settings")}
              >
                <h3 className="font-medium">开始使用</h3>
                <p className="text-sm text-slate-500 mt-1">配置 API 密钥</p>
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

          {currentPage !== "home" && currentPage !== "research" && currentPage !== "write" && currentPage !== "editor" && currentPage !== "analysis" && currentPage !== "publish" && currentPage !== "articles" && (
            <div className="mt-8">
              <p className="text-slate-400">Coming Soon</p>
            </div>
          )}
        </div>
      </AppShell>

      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

export default App;