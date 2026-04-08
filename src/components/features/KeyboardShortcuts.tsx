import { useEffect } from "react";
import { register } from "@tauri-apps/plugin-global-shortcut";
import { useHotkeys } from "react-hotkeys-hook";

export type ShortcutHandler = () => void;

interface ShortcutDefinition {
  key: string;
  handler: ShortcutHandler;
  description: string;
}

// Global shortcuts (work when app not focused)
export function useGlobalShortcut(shortcut: string, handler: ShortcutHandler) {
  useEffect(() => {
    let mounted = true;

    const registerShortcut = async () => {
      try {
        await register(shortcut, (event) => {
          if (mounted && event.state === "Pressed") {
            handler();
          }
        });
      } catch (error) {
        console.warn(`Failed to register global shortcut ${shortcut}:`, error);
      }
    };

    registerShortcut();

    return () => {
      mounted = false;
    };
  }, [shortcut, handler]);
}

// Component-level shortcuts using react-hotkeys-hook
export function useKeyboardShortcuts(shortcuts: ShortcutDefinition[]) {
  shortcuts.forEach(({ key, handler }) => {
    useHotkeys(
      key,
      (e) => {
        e.preventDefault();
        handler();
      },
      { preventDefault: true }
    );
  });
}

// Standard keyboard shortcuts
export const STANDARD_SHORTCUTS = {
  SAVE: "command+s",
  NEW: "command+n",
  SETTINGS: "command+,",
  ESCAPE: "escape",
} as const;

// Shortcut display labels
export const SHORTCUT_LABELS: Record<string, string> = {
  "command+s": "Cmd+S",
  "command+n": "Cmd+N",
  "command+,": "Cmd+,",
  "escape": "Escape",
  "ctrl+s": "Ctrl+S",
  "ctrl+n": "Ctrl+N",
  "ctrl+,": "Ctrl+,",
};
