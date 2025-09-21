import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function Index() {
  const { user, loading } = useAuth();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    async function checkProfileCompleteness() {
      if (!user?.id) {
        setCheckingProfile(false);
        return;
      }

      try {
        // Check if user has dharma name in the database
        const { data: userData, error } = await supabase
          .from('users')
          .select('dharma_name')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking profile completion:', error);
          // If there's an error fetching user data, assume profile is incomplete
          setProfileComplete(false);
        } else {
          // Profile is complete if user has a dharma name
          const hasCompletedProfile = !!(userData?.dharma_name && userData.dharma_name.trim().length > 0);
          setProfileComplete(hasCompletedProfile);
          
          console.log('📋 Profile completion check:', {
            userId: user.id,
            email: user.email,
            dharmaName: userData?.dharma_name,
            isComplete: hasCompletedProfile
          });
        }
      } catch (error) {
        console.error('Error in profile completion check:', error);
        setProfileComplete(false);
      } finally {
        setCheckingProfile(false);
      }
    }

    if (user) {
      checkProfileCompleteness();
    } else {
      setCheckingProfile(false);
    }
  }, [user]);

  if (loading || checkingProfile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  if (!profileComplete) {
    return <Redirect href="/profile-setup" />;
  }

  return <Redirect href="/(tabs)" />;
}