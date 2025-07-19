import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator, View, Platform, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/lib/toast';
import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';
import { CrashBoundary } from '@/components/CrashBoundary';

// Initialize Sentry with proper error handling
const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
if (sentryDsn && sentryDsn !== 'YOUR_SENTRY_DSN_HERE') {
  try {
    Sentry.init({
      dsn: sentryDsn,
      debug: __DEV__,
      enableAutoSessionTracking: true,
      sessionTrackingIntervalMillis: 30000,
      enableNdkScopeSync: Platform.OS === 'android',
      enableAutoPerformanceTracing: true,
    });
  } catch (error) {
    console.warn('Sentry initialization failed:', error);
  }
} else {
  console.warn('Sentry DSN not configured');
}

function RootLayoutNav() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Basic device debugging
    const deviceInfo = {
      platform: Platform.OS,
      version: Platform.Version,
      model: Constants.deviceName,
      screen: Dimensions.get('screen'),
      window: Dimensions.get('window'),
      expo: {
        sdkVersion: Constants.expoVersion,
        sessionId: Constants.sessionId,
      }
    };

    console.log('🔍 Device Debug Info:', JSON.stringify(deviceInfo, null, 2));

    // Add device context to Sentry if available
    if (sentryDsn) {
      try {
        Sentry.setContext('device', deviceInfo);
        Sentry.setTag('device_model', Constants.deviceName || 'unknown');
        Sentry.setTag('platform', Platform.OS);
      } catch (error) {
        console.warn('Failed to set Sentry context:', error);
      }
    }

    // Global error handler with safety checks
    try {
      const originalHandler = ErrorUtils.getGlobalHandler();
      ErrorUtils.setGlobalHandler((error, isFatal) => {
        console.error('🚨 Global Error:', error);
        
        // Only capture to Sentry if it's configured
        if (sentryDsn) {
          try {
            Sentry.captureException(error, {
              tags: {
                isFatal: isFatal,
                source: 'global_handler'
              }
            });
          } catch (sentryError) {
            console.warn('Failed to capture error to Sentry:', sentryError);
          }
        }
        
        if (originalHandler) {
          originalHandler(error, isFatal);
        }
      });
    } catch (error) {
      console.warn('Failed to set global error handler:', error);
    }

  }, []);

  if (loading) {
    console.log('⏳ Auth loading state...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <Toast config={toastConfig} />
    </>
  );
}

export default Sentry.wrap(function RootLayout() {
  return (
    <CrashBoundary>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </CrashBoundary>
  );
});