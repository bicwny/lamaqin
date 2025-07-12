import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { useEffect, useState } from 'react';
import { toastService } from '@/lib/toast';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const timestamp = new Date().toISOString();
    const info = {
      loading,
      user: user?.email || null,
      timestamp
    };

    console.log('🔄 RootLayoutNav useEffect triggered:', info);
    setDebugInfo(JSON.stringify(info, null, 2));

    if (!loading) {
      if (user) {
        console.log('🔄 Auth state changed in RootLayoutNav, user:', user.email);
        console.log('✅ User authenticated, should show tabs');
      } else {
        console.log('❌ No user found in RootLayoutNav');
      }
    } else {
      console.log('⏳ RootLayoutNav still loading, not processing auth state yet');
    }
  }, [user, loading]);

  // Debug logging
  console.log('🔍 RootLayoutNav render - user:', user?.email || null, 'loading:', loading);
  console.log('📋 User object:', JSON.stringify(user, null, 2));
  console.log('🕐 RootLayoutNav timestamp:', new Date().toISOString());

  if (loading) {
    console.log('⏳ Showing loading screen...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  console.log('✅ Auth state resolved, user:', user ? 'logged in' : 'not logged in');
  console.log('📱 About to render Stack with screens');

  if (!user) {
    console.log('🎯 Will show: auth screen');
  } else {
    console.log('🎯 Will show: (tabs) screen');
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
      <Stack.Screen 
        name="profile" 
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="edit-profile" 
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
  return (
    <AuthProvider>
      <RootLayoutNav />
      {toastService.ToastComponent && <toastService.ToastComponent />}
    </AuthProvider>
  );
}