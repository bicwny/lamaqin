import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, Text, Platform } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Toast from 'react-native-toast-message';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, loading } = useAuth();

  console.log('🔍 RootLayoutNav render - user:', user?.email || null, 'loading:', loading);
  console.log('📋 User object:', user ? JSON.stringify(user, null, 2) : 'null');
  console.log('🕐 RootLayoutNav timestamp:', new Date().toISOString());

  // Handle navigation based on auth state
  useEffect(() => {
    console.log('🔄 RootLayoutNav useEffect triggered:', {
      loading,
      user: user?.email || null,
      timestamp: new Date().toISOString()
    });

    if (!loading) {
      console.log('🔄 Auth state changed in RootLayoutNav, user:', user?.email || 'none');
      if (user) {
        console.log('✅ User authenticated, should show tabs');
        router.replace('/(tabs)');
      } else {
        console.log('❌ No user, should show auth');
        router.replace('/auth');
      }
    } else {
      console.log('⏳ RootLayoutNav still loading, not processing auth state yet');
    }
  }, [user, loading]);

  if (loading) {
    console.log('⏳ Showing loading screen...');
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }}
        />
      </Stack>
    );
  }

  console.log('✅ Auth state resolved, user:', user ? 'logged in' : 'not logged in');
  console.log('📱 About to render Stack with screens');

  if (user) {
    console.log('🎯 Will show: (tabs) screen');
  } else {
    console.log('🎯 Will show: auth screen');
  }

  return (
    <Stack 
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="add-practice" 
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="practice-config" 
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />
      <Stack.Screen name="practice-history" options={{ title: '修行历史' }} />
      <Stack.Screen 
        name="meditation-history" 
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="modals/meditation-record" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="modals/custom-record" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontLoaded, setFontLoaded] = useState(false);

  // Only use useFonts on web platform
  const [loaded, error] = useFonts(
    Platform.OS === 'web' ? {
      SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    } : {}
  );

  useEffect(() => {
    if (error) {
      console.warn('Font loading error:', error);
    }
  }, [error]);

  useEffect(() => {
    // For native platforms, skip font loading and proceed immediately
    if (Platform.OS !== 'web') {
      setFontLoaded(true);
      SplashScreen.hideAsync();
    } else if (loaded) {
      setFontLoaded(true);
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!fontLoaded && Platform.OS === 'web') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <RootLayoutNav />
      <Toast 
        position="top"
        bottomOffset={20}
      />
    </AuthProvider>
  );
}