import { create } from 'zustand';

export type Page = "home" | "research" | "write" | "editor" | "analysis" | "publish" | "articles";

interface NavigationState {
  currentPage: Page;
  editorArticleId: string | null;
  navigate: (page: Page, options?: { articleId?: string }) => void;
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  currentPage: 'home',
  editorArticleId: null,
  navigate: (page, options) =>
    set({ currentPage: page, editorArticleId: options?.articleId ?? null }),
}));
