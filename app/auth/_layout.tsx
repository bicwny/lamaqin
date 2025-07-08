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