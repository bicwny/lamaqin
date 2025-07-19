
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator, View, Platform, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/lib/toast';
import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';
import { CrashBoundary } from '@/components/CrashBoundary';

// Initialize Sentry
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || 'YOUR_SENTRY_DSN_HERE',
  debug: __DEV__,
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 30000,
  enableNdkScopeSync: true,
  enableAutoPerformanceTracing: true,
});

function RootLayoutNav() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Enhanced device debugging for iPhone 16
    const deviceInfo = {
      platform: Platform.OS,
      version: Platform.Version,
      model: Constants.deviceName,
      screen: Dimensions.get('screen'),
      window: Dimensions.get('window'),
      isIphone16: Platform.OS === 'ios' && (
        Constants.deviceName?.includes('iPhone16') || 
        Constants.deviceName?.includes('iPhone 16') ||
        Constants.deviceName?.includes('iPhone17')
      ),
      expo: {
        sdkVersion: Constants.expoVersion,
        deviceId: Constants.deviceId,
        sessionId: Constants.sessionId,
      }
    };
    
    console.log('🔍 Device Debug Info:', JSON.stringify(deviceInfo, null, 2));
    
    // Add device context to Sentry
    Sentry.setContext('device', deviceInfo);
    Sentry.setTag('device_model', Constants.deviceName || 'unknown');
    Sentry.setTag('is_iphone16', deviceInfo.isIphone16);
    
    if (deviceInfo.isIphone16) {
      console.log('🍎 iPhone 16 detected - enhanced crash monitoring enabled');
      Sentry.addBreadcrumb({
        message: 'iPhone 16 detected',
        level: 'info',
        data: deviceInfo
      });
    }

    // Global error handler
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.error('🚨 Global Error:', error);
      Sentry.captureException(error, {
        tags: {
          isFatal: isFatal,
          source: 'global_handler'
        }
      });
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });

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

export default function RootLayout() {
  return (
    <CrashBoundary>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </CrashBoundary>
  );
}
