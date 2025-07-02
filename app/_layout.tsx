
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DebugInfo } from '@/components/DebugInfo';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();

  console.log('RootLayoutNav render - user:', user?.email, 'loading:', loading);
  console.log('User object:', JSON.stringify(user, null, 2));

  if (loading) {
    console.log('Showing loading screen...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <DebugInfo />
      </View>
    );
  }

  console.log('Auth state resolved, user:', user ? 'logged in' : 'not logged in');
  console.log('About to render Stack with screens');

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <Stack.Screen name="auth" />
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
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
