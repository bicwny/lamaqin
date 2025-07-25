import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../lib/toast';

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth" />
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
      <Stack.Screen name="meditation-detail/[practiceId]" />
      <Stack.Screen name="meditation-record-detail/[recordId]" />
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