import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.title}>用户检查</Text>
      <Text>Auth User: {user?.email || 'None'}</Text>
      <Text>DB User: {dbUser ? `${dbUser.dharma_name} (${dbUser.email})` : 'Not found'}</Text>

      {dbUser && (
        <View style={styles.userDetails}>
          <Text>ID: {dbUser.id}</Text>
          <Text>法名: {dbUser.dharma_name}</Text>
          <Text>修行年数: {dbUser.practice_years || 'N/A'}</Text>
          <Text>地区: {dbUser.location || 'N/A'}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({});Size: 16,
    fontWeight: '600',
  },
});