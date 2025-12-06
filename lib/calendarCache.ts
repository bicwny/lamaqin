import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const CACHE_KEYS = {
  TIBETAN_CALENDAR: 'calendar_cache_tibetan',
  BUDDHIST_DAYS: 'calendar_cache_buddhist',
  LAST_SYNC: 'calendar_cache_last_sync',
};

const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }
    await AsyncStorage.removeItem(key);
  },
};

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const cached = await storage.getItem(key);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    const now = Date.now();

    if (now - entry.timestamp > CACHE_EXPIRY_MS) {
      await storage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

export async function setCachedData<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    await storage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

export async function clearCalendarCache(): Promise<void> {
  try {
    await Promise.all([
      storage.removeItem(CACHE_KEYS.TIBETAN_CALENDAR),
      storage.removeItem(CACHE_KEYS.BUDDHIST_DAYS),
      storage.removeItem(CACHE_KEYS.LAST_SYNC),
    ]);
  } catch (error) {
    console.error('Cache clear error:', error);
  }
}

export { CACHE_KEYS };
