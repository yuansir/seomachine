"use client";

import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Error fallback component for react-error-boundary
 * Displays a user-friendly error message with retry option
 */
function Fallback({ error, resetErrorBoundary }: FallbackProps) {
  const errorMessage = error instanceof Error ? error.message : "发生了未知错误";
  return (
    <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
            出错了
          </h3>
          <p className="mt-2 text-sm text-red-600 dark:text-red-300">
            {errorMessage}
          </p>
          <Button
            onClick={resetErrorBoundary}
            variant="outline"
            className="mt-4 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            重试
          </Button>
        </div>
      </div>
    </Card>
  );
}

/**
 * Global error boundary wrapper for the application
 * Catches React render errors and displays fallback UI
 */
export function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={Fallback}
      onReset={() => {
        // Log reset for debugging
        console.log("Error boundary reset");
      }}
      onError={(error) => {
        // Log errors for debugging
        console.error("Uncaught error:", error);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
