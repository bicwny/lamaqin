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

// Test function to verify connection with detailed diagnostics
export async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    console.log('📋 Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
    console.log('🔑 Supabase Key:', supabaseAnonKey ? 'Set' : 'Missing');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Missing Supabase environment variables');
      return false;
    }

    // Test with a timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout (10s)')), 10000);
    });

    const connectionTest = supabase
      .from("practices")
      .select("name")
      .limit(1);

    const result = await Promise.race([connectionTest, timeoutPromise]) as Awaited<typeof connectionTest>;
    const { data, error } = result;

    if (error) {
      console.error("❌ Supabase connection error:", error);
      console.error("🔍 Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return false;
    }

    console.log("✅ Supabase connected! Found practices:", data?.length || 0);
    return true;
  } catch (err) {
    console.error("❌ Connection test failed:", err);
    console.error("🔍 Error type:", err instanceof Error ? err.constructor.name : typeof err);
    console.error("🔍 Error message:", err instanceof Error ? err.message : String(err));
    return false;
  }
}