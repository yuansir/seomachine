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

const navItems = [
  { icon: FileText, label: "研究", href: "/research" },
  { icon: PenTool, label: "撰写", href: "/write" },
  { icon: Edit3, label: "编辑器", href: "/editor" },
  { icon: FolderOpen, label: "文章", href: "/articles" },
  { icon: BarChart2, label: "分析", href: "/analysis" },
  { icon: Upload, label: "发布", href: "/publish" },
  { icon: Settings, label: "设置", href: "/settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

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
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </a>
        ))}
      </nav>
    </aside>
  );
}
