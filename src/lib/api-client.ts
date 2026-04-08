import { QueryClient } from "@tanstack/react-query";

/**
 * API Error class with status code and retryable flag
 */
export class ApiError extends Error {
  status: number;
  retryable: boolean;

  constructor(message: string, status: number, retryable?: boolean) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    // Retry on 5xx errors, network errors, and 429 (rate limit)
    this.retryable = retryable ?? (status >= 500 || status === 429);
  }
}

/**
 * Check if an HTTP status code is retryable
 */
export function isRetryable(status: number): boolean {
  return status >= 500 || status === 429 || status === 0; // 0 = network error
}

/**
 * Check if we're online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Exponential backoff delay calculator
 */
export function getRetryDelay(attempt: number): number {
  // Exponential backoff: 1000ms * 2^attempt, max 30 seconds
  return Math.min(1000 * Math.pow(2, attempt), 30000);
}

// Default QueryClient with retry configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => getRetryDelay(attemptIndex),
      staleTime: 5 * 60 * 1000, // 5 minutes
      networkMode: "offlineFirst",
    },
    mutations: {
      retry: 1,
      retryDelay: (attemptIndex) => getRetryDelay(attemptIndex),
      networkMode: "offlineFirst",
    },
  },
});

/**
 * Network status change callback type
 */
export type NetworkChangeCallback = (online: boolean) => void;

/**
 * Listen for network status changes
 */
const networkListeners = new Set<NetworkChangeCallback>();

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    networkListeners.forEach((callback) => callback(true));
  });
  window.addEventListener("offline", () => {
    networkListeners.forEach((callback) => callback(false));
  });
}

/**
 * Subscribe to network status changes
 * @returns unsubscribe function
 */
export function onNetworkChange(callback: NetworkChangeCallback): () => void {
  networkListeners.add(callback);
  // Immediately call with current status
  callback(isOnline());
  return () => {
    networkListeners.delete(callback);
  };
}
