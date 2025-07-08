
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { router } from 'expo-router';

export function useDeepLink() {
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log('🔗 Deep link received:', url);
      
      // Remove the scheme prefix
      const route = url.replace(/dharmapractice:\/\//, '');
      
      if (!route || route === '/') {
        // Default route for authenticated users
        router.replace('/(tabs)');
        return;
      }
      
      // Handle specific routes
      try {
        if (route.startsWith('/profile/')) {
          const userId = route.split('/profile/')[1];
          router.push(`/(tabs)/profile?userId=${userId}`);
        } else if (route === '/settings') {
          router.push('/(tabs)/profile'); // Assuming settings is in profile
        } else if (route === '/practice') {
          router.push('/(tabs)/practice');
        } else if (route === '/study') {
          router.push('/(tabs)/study');
        } else if (route === '/mindfulness') {
          router.push('/(tabs)/mindfulness');
        } else if (route === '/stats') {
          router.push('/(tabs)/stats');
        } else if (route === '/meditation-history') {
          router.push('/meditation-history');
        } else if (route === '/add-practice') {
          router.push('/add-practice');
        } else if (route === '/practice-config') {
          router.push('/practice-config');
        } else {
          // Fallback to main app
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
  }, []);
}
