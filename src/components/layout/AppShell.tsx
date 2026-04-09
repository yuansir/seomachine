import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface AppShellProps {
  children: React.ReactNode;
  onOpenSettings?: () => void;
}

export function AppShell({ children, onOpenSettings }: AppShellProps) {
  return (
    <div className="flex h-screen bg-white dark:bg-slate-900">
      <Sidebar onOpenSettings={onOpenSettings} />
      <div className="flex flex-col flex-1">
        <Header onOpenSettings={onOpenSettings} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
