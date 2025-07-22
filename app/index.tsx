
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Index() {
  const { user, loading } = useAuth();
  const [profileChecking, setProfileChecking] = useState(false);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);

  console.log('📍 Root Index - User:', user?.email || 'null', 'Loading:', loading);

  // Check profile completeness when user is authenticated
  useEffect(() => {
    if (user && !loading && profileComplete === null) {
      checkProfileCompleteness();
    }
  }, [user, loading, profileComplete]);

  const checkProfileCompleteness = async () => {
    if (!user) return;
    
    try {
      setProfileChecking(true);
      console.log('🔍 Checking profile completeness for:', user.email);

      const { data: userData, error } = await supabase
        .from('users')
        .select('dharma_name, location')
        .eq('id', user.id)
        .single();

      if (error) {
        console.warn('⚠️ Profile check failed:', error.message);
        // If database fails, assume profile is incomplete to be safe
        setProfileComplete(false);
        return;
      }

      const isComplete = Boolean(userData?.dharma_name && userData?.location);
      console.log('✅ Profile completeness check:', {
        dharma_name: userData?.dharma_name,
        location: userData?.location,
        isComplete
      });

      setProfileComplete(isComplete);
    } catch (error) {
      console.error('❌ Profile completeness check error:', error);
      // Default to incomplete on error
      setProfileComplete(false);
    } finally {
      setProfileChecking(false);
    }
  };

  // Show loading while checking auth or profile
  if (loading || (user && profileChecking)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  // Not authenticated - go to auth
  if (!user) {
    console.log('🔐 Index: Redirecting to auth/unified');
    return <Redirect href="/auth/unified" />;
  }

  // Authenticated but profile incomplete - go to profile setup
  if (user && profileComplete === false) {
    console.log('📝 Index: Profile incomplete, redirecting to profile setup');
    return <Redirect href="/profile-setup" />;
  }

  // Authenticated with complete profile - go to main app
  console.log('✅ Index: Profile complete, redirecting to tabs home');
  return <Redirect href="/(tabs)" />;
}
