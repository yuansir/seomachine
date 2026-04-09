import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Menu,
  FileText,
  PenTool,
  Edit3,
  BarChart2,
  Upload,
  Settings,
  FolderOpen,
} from "lucide-react";
import { useNavigationStore, type Page } from "@/stores/useNavigationStore";

interface NavItem {
  icon: React.ElementType;
  label: string;
  page: Page | "settings";
}

const navItems: NavItem[] = [
  { icon: FileText, label: "研究", page: "research" },
  { icon: PenTool, label: "撰写", page: "write" },
  { icon: Edit3, label: "编辑器", page: "editor" },
  { icon: FolderOpen, label: "文章", page: "articles" },
  { icon: BarChart2, label: "分析", page: "analysis" },
  { icon: Upload, label: "发布", page: "publish" },
  { icon: Settings, label: "设置", page: "settings" },
];

interface SidebarProps {
  onOpenSettings?: () => void;
}

export function Sidebar({ onOpenSettings }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { currentPage, navigate } = useNavigationStore();

  const handleNavClick = (page: Page | "settings") => {
    if (page === "settings") {
      onOpenSettings?.();
    } else {
      navigate(page);
    }
  };

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 transition-all duration-200",
        collapsed ? "w-16" : "w-[200px]"
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        {!collapsed && <span className="font-semibold text-slate-900 dark:text-slate-100">SEO Machine</span>}
        <Menu
          className="w-5 h-5 cursor-pointer text-slate-600 dark:text-slate-400"
          onClick={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-2">
        {navItems.map((item) => {
          const isActive = item.page !== "settings" && currentPage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => handleNavClick(item.page)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

