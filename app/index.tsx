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
        // Check if user has required profile fields and class enrollment
        const [userData, enrolledClasses] = await Promise.all([
          supabase
            .from('users')
            .select('dharma_name, lay_name')
            .eq('id', user.id)
            .single()
            .then(r => r.data),
          supabase
            .from('user_class_progress')
            .select('class_id')
            .eq('user_id', user.id)
            .neq('enrollment_status', 'paused')
            .then(r => r.data || [])
        ]);

        // Profile is complete if user has dharma_name, lay_name, AND at least one active class enrollment
        const hasDharmaName = !!(userData?.dharma_name && userData.dharma_name.trim().length > 0);
        const hasLayName = !!(userData?.lay_name && userData.lay_name.trim().length > 0);
        const hasClassEnrollment = enrolledClasses.length > 0;
        const hasCompletedProfile = hasDharmaName && hasLayName && hasClassEnrollment;
        
        setProfileComplete(hasCompletedProfile);
        
        console.log('📋 Profile completion check:', {
          userId: user.id,
          email: user.email,
          dharmaName: userData?.dharma_name,
          layName: userData?.lay_name,
          enrolledClassCount: enrolledClasses.length,
          isComplete: hasCompletedProfile
        });
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