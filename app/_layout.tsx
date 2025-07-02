import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
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
  const router = useRouter();

  console.log('🔍 RootLayoutNav render - user:', user?.email, 'loading:', loading);
  console.log('📋 User object:', JSON.stringify(user, null, 2));

  useEffect(() => {
    if (!loading && user) {
      console.log('🚀 Navigating to study tab after login...');
      router.replace('(tabs)/study');
    }
  }, [user, loading]);

  if (loading) {
    console.log('⏳ Showing loading screen...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <DebugInfo />
      </View>
    );
  }

  console.log('✅ Auth state resolved, user:', user ? 'logged in' : 'not logged in');
  console.log('📱 About to render Stack with screens');
  console.log('🎯 Will show:', user ? '(tabs) screen' : 'auth screen');

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
            key="authenticated"
          />
        ) : (
          <Stack.Screen
            name="auth"
            options={{
              headerShown: false,
              animationTypeForReplace: 'pop'
            }}
            key="unauthenticated"
          />
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