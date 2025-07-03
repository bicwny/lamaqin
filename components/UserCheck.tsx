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

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    margin: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    marginBottom: 5,
  },
  loading: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  error: {
    fontSize: 14,
    color: 'red',
    marginBottom: 10,
  },
  success: {
    fontSize: 14,
    color: 'green',
    fontWeight: 'bold',
  },
  userInfo: {
    backgroundColor: '#e8f5e8',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});