"use client";

import { useCallback, useRef } from "react";
import { getCurrentUser, getAuthUser, saveAuthUser, clearAuth } from "@/lib/api";
import type { User } from "@/lib/api";

const RETRY_DELAY_MS = 300;

export function usePermissionRetry() {
  const retryingRef = useRef(false);

  const withRetry = useCallback(async <T,>(fn: () => Promise<T>, onRetrySuccess?: (user: User) => void, onRetryFailure?: (error: string) => void): Promise<T> => {
    try {
      const result = await fn();
      if (retryingRef.current) {
        retryingRef.current = false;
      }
      return result;
    } catch (error) {
      const message = String((error as Error)?.message ?? error ?? "");
      const statusCode = (error as { statusCode?: number })?.statusCode;
      const isPermissionError = statusCode === 403 || /permission/i.test(message);

      if (!isPermissionError || retryingRef.current) {
        throw error;
      }

      retryingRef.current = true;
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));

      const me = await getCurrentUser();
      if (me.data) {
        const refreshedUser = me.data as User;
        const mergedUser = { ...(getAuthUser() ?? {} as User), ...refreshedUser };
        saveAuthUser(mergedUser);
        onRetrySuccess?.(mergedUser);
        try {
          const retryResult = await fn();
          retryingRef.current = false;
          return retryResult;
        } catch (retryError) {
          retryingRef.current = false;
          const retryMessage = String((retryError as Error)?.message ?? retryError ?? "");
          onRetryFailure?.(retryMessage);
          throw retryError;
        }
      }

      retryingRef.current = false;
      clearAuth();
      onRetryFailure?.("Session expired. Please sign in again.");
      throw new Error("Session expired. Please sign in again.");
    }
  }, []);

  return { withRetry };
}
