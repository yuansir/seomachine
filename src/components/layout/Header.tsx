import { Sun, Moon, Settings } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface HeaderProps {
  onOpenSettings?: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="text-sm text-slate-500 dark:text-slate-400">SEO Machine</div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 text-slate-600" />
          ) : (
            <Sun className="w-5 h-5 text-slate-400" />
          )}
        </button>
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
      </div>
    </header>
  );
}
