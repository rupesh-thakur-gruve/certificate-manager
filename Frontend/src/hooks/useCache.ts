/**
 * API response caching hook with TTL.
 */

import { useRef, useCallback } from "react";

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

interface UseCacheOptions {
    ttlMs?: number; // Time to live in milliseconds
}

export function useCache<T>(options: UseCacheOptions = {}) {
    const { ttlMs = 5 * 60 * 1000 } = options; // Default 5 minutes
    const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());

    const get = useCallback(
        (key: string): T | null => {
            const entry = cacheRef.current.get(key);
            if (!entry) return null;

            const isExpired = Date.now() - entry.timestamp > ttlMs;
            if (isExpired) {
                cacheRef.current.delete(key);
                return null;
            }

            return entry.data;
        },
        [ttlMs]
    );

    const set = useCallback((key: string, data: T) => {
        cacheRef.current.set(key, {
            data,
            timestamp: Date.now(),
        });
    }, []);

    const invalidate = useCallback((key: string) => {
        cacheRef.current.delete(key);
    }, []);

    const invalidateAll = useCallback(() => {
        cacheRef.current.clear();
    }, []);

    return { get, set, invalidate, invalidateAll };
}
