import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  dharma_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, dharmaName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
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

        // Handle successful authentication
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
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

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Auth check timeout')), 10000);
      });

      const authPromise = supabase.auth.getSession();

      const { data: { session }, error } = await Promise.race([authPromise, timeoutPromise]) as any;

      if (error) {
        console.error('❌ Auth session error:', error);
        setUser(null);
        setLoading(false);
        return;
      }

      if (session?.user && session.user.email_confirmed_at) {
        console.log('✅ Found verified session for:', session.user.email);

        // Set user immediately, database sync is optional
        setUser({
          id: session.user.id,
          email: session.user.email!,
          dharma_name: session.user.user_metadata?.dharma_name,
        });
        console.log('✅ User state set successfully');

        // Create user in database if doesn't exist (non-blocking, doesn't affect loading)
        ensureUserInDatabase(session.user).catch(err => {
          console.log('⚠️ Database sync failed but continuing:', err.message);
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

  const signOut = async () => {
    try {
      console.log('🚪 AuthContext: signOut function called');
      console.log('🚪 Current user before logout:', user?.email);

      // Set loading to true to prevent any intermediate state issues
      setLoading(true);

      // Clear local storage first
      console.log('🧹 AuthContext: Clearing local storage...');
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@user_session');
      console.log('✅ AuthContext: Local storage cleared');

      // Call Supabase signOut first
      console.log('🔐 AuthContext: Calling Supabase signOut...');
      const { error } = await supabase.auth.signOut({
        scope: 'global'
      });

      if (error) {
        console.error('❌ AuthContext: Supabase sign out error:', error);
        // Still clear local state even if Supabase fails
      } else {
        console.log('✅ AuthContext: Supabase signOut completed successfully');
      }

      // Force clear user state
      console.log('🔄 AuthContext: Clearing user state...');
      setUser(null);
      setLoading(false);
      console.log('✅ AuthContext: User state cleared');

      console.log('🎉 AuthContext: Logout process completed - user should be redirected to login');
    } catch (error) {
      console.error('❌ AuthContext: Logout error:', error);
      // Ensure user state is cleared regardless
      console.log('🛡️ AuthContext: Force clearing user state due to error');
      setUser(null);
      setLoading(false);
      throw error; // Re-throw so the UI can handle it
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

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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