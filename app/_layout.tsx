import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../lib/toast';

function RootLayoutNav() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If user is not authenticated, show auth stack
  if (!user) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
      </Stack>
    );
  }

  // If user is authenticated, show main app
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="add-practice" />
      <Stack.Screen name="practice-config" />
      <Stack.Screen name="practice-history" />
      <Stack.Screen name="meditation-history" />
      <Stack.Screen name="course-detail/[courseId]" />
      <Stack.Screen name="practice-detail/[practiceId]" />
      <Stack.Screen name="meditation-detail/[practiceId]" />
      <Stack.Screen name="meditation-detail/[recordId]" />
      <Stack.Screen name="meditation-record-detail/[recordId]" />
      <Stack.Screen name="lesson-viewer" />
      <Stack.Screen name="modals/custom-record" options={{ presentation: 'modal' }} />
      <Stack.Screen name="modals/meditation-record" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
      <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
      <Stack.Screen name="add-practice" options={{ headerShown: false }} />
      <Stack.Screen name="practice-config" options={{ headerShown: false }} />
      <Stack.Screen name="practice-history" options={{ headerShown: false }} />
      <Stack.Screen name="meditation-history" options={{ headerShown: false }} />
      <Stack.Screen name="lesson-viewer" options={{ headerShown: false }} />
      <Stack.Screen 
        name="modals/custom-record" 
        options={{ presentation: 'modal', headerShown: false }} 
      />
      <Stack.Screen 
        name="modals/meditation-record" 
        options={{ presentation: 'modal', headerShown: false }} 
      />
      <Stack.Screen 
        name="practice-detail/[practiceId]" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="meditation-detail/[recordId]" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="course-detail/[courseId]" 
        options={{ headerShown: false }} 
      />
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