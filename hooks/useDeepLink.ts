
import { useEffect } from 'react';
import { Linking, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export function useDeepLink() {
  const { user, loading } = useAuth();

  // Platform detection utilities
  const detectPlatform = () => {
    if (Platform.OS === 'web') {
      const userAgent = navigator.userAgent;
      const isMobileWeb = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
      
      return {
        platform: Platform.OS,
        isMobileWeb,
        isIOS,
        isAndroid,
        isDesktop: !isMobileWeb
      };
    }
    
    return {
      platform: Platform.OS,
      isMobileWeb: false,
      isIOS: Platform.OS === 'ios',
      isAndroid: Platform.OS === 'android',
      isDesktop: false
    };
  };

  // Smart app redirect with timeout
  const attemptMobileAppRedirect = async (route: string, code?: string) => {
    const { isMobileWeb, isIOS, isAndroid } = detectPlatform();
    
    if (!isMobileWeb) {
      console.log('🖥️ Desktop detected, staying in web version');
      return false;
    }

    console.log('📱 Mobile web detected, attempting app redirect...');
    
    try {
      const deepLinkUrl = code 
        ? `dharmapractice://auth/reset-password?code=${code}`
        : `dharmapractice://${route}`;
      
      console.log('🚀 Attempting redirect to:', deepLinkUrl);
      
      // Set a timeout to detect if app opened
      const timeout = new Promise(resolve => setTimeout(() => resolve(false), 3000));
      
      // Try to open the app
      const redirectPromise = Linking.openURL(deepLinkUrl).then(() => true).catch(() => false);
      
      // Race between redirect and timeout
      const result = await Promise.race([redirectPromise, timeout]);
      
      if (!result) {
        console.log('⏰ App redirect timeout, showing fallback options');
        // Store fallback info for the component to display
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('showAppFallback', JSON.stringify({
            isIOS,
            isAndroid,
            originalRoute: route,
            code
          }));
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ App redirect failed:', error);
      return false;
    }
  };

  useEffect(() => {
    const handleDeepLink = async (url: string) => {
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
            
            // Attempt smart redirect for mobile users
            const redirected = await attemptMobileAppRedirect('auth/reset-password', code);
            
            if (!redirected) {
              // Fallback to web version
              console.log('🌐 Continuing in web version');
              router.push(`/auth/reset-password?code=${code}`);
            }
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
