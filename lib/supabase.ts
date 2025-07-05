import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
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