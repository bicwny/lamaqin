
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export function AuthStateDebugger() {
  const { user, loading } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `${timestamp} - User: ${user?.email || 'null'}, Loading: ${loading}`;
    
    setLogs(prev => [...prev.slice(-4), logEntry]); // Keep last 5 logs
    console.log('🐛 AuthStateDebugger:', logEntry);
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐛 Auth Debug</Text>
      {logs.map((log, index) => (
        <Text key={index} style={styles.log}>{log}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  log: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
