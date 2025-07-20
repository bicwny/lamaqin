import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../lib/toast';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated/lib/reanimated2/js-reanimated';
import { Platform } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Add explicit health check route handling for web deployment
if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.pathname === '/') {
  // Ensure root path returns 200 status for health checks
}

function RootLayoutNav() {
  // Remove all blocking logic from root layout
  // Each screen will handle its own authentication state
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
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen 
          name="profile" 
          options={{ 
            title: '个人资料',
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="edit-profile" 
          options={{ 
            title: '编辑资料',
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="profile-setup" 
          options={{ 
            title: '完善资料',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="add-practice" 
          options={{ 
            title: '添加修行项目',
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="practice-config" 
          options={{ 
            title: '项目配置',
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="course-detail/[courseId]" 
          options={{ 
            title: '课程详情',
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="lesson-viewer" 
          options={{ 
            title: '课程内容',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="practice-detail/[practiceId]" 
          options={{ 
            title: '修行项目详情',
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="practice-history" 
          options={{ 
            title: '修行记录',
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="meditation-detail/[practiceId]" 
          options={{ 
            title: '禅修详情',
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="meditation-detail/[recordId]" 
          options={{ 
            title: '禅修详情',
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="meditation-record-detail/[recordId]" 
          options={{ 
            title: '禅修记录详情',
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="meditation-history" 
          options={{ 
            title: '禅修记录',
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="modals/custom-record" 
          options={{ 
            presentation: 'modal',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="modals/meditation-record" 
          options={{ 
            presentation: 'modal',
            headerShown: false
          }} 
        />
      </Stack>
      <Toast config={toastConfig} />
    </AuthProvider>
  );
}