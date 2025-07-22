
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { user, loading } = useAuth();

  console.log('📍 Root Index - User:', user?.email || 'null', 'Loading:', loading);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (!user) {
    console.log('🔐 Index: Redirecting to auth/unified');
    return <Redirect href="/auth/unified" />;
  }

  console.log('✅ Index: Redirecting to home tab');
  return <Redirect href="/(tabs)/index" />;
}
