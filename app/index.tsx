
import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, Text, ActivityIndicator } from 'react-native';

export default function Index() {
  const { user, isInitialized } = useAuth();

  useEffect(() => {
    if (!isInitialized) return;

    if (user) {
      // User is authenticated, redirect to main tabs
      router.replace('/(tabs)');
    } else {
      // User is not authenticated, redirect to auth
      router.replace('/auth/unified');
    }
  }, [user, isInitialized]);

  // Show loading state while determining where to redirect
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#ffffff'
    }}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={{ 
        marginTop: 16, 
        fontSize: 16,
        color: '#666'
      }}>
        加载中...
      </Text>
    </View>
  );
}
