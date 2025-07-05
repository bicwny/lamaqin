import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Create a custom storage adapter that handles web environments
const createCustomStorage = () => {
  // Check if we're in a web environment
  if (Platform.OS === 'web') {
    // For web, use localStorage if available, otherwise use a fallback
    if (typeof window !== 'undefined' && window.localStorage) {
      return {
        getItem: (key: string) => {
          try {
            return Promise.resolve(window.localStorage.getItem(key));
          } catch {
            return Promise.resolve(null);
          }
        },
        setItem: (key: string, value: string) => {
          try {
            window.localStorage.setItem(key, value);
            return Promise.resolve();
          } catch {
            return Promise.resolve();
          }
        },
        removeItem: (key: string) => {
          try {
            window.localStorage.removeItem(key);
            return Promise.resolve();
          } catch {
            return Promise.resolve();
          }
        },
      };
    } else {
      // Fallback for server-side rendering
      return {
        getItem: () => Promise.resolve(null),
        setItem: () => Promise.resolve(),
        removeItem: () => Promise.resolve(),
      };
    }
  } else {
    // For React Native, use AsyncStorage
    return AsyncStorage;
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createCustomStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
    flowType: 'pkce',
    storageKey: 'sb-repl-auth-token',
    debug: false,
  },
});

// Test function to verify connection
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from("practices")
      .select("name")
      .limit(5);

    if (error) {
      console.error("Supabase connection error:", error);
      return false;
    }

    console.log("✅ Supabase connected! Found practices:", data);
    return true;
  } catch (err) {
    console.error("Connection test failed:", err);
    return false;
  }
}