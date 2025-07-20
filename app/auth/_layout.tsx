import { Stack, Redirect } from 'expo-router';
import { useEffect } from 'react';

export default function AuthLayout() {
  console.log('🔐 AuthLayout rendering');
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="unified"
    >
      <Stack.Screen name="unified" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="email-verification" />
    </Stack>
  );
}