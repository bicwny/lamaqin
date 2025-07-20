import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../lib/toast';

function RootLayoutNav() {
  const { user, loading } = useAuth();

  console.log('🚀 RootLayoutNav - User:', user?.email || 'null', 'Loading:', loading);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  // Authentication-based navigation
  if (!user) {
    console.log('🔐 No user - redirecting to auth flow');
    // User not authenticated - show only auth routes
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="+not-found" />
      </Stack>
    );
  }

  console.log('✅ User authenticated - showing main app');
  // User authenticated - show main app routes
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="add-practice" />
      <Stack.Screen name="practice-config" />
      <Stack.Screen name="practice-history" />
      <Stack.Screen name="meditation-history" />
      <Stack.Screen name="lesson-viewer" />
      <Stack.Screen 
        name="modals/custom-record" 
        options={{ presentation: 'modal' }} 
      />
      <Stack.Screen 
        name="modals/meditation-record" 
        options={{ presentation: 'modal' }} 
      />
      <Stack.Screen name="practice-detail/[practiceId]" />
      <Stack.Screen name="meditation-detail/[recordId]" />
      <Stack.Screen name="course-detail/[courseId]" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
      <Toast config={toastConfig} />
    </AuthProvider>
  );
}