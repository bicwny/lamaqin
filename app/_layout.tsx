
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, Text } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';

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
      <Stack.Screen 
        name="auth" 
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="meditation-history" 
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />
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
      <Stack.Screen 
        name="modals/custom-record" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="modals/meditation-record" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Add font loading error handling
  useEffect(() => {
    if (error) {
      console.warn('Font loading error:', error);
    }
    
    const handleFontError = (event: ErrorEvent) => {
      if (event.message?.includes('timeout exceeded') || event.message?.includes('fonts')) {
        console.warn('Font loading timeout - using fallback fonts');
        // Suppress the error to prevent app crashes
        event.preventDefault();
        return true;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('timeout exceeded') || event.reason?.message?.includes('fonts')) {
        console.warn('Font loading promise rejected - using fallback fonts');
        // Suppress the error to prevent app crashes
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleFontError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleFontError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
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
    </AuthProvider>
  );
}