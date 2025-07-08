
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
        name="email-verification"
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
        name="reset-password"
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
