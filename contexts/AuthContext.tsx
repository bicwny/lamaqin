import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';

interface User {
  id: string;
  email: string;
  dharma_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithOTP: (email: string) => Promise<{ error?: string }>;
  verifyOTP: (email: string, token: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, dharmaName?: string) => Promise<{ error?: string }>;
  signUpWithOTP: (email: string, dharmaName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  forceLogoutAll: () => Promise<void>;
  clearAllCache: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkAuthState();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log('🚪 User signed out - clearing state');
          console.log('🚪 Auth event that might trigger navigation:', event);
          setUser(null);
          setLoading(false);
          try {
            await AsyncStorage.removeItem('@auth_token');
            await AsyncStorage.removeItem('@user_session');
          } catch (error) {
            console.error('Error clearing storage:', error);
          }
          return;
        }

        // Handle token refresh or initial session
        if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          console.log('🔄 Session event:', event);
          if (session?.user && session.user.email_confirmed_at) {
            console.log('✅ Session maintained for:', session.user.email);

            // Store session data
            try {
              await AsyncStorage.setItem('sb-repl-auth-token', JSON.stringify(session));
              await AsyncStorage.setItem('@user_session', JSON.stringify({
                id: session.user.id,
                email: session.user.email,
                dharma_name: session.user.user_metadata?.dharma_name,
              }));
            } catch (err) {
              console.log('⚠️ Failed to store session in event handler:', err);
            }

            // Only update user if not already set to prevent unnecessary re-renders
            if (!user || user.id !== session.user.id) {
              setUser({
                id: session.user.id,
                email: session.user.email!,
                dharma_name: session.user.user_metadata?.dharma_name,
              });
              console.log('✅ User state updated from session event');
            }
          } else if (!session) {
            console.log('⚠️ No session in refresh/initial event - checking stored session');
            // Before clearing user, check if we have a stored session
            try {
              const storedUserData = await AsyncStorage.getItem('@user_session');
              if (storedUserData && !user) {
                const userData = JSON.parse(storedUserData);
                console.log('🔄 Restoring user from stored data:', userData.email);
                setUser(userData);
              } else {
                console.log('❌ No stored session available, clearing user');
                setUser(null);
              }
            } catch (err) {
              console.log('⚠️ Error checking stored session:', err);
              setUser(null);
            }
          }
          setLoading(false);
          return;
        }

        // Handle successful authentication
        if (event === 'SIGNED_IN') {
          if (session?.user && session.user.email_confirmed_at) {
            console.log('✅ Found verified session for:', session.user.email);

            // Set user immediately
            setUser({
              id: session.user.id,
              email: session.user.email!,
              dharma_name: session.user.user_metadata?.dharma_name,
            });
            console.log('✅ User state set successfully');

            // Database sync is optional and non-blocking
            ensureUserInDatabase(session.user).catch(err => {
              console.log('⚠️ Database sync failed but continuing:', err.message);
            });
          } else if (session?.user && !session.user.email_confirmed_at) {
            console.log('⏳ User exists but email not verified');
            setUser(null);
          } else {
            console.log('ℹ️ No valid session');
            setUser(null);
          }
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthState = async () => {
    try {
      console.log('🔍 Checking auth state...');
      setLoading(true);

      // First try to get session from storage directly
      let storedSession = null;
      try {
        // Use conditional storage access for web compatibility
        if (typeof window !== 'undefined') {
          const storedData = await AsyncStorage.getItem('sb-repl-auth-token');
          if (storedData) {
            console.log('📦 Found session data in storage');
            storedSession = JSON.parse(storedData);
          }
        }
      } catch (storageError) {
        console.log('⚠️ Error reading from storage:', storageError);
      }

      // Then get session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('❌ Auth session error:', error);
        setUser(null);
        setLoading(false);
        return;
      }

      // Validate session
      const validSession = session?.user && session.user.email_confirmed_at;
      const hasStoredSession = storedSession && storedSession.access_token;

      if (validSession) {
        console.log('✅ Found verified session for:', session.user.email);

        // Store session data manually to ensure persistence
        try {
          if (typeof window !== 'undefined') {
            await AsyncStorage.setItem('sb-repl-auth-token', JSON.stringify(session));
            await AsyncStorage.setItem('@user_session', JSON.stringify({
              id: session.user.id,
              email: session.user.email,
              dharma_name: session.user.user_metadata?.dharma_name,
            }));
            console.log('💾 Session stored successfully');
          }
        } catch (storageError) {
          console.log('⚠️ Failed to store session:', storageError);
        }

        // Set user state
        setUser({
          id: session.user.id,
          email: session.user.email!,
          dharma_name: session.user.user_metadata?.dharma_name,
        });
        console.log('✅ User state set successfully');

        // Create user in database if doesn't exist (non-blocking)
        ensureUserInDatabase(session.user).catch(err => {
          console.log('⚠️ Database sync failed but continuing:', err.message);
        });
      } else if (hasStoredSession && storedSession.user) {
        console.log('🔄 Using stored session data for:', storedSession.user.email);
        // Try to restore from stored session
        setUser({
          id: storedSession.user.id,
          email: storedSession.user.email,
          dharma_name: storedSession.user.user_metadata?.dharma_name,
        });
      } else if (session?.user && !session.user.email_confirmed_at) {
        console.log('⏳ User exists but email not verified');
        setUser(null);
      } else {
        console.log('ℹ️ No existing session found');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      // Don't let auth errors prevent the app from loading
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        // Create user in database if doesn't exist
        await ensureUserInDatabase(data.user);
        setUser({
          id: data.user.id,
          email: data.user.email!,
          dharma_name: data.user.user_metadata?.dharma_name,
        });
      }

      return {};
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  const signInWithOTP = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          data: { 
            verification_type: 'code' 
          }
        }
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('OTP sign in error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  const verifyOTP = async (email: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        // Create user in database if doesn't exist
        await ensureUserInDatabase(data.user);
        setUser({
          id: data.user.id,
          email: data.user.email!,
          dharma_name: data.user.user_metadata?.dharma_name,
        });
      }

      return {};
    } catch (error) {
      console.error('OTP verification error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  const signUp = async (email: string, password: string, dharmaName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            dharma_name: dharmaName,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
          // Create user in database if doesn't exist
          await ensureUserInDatabase(data.user);
      }

      return {};
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  const signUpWithOTP = async (email: string, dharmaName?: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: {
            dharma_name: dharmaName,
            verification_type: 'code'
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('OTP sign up error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 AuthContext: signOut function called');
      console.log('🚪 Current user before logout:', user?.email);

      // Set loading to true to prevent any intermediate state issues
      setLoading(true);

      // Clear ALL possible storage locations
      console.log('🧹 AuthContext: Clearing ALL storage locations...');

      // AsyncStorage (React Native) - only if window is available
      if (typeof window !== 'undefined') {
        try {
          await AsyncStorage.removeItem('@auth_token');
          await AsyncStorage.removeItem('@user_session');
          await AsyncStorage.removeItem('@supabase_auth_token');
          await AsyncStorage.removeItem('supabase.auth.token');
          await AsyncStorage.removeItem('sb-repl-auth-token');
        } catch (storageError) {
          console.log('⚠️ Error clearing AsyncStorage:', storageError);
        }
      }

      // Web localStorage (if available)
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('supabase.auth.token');
        window.localStorage.removeItem('@auth_token');
        window.localStorage.removeItem('@user_session');
        console.log('🧹 AuthContext: Web localStorage cleared');
      }

      // Web sessionStorage (if available) 
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem('supabase.auth.token');
        window.sessionStorage.removeItem('@auth_token');
        window.sessionStorage.removeItem('@user_session');
        console.log('🧹 AuthContext: Web sessionStorage cleared');
      }

      console.log('✅ AuthContext: All storage cleared');

      // Call Supabase signOut with global scope to clear all sessions
      console.log('🔐 AuthContext: Calling Supabase signOut with global scope...');
      const { error } = await supabase.auth.signOut({
        scope: 'global'
      });

      if (error) {
        console.error('❌ AuthContext: Supabase sign out error:', error);
        // Try alternative logout method
        console.log('🔄 AuthContext: Trying alternative logout...');
        await supabase.auth.signOut();
      } else {
        console.log('✅ AuthContext: Supabase signOut completed successfully');
      }

      // Force clear user state immediately
      console.log('🔄 AuthContext: Force clearing user state...');
      setUser(null);
      setLoading(false);
      console.log('✅ AuthContext: User state cleared');

      // Force reload to ensure clean state (web only)
      if (typeof window !== 'undefined') {
        console.log('🔄 AuthContext: Forcing page reload for clean state...');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }

      console.log('🎉 AuthContext: Complete logout process finished');
    } catch (error) {
      console.error('❌ AuthContext: Logout error:', error);
      // Ensure user state is cleared regardless
      console.log('🛡️ AuthContext: Force clearing user state due to error');
      setUser(null);
      setLoading(false);

      // Force clear storage even on error
      try {
        await AsyncStorage.clear();
        if (typeof window !== 'undefined') {
          window.localStorage.clear();
          window.sessionStorage.clear();
        }
      } catch (clearError) {
        console.error('❌ Error clearing storage:', clearError);
      }

      throw error;
    }
  };

  const clearAllCache = async () => {
    try {
      console.log('🧹 Starting comprehensive cache clear');
      setLoading(true);

      // 1. Clear AsyncStorage
      console.log('📱 Clearing AsyncStorage');
      await AsyncStorage.clear();

      // 2. Clear Supabase session
      console.log('🔐 Clearing Supabase session');
      await supabase.auth.signOut({ scope: 'global' });

      // 3. Clear web storage if on web platform
      if (Platform.OS === 'web') {
        console.log('🌐 Clearing web storage');
        if (typeof window !== 'undefined') {
          // Clear localStorage
          window.localStorage.clear();
          // Clear sessionStorage
          window.sessionStorage.clear();
          // Clear IndexedDB (Supabase uses this)
          if (window.indexedDB) {
            const databases = await window.indexedDB.databases();
            await Promise.all(
              databases.map(db => {
                if (db.name) {
                  return new Promise((resolve, reject) => {
                    const deleteReq = window.indexedDB.deleteDatabase(db.name!);
                    deleteReq.onsuccess = () => resolve(void 0);
                    deleteReq.onerror = () => reject(deleteReq.error);
                  });
                }
              })
            );
          }
        }
      }

      // 4. Clear Expo SecureStore if available
      try {
        const { SecureStore } = await import('expo-secure-store');
        console.log('🔒 Clearing Expo SecureStore');
        const keys = await SecureStore.getItemAsync('supabase.auth.token');
        if (keys) {
          await SecureStore.deleteItemAsync('supabase.auth.token');
        }
      } catch (e) {
        console.log('ℹ️ SecureStore not available or already cleared');
      }

      // 5. Reset user state
      console.log('👤 Resetting user state');
      setUser(null);

      // 6. Force app reload on web
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        console.log('🔄 Reloading app');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }

      console.log('✅ Cache cleared successfully');

    } catch (error) {
      console.error('❌ Cache clear error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const ensureUserInDatabase = async (user: User) => {
    try {
      console.log('🔍 AuthContext: Checking if user exists in database:', user.email);

      // Set a shorter timeout for database operations
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database operation timeout (3s)')), 3000);
      });

      const dbOperation = async () => {
        // First check if we can connect to Supabase at all
        const { data: connectionTest, error: connectionError } = await supabase
          .from('users')
          .select('count')
          .limit(1)
          .maybeSingle();

        if (connectionError) {
          console.error('❌ AuthContext: Database connection failed:', connectionError);
          throw new Error(`Database connection failed: ${connectionError.message}`);
        }

        // Check if user exists
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .maybeSingle();

        if (fetchError) {
          console.error('❌ AuthContext: Error checking user existence:', fetchError);
          throw new Error(`User lookup failed: ${fetchError.message}`);
        }

        if (!existingUser) {
          console.log('🆕 AuthContext: Creating new user in database');
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email,
              dharma_name: user.user_metadata?.dharma_name || null,
              created_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('❌ AuthContext: Error creating user:', insertError);
            throw new Error(`User creation failed: ${insertError.message}`);
          }
          console.log('✅ AuthContext: New user created in database');
        } else {
          console.log('✅ AuthContext: User already exists in database:', user.email);
        }
      };

      await Promise.race([dbOperation(), timeoutPromise]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ AuthContext: Error ensuring user in database:', errorMessage);
      console.log('⚠️ AuthContext: Continuing without database sync due to error');

      // Optional: You could set a flag here to retry later or show a warning to the user
      // For now, we continue gracefully as designed
    }
  };

  const forceLogoutAll = async () => {
    try {
      console.log('🚨 FORCE LOGOUT: Starting complete authentication cleanup...');

      setLoading(true);
      setUser(null);

      // Clear ALL storage aggressively
      try {
        await AsyncStorage.clear();
        console.log('✅ FORCE LOGOUT: AsyncStorage completely cleared');
      } catch (e) {
        console.log('⚠️ FORCE LOGOUT: AsyncStorage clear failed:', e);
      }

      // Clear web storage
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.clear();
          window.sessionStorage.clear();
          console.log('✅ FORCE LOGOUT: Web storage cleared');
        } catch (e) {
          console.log('⚠️ FORCE LOGOUT: Web storage clear failed:', e);
        }
      }

      // Multiple Supabase logout attempts
      try {
        await supabase.auth.signOut({ scope: 'global' });
        console.log('✅ FORCE LOGOUT: Global signout completed');
      } catch (e) {
        console.log('⚠️ FORCE LOGOUT: Global signout failed, trying local:', e);
        try {
          await supabase.auth.signOut({ scope: 'local' });
        } catch (e2) {
          console.log('⚠️ FORCE LOGOUT: Local signout also failed:', e2);
        }
      }

      setLoading(false);

      // Force reload on web
      if (typeof window !== 'undefined') {
        console.log('🔄 FORCE LOGOUT: Reloading page in 1 second...');
        setTimeout(() => {
          window.location.href = window.location.origin;
        }, 1000);
      }

      console.log('🎉 FORCE LOGOUT: Complete cleanup finished');
    } catch (error) {
      console.error('❌ FORCE LOGOUT: Error during cleanup:', error);
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithOTP, verifyOTP, signUp, signUpWithOTP, signOut, forceLogoutAll, clearAllCache }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}