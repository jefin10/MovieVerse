import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  updatedAt: number;
}

interface FetchWithCacheOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  ttlMs: number;
  forceRefresh?: boolean;
  persist?: boolean;
  staleIfError?: boolean;
}

const CACHE_PREFIX = 'movieverse-cache:';
const memoryCache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();

const isFresh = (entry: CacheEntry<unknown>): boolean => entry.expiresAt > Date.now();

const getStorageKey = (key: string): string => `${CACHE_PREFIX}${key}`;

const toCacheEntry = <T>(data: T, ttlMs: number): CacheEntry<T> => {
  const now = Date.now();
  return {
    data,
    updatedAt: now,
    expiresAt: now + ttlMs,
  };
};

const readMemoryEntry = <T>(key: string): CacheEntry<T> | null => {
  const entry = memoryCache.get(key) as CacheEntry<T> | undefined;
  return entry ?? null;
};

const writeMemoryEntry = <T>(key: string, entry: CacheEntry<T>): void => {
  memoryCache.set(key, entry as CacheEntry<unknown>);
};

const readPersistedEntry = async <T>(key: string): Promise<CacheEntry<T> | null> => {
  try {
    const raw = await AsyncStorage.getItem(getStorageKey(key));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (!parsed || typeof parsed !== 'object' || !('expiresAt' in parsed) || !('updatedAt' in parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const writePersistedEntry = async <T>(key: string, entry: CacheEntry<T>): Promise<void> => {
  try {
    await AsyncStorage.setItem(getStorageKey(key), JSON.stringify(entry));
  } catch {
    // Non-blocking cache write.
  }
};

const removePersistedEntry = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(getStorageKey(key));
  } catch {
    // Non-blocking cache cleanup.
  }
};

export const fetchWithCache = async <T>({
  key,
  fetcher,
  ttlMs,
  forceRefresh = false,
  persist = true,
  staleIfError = true,
}: FetchWithCacheOptions<T>): Promise<T> => {
  const memoryEntry = readMemoryEntry<T>(key);

  if (!forceRefresh && memoryEntry && isFresh(memoryEntry)) {
    return memoryEntry.data;
  }

  if (!forceRefresh && persist) {
    const persistedEntry = await readPersistedEntry<T>(key);
    if (persistedEntry && isFresh(persistedEntry)) {
      writeMemoryEntry(key, persistedEntry);
      return persistedEntry.data;
    }
  }

  const existingRequest = inFlightRequests.get(key) as Promise<T> | undefined;
  if (!forceRefresh && existingRequest) {
    return existingRequest;
  }

  const request = (async () => {
    try {
      const data = await fetcher();
      const entry = toCacheEntry(data, ttlMs);
      writeMemoryEntry(key, entry);

      if (persist) {
        await writePersistedEntry(key, entry);
      }

      return data;
    } catch (error) {
      if (staleIfError) {
        const staleMemoryEntry = readMemoryEntry<T>(key);
        if (staleMemoryEntry) {
          return staleMemoryEntry.data;
        }

        if (persist) {
          const stalePersistedEntry = await readPersistedEntry<T>(key);
          if (stalePersistedEntry) {
            writeMemoryEntry(key, stalePersistedEntry);
            return stalePersistedEntry.data;
          }
        }
      }

      throw error;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, request as Promise<unknown>);
  return request;
};

export const prefetchWithCache = async <T>(options: FetchWithCacheOptions<T>): Promise<void> => {
  try {
    await fetchWithCache(options);
  } catch {
    // Prefetch failures should not impact the active screen.
  }
};

export const invalidateCache = async (key: string): Promise<void> => {
  memoryCache.delete(key);
  inFlightRequests.delete(key);
  await removePersistedEntry(key);
};

export const invalidateCachePrefix = async (prefix: string): Promise<void> => {
  for (const key of Array.from(memoryCache.keys())) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }

  for (const key of Array.from(inFlightRequests.keys())) {
    if (key.startsWith(prefix)) {
      inFlightRequests.delete(key);
    }
  }

  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const toRemove = allKeys.filter((fullKey) => fullKey.startsWith(getStorageKey(prefix)));
    if (toRemove.length > 0) {
      await AsyncStorage.multiRemove(toRemove);
    }
  } catch {
    // Non-blocking cleanup.
  }
};
