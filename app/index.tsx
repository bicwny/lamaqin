
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, Text, ActivityIndicator } from 'react-native';

export default function Index() {
  const { user, isInitialized } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected) return;

    let redirectTimeout: NodeJS.Timeout;
    let fallbackTimeout: NodeJS.Timeout;

    try {
      // Fast fallback for deployment health checks - redirect immediately if no auth context
      fallbackTimeout = setTimeout(() => {
        if (!hasRedirected && !isInitialized) {
          console.log('⚡ Fast fallback: redirecting to auth');
          setHasRedirected(true);
          router.replace('/auth/unified');
        }
      }, 50);

      // Main redirect logic with timeout
      redirectTimeout = setTimeout(() => {
        if (hasRedirected) return;

        try {
          if (!isInitialized) {
            console.log('⏰ Timeout: not initialized, redirecting to auth');
            setHasRedirected(true);
            router.replace('/auth/unified');
            return;
          }

          if (user) {
            console.log('✅ User authenticated, redirecting to tabs');
            setHasRedirected(true);
            router.replace('/(tabs)');
          } else {
            console.log('❌ No user, redirecting to auth');
            setHasRedirected(true);
            router.replace('/auth/unified');
          }
        } catch (err) {
          console.error('❌ Redirect error:', err);
          setError('Navigation error occurred');
          setHasRedirected(true);
          router.replace('/auth/unified');
        }
      }, 100);

      // Clear fallback timeout if main logic executes
      if (isInitialized !== undefined) {
        clearTimeout(fallbackTimeout);
      }

    } catch (err) {
      console.error('❌ Index component error:', err);
      setError('Initialization error');
      setHasRedirected(true);
      router.replace('/auth/unified');
    }

    return () => {
      clearTimeout(redirectTimeout);
      clearTimeout(fallbackTimeout);
    };
  }, [user, isInitialized, hasRedirected]);

  // Immediate redirect for known states to avoid flash
  useEffect(() => {
    if (isInitialized && !hasRedirected) {
      if (user) {
        setHasRedirected(true);
        router.replace('/(tabs)');
      } else {
        setHasRedirected(true);
        router.replace('/auth/unified');
      }
    }
  }, [isInitialized, user, hasRedirected]);

  // Error boundary fallback
  if (error) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 20
      }}>
        <Text style={{ 
          fontSize: 16,
          color: '#ef4444',
          textAlign: 'center',
          marginBottom: 10
        }}>
          {error}
        </Text>
        <Text style={{ 
          fontSize: 14,
          color: '#666',
          textAlign: 'center'
        }}>
          Redirecting...
        </Text>
      </View>
    );
  }

  // Fast loading state - minimal rendering
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#ffffff'
    }}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={{ 
        marginTop: 12, 
        fontSize: 14,
        color: '#666'
      }}>
        加载中...
      </Text>
    </View>
  );
}
