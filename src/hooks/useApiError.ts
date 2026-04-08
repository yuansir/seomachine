"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

export type ErrorCategory = "network" | "script" | "timeout" | "auth" | "unknown";

export interface ApiErrorState {
  error: string | null;
  category: ErrorCategory;
  retryable: boolean;
}

/**
 * Hook for centralized API error handling
 * Provides error state management and toast notification integration
 */
export function useApiError() {
  const [errorState, setErrorState] = useState<ApiErrorState>({
    error: null,
    category: "unknown",
    retryable: false,
  });

  const handleError = useCallback((error: unknown, retryFn?: () => void) => {
    let message: string;
    let category: ErrorCategory = "unknown";
    let retryable = false;

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    } else {
      message = "发生未知错误";
    }

    // Categorize errors based on message patterns
    const msgLower = message.toLowerCase();
    if (msgLower.includes("network") || msgLower.includes("connection")) {
      category = "network";
      retryable = true;
    } else if (msgLower.includes("script") || msgLower.includes("python")) {
      category = "script";
    } else if (msgLower.includes("timeout") || msgLower.includes("超时")) {
      category = "timeout";
      retryable = true;
    } else if (msgLower.includes("api") || msgLower.includes("key") || msgLower.includes("auth")) {
      category = "auth";
      retryable = false;
    }

    setErrorState({ error: message, category, retryable });

    // Show toast with appropriate options
    if (retryable && retryFn) {
      toast.error(message, {
        description: "点击重试",
        action: {
          label: "重试",
          onClick: retryFn,
        },
      });
    } else {
      toast.error(message);
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorState({ error: null, category: "unknown", retryable: false });
  }, []);

  return {
    ...errorState,
    handleError,
    clearError,
  };
}
