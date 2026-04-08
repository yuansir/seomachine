"use client";

import { useState, useEffect } from "react";
import { isOnline, onNetworkChange } from "@/lib/api-client";

/**
 * Hook to detect network online/offline status
 * Uses navigator.onLine and event listeners for real-time updates
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState<boolean>(isOnline());

  useEffect(() => {
    // Subscribe to network changes
    const unsubscribe = onNetworkChange((isOnline) => {
      setOnline(isOnline);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return online;
}
