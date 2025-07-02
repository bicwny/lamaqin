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

        if (event === 'SIGNED_OUT') {
          console.log('🚪 User signed out - clearing state');
          setUser(null);
          setLoading(false);
          // Clear any cached data
          await AsyncStorage.removeItem('@auth_token');
          await AsyncStorage.removeItem('@user_session');
          return;
        }

        if (session?.user && session.user.email_confirmed_at) {
          console.log('✅ Found verified session for:', session.user.email);

          try {
            // Create user in database if doesn't exist
            await ensureUserInDatabase(session.user);

            setUser({
              id: session.user.id,
              email: session.user.email!,
              dharma_name: session.user.user_metadata?.dharma_name,
            });
            console.log('✅ User state set successfully');
          } catch (error) {
            console.error('❌ Failed to ensure user in database:', error);
            // Still set user if database sync fails
            setUser({
              id: session.user.id,
              email: session.user.email!,
              dharma_name: session.user.user_metadata?.dharma_name,
            });
          }
        } else if (session?.user && !session.user.email_confirmed_at) {
          console.log('⏳ User exists but email not verified');
          setUser(null); // Don't set user until email is verified
        } else {
          console.log('❌ No session found');
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthState = async () => {
    try {
      console.log('Checking auth state...');

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth check timeout')), 10000)
      );

      const authPromise = supabase.auth.getSession();

      const { data: { session }, error } = await Promise.race([authPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Auth session error:', error);
        setLoading(false);
        return;
      }

      if (session?.user) {
        console.log('Found existing session for:', session.user.email);

        // Create user in database if doesn't exist
        await ensureUserInDatabase(session.user);

        setUser({
          id: session.user.id,
          email: session.user.email!,
          dharma_name: session.user.user_metadata?.dharma_name,
        });
      } else {
        console.log('No existing session found');
      }
    } catch (error) {
      console.error('Auth check error:', error);
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

  const ensureUserInDatabase = async (user: any) => {
    try {
      console.log('🔍 AuthContext: Checking if user exists in database:', user.email);
      
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') { // PGRST116 is no data found, which is fine
        console.error('❌ AuthContext: Error checking user existence:', selectError);
        return;
      }

      if (!existingUser) {
        console.log('➕ AuthContext: Creating new user in database:', user.email);
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            id: user.id,
            email: user.email,
            dharma_name: user.user_metadata?.dharma_name || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);

        if (insertError) {
          // Handle duplicate key constraint gracefully
          if (insertError.code === '23505') {
            console.log('✅ AuthContext: User already exists (race condition handled)');
          } else {
            console.error('❌ AuthContext: Error creating user in database:', insertError);
            throw insertError;
          }
        } else {
          console.log('✅ AuthContext: User created in database:', user.email);
        }
      } else {
        console.log('✅ AuthContext: User already exists in database:', user.email);
        
        // Update user info if dharma_name has changed
        if (user.user_metadata?.dharma_name && existingUser.dharma_name !== user.user_metadata.dharma_name) {
          console.log('🔄 AuthContext: Updating user dharma_name');
          const { error: updateError } = await supabase
            .from('users')
            .update({ 
              dharma_name: user.user_metadata.dharma_name,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
            
          if (updateError) {
            console.error('❌ AuthContext: Error updating user:', updateError);
          } else {
            console.log('✅ AuthContext: User updated in database');
          }
        }
      }
    } catch (error) {
      console.error('❌ AuthContext: Error ensuring user in database:', error);
      throw error;
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