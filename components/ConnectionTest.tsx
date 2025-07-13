
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase, testConnection } from '@/lib/supabase';

export function ConnectionTest() {
  const [status, setStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [error, setError] = useState<string>('');
  const [details, setDetails] = useState<string>('');

  useEffect(() => {
    performConnectionTest();
  }, []);

  const performConnectionTest = async () => {
    try {
      setStatus('testing');
      setError('');
      setDetails('Testing connection...');
      console.log('🔗 Testing Supabase connection...');

      // Check environment variables
      const hasUrl = !!process.env.EXPO_PUBLIC_SUPABASE_URL;
      const hasKey = !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      
      setDetails(`Environment: URL=${hasUrl}, Key=${hasKey}`);

      if (!hasUrl || !hasKey) {
        throw new Error('Missing Supabase environment variables');
      }

      // Test the connection
      const connected = await testConnection();
      
      if (connected) {
        setStatus('connected');
        setDetails('Connection successful!');
      } else {
        setStatus('error');
        setError('Connection test failed');
        setDetails('Check console for detailed error logs');
      }
    } catch (err: any) {
      console.error('❌ Connection test error:', err);
      setError(err.message || 'Unknown error');
      setDetails('Check console for detailed error logs');
      setStatus('error');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return '#4CAF50';
      case 'error': return '#F44336';
      default: return '#FF9800';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return '✅ Connected';
      case 'error': return '❌ Connection Failed';
      default: return '🔄 Testing...';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.status, { color: getStatusColor() }]}>
        {getStatusText()}
      </Text>
      <Text style={styles.details}>{details}</Text>
      {error && <Text style={styles.error}>Error: {error}</Text>}
      <TouchableOpacity style={styles.button} onPress={performConnectionTest}>
        <Text style={styles.buttonText}>Retry Test</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 16,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  details: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  error: {
    fontSize: 14,
    color: '#F44336',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
