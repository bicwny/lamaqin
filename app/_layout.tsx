import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, loading } = useAuth();

  console.log('🔍 RootLayoutNav render - user:', user?.email || null, 'loading:', loading);
  console.log('📋 User object:', user ? JSON.stringify(user, null, 2) : 'null');

  // Add debugging for unexpected navigation
  useEffect(() => {
    if (!loading) {
      console.log('🔄 Auth state changed in RootLayoutNav, user:', user?.email || 'none');
      if (user) {
        console.log('✅ User authenticated, should show tabs');
      } else {
        console.log('❌ No user, should show auth');
      }
    }
  }, [user, loading]);

  if (loading) {
    console.log('⏳ Showing loading screen...');
    return null; // or a loading screen
  }

  console.log('✅ Auth state resolved, user:', user ? 'logged in' : 'not logged in');
  console.log('📱 About to render Stack with screens');

  if (user) {
    console.log('🎯 Will show: (tabs) screen');
  } else {
    console.log('🎯 Will show: auth screen');
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="auth" />
      )}
      <Stack.Screen name="meditation-history" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}