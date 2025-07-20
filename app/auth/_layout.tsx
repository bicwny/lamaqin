import { Stack } from 'expo-router';

export default function AuthLayout() {
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