
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { testConnection } from '@/lib/database';
import { Colors } from '@/constants/Colors';

export default function DatabaseStatus() {
  const [connected, setConnected] = useState(false);
  const [testing, setTesting] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setTesting(true);
    try {
      const result = await testConnection();
      setConnected(result);
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnected(false);
    } finally {
      setTesting(false);
    }
  };

  if (testing) {
    return (
      <View style={styles.container}>
        <Text style={styles.testingText}>测试数据库连接...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.statusText, { color: connected ? '#4CAF50' : '#F44336' }]}>
        {connected ? '🟢 数据库已连接' : '🔴 数据库未连接'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  testingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
