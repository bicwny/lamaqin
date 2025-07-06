import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function UserCheck() {
  const { user } = useAuth();
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, [user]);

  const checkUser = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Checking user in database:', user.email);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error) {
        console.log('❌ User not found or error:', error.message);
        setDbUser(null);
      } else {
        console.log('✅ User found in database:', data);
        setDbUser(data);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setDbUser(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>检查用户中...</Text>
      </View>
    );
  }

  return (
    <View className="p-6 bg-gray-100 m-3 rounded-lg">
      <Text className="text-lg font-bold mb-3 text-buddhist-slate">用户检查</Text>
      <Text className="text-sm text-buddhist-gray mb-1">Auth User: {user?.email || 'None'}</Text>
      <Text className="text-sm text-buddhist-gray mb-3">DB User: {dbUser ? `${dbUser.dharma_name} (${dbUser.email})` : 'Not found'}</Text>

      {dbUser && (
        <View className="mt-3 p-3 bg-white rounded-lg">
          <Text className="text-sm text-buddhist-gray mb-1">ID: {dbUser.id}</Text>
          <Text className="text-sm text-buddhist-gray mb-1">法名: {dbUser.dharma_name}</Text>
          <Text className="text-sm text-buddhist-gray mb-1">修行年数: {dbUser.practice_years || 'N/A'}</Text>
          <Text className="text-sm text-buddhist-gray">地区: {dbUser.location || 'N/A'}</Text>
        </View>
      )}
    </View>
  );
}Size: 16,
    fontWeight: '600',
  },
});