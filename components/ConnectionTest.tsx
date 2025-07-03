import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';

export function ConnectionTest() {
  const [status, setStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      console.log('🔗 Testing Supabase connection...');

      // Check if environment variables are set
      if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Missing Supabase environment variables');
      }

      // Test simple query
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (error) {
        console.error('❌ Supabase test failed:', error);
        setError(error.message);
        setStatus('error');
      } else {
        console.log('✅ Supabase connection successful');
        setStatus('connected');
      }
    } catch (err: any) {
      console.error('❌ Connection test error:', err);
      setError(err.message);
      setStatus('error');
    }
  };

  if (status === 'testing') {
    return (
      <View style={styles.container}>
        <Text style={styles.testing}>🔗 Testing connection...</Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>❌ Connection failed: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.success}>✅ Connected to Supabase</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    margin: 10,
    borderRadius: 5,
  },
  testing: {
    color: '#666',
    fontSize: 12,
  },
  success: {
    color: '#28a745',
    fontSize: 12,
  },
  error: {
    color: '#dc3545',
    fontSize: 12,
  },
});