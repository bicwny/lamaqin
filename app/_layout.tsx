import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

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
      } else {
        console.log('❌ No user, should show auth');
      }
    } else {
      console.log('⏳ RootLayoutNav still loading, not processing auth state yet');
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
    <Stack 
      screenOptions={{ headerShown: false }}
      initialRouteName={user ? "(tabs)" : "auth"}
    >
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false,
          href: user ? "/(tabs)" : null
        }} 
      />
      <Stack.Screen 
        name="auth" 
        options={{ 
          headerShown: false,
          presentation: 'modal',
          href: !user ? "/auth" : null
        }} 
      />
      <Stack.Screen 
        name="meditation-history" 
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />
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