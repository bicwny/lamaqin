
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export function useDeepLink() {
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log('🔗 Deep link received:', url);
      
      // Wait for auth to load before processing deep links
      if (loading) {
        console.log('⏳ Auth still loading, deferring deep link');
        return;
      }
      
      // Handle web URLs with reset password code
      if (url.includes('code=') && (url.includes('reset-password') || url.includes('auth'))) {
        console.log('🌐 Handling web reset password URL:', url);
        try {
          const urlObj = new URL(url);
          const code = urlObj.searchParams.get('code');
          if (code) {
            console.log('🔐 Extracting reset code from web URL:', code);
            router.push(`/auth/reset-password?code=${code}`);
            return;
          }
        } catch (error) {
          console.error('❌ Error parsing web URL:', error);
        }
      }
      
      // Remove the scheme prefix and leading slash
      const route = url.replace(/dharmapractice:\/\//, '').replace(/^\//, '');
      
      console.log('🎯 Processing route:', route);
      
      // Handle auth routes (accessible without login)
      if (route.startsWith('auth/') || route === 'auth') {
        try {
          // Special handling for reset password with code parameter
          if (route.includes('reset-password') && url.includes('code=')) {
            const urlObj = new URL(url);
            const code = urlObj.searchParams.get('code');
            if (code) {
              console.log('🔐 Handling reset password with code:', code);
              router.push(`/auth/reset-password?code=${code}`);
              return;
            }
          }
          
          router.push(`/${route}`);
          return;
        } catch (error) {
          console.error('❌ Auth route navigation error:', error);
          router.replace('/auth');
          return;
        }
      }
      
      // For authenticated routes, check if user is logged in
      if (!user) {
        console.log('🔒 User not authenticated, redirecting to auth');
        router.replace('/auth');
        return;
      }
      
      // Handle authenticated routes
      try {
        if (!route || route === '' || route === '/') {
          router.replace('/(tabs)');
        } else if (route.startsWith('(tabs)/profile')) {
          router.push('/(tabs)/profile');
        } else if (route === 'practice' || route === '(tabs)/practice') {
          router.push('/(tabs)/practice');
        } else if (route === 'study' || route === '(tabs)/study') {
          router.push('/(tabs)/study');
        } else if (route === 'mindfulness' || route === '(tabs)/mindfulness') {
          router.push('/(tabs)/mindfulness');
        } else if (route === 'stats' || route === '(tabs)/stats') {
          router.push('/(tabs)/stats');
        } else if (route === 'meditation-history') {
          router.push('/meditation-history');
        } else if (route === 'add-practice') {
          router.push('/add-practice');
        } else if (route === 'practice-config') {
          router.push('/practice-config');
        } else if (route.startsWith('modals/')) {
          router.push(`/${route}`);
        } else {
          // Fallback to main app for unrecognized routes
          console.log('🔄 Unrecognized route, fallback to tabs');
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('❌ Deep link navigation error:', error);
        router.replace('/(tabs)');
      }
    };

    // Listen for incoming deep links when app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Handle deep link when app is opened from closed state
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [user, loading]); // Added dependencies for auth state
}
