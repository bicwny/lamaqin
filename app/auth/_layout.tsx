
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'card',
        gestureEnabled: false,
      }}
    >
      <Stack.Screen 
        name="login" 
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="register"
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="reset-password"
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="forgot-password"
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="forgot-password-sent"
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="email-verification"
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
import { Stack } from 'expo-router';
import { WebPlatformDetector } from '@/components/WebPlatformDetector';

export default function AuthLayout() {
  return (
    <>
      <WebPlatformDetector />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="forgot-password-sent" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="email-verification" />
      </Stack>
    </>
  );
}
