
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
    </Stack>
  );
}
