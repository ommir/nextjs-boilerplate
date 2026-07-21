"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Persist a piece of React state to `localStorage`, kept in sync across tabs.
 * Falls back to `initialValue` during SSR and when parsing fails.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): readonly [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Hydrate from storage after mount to stay SSR-safe.
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) setStoredValue(JSON.parse(item) as T);
    } catch {
      // Corrupt/unavailable storage — keep the initial value.
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Ignore write failures (private mode, quota).
        }
        return next;
      });
    },
    [key],
  );

  // Reflect changes made in other tabs.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue) as T);
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  return [storedValue, setValue] as const;
}
