import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ConnectionTest } from './ConnectionTest';

export function DebugInfo() {
  const hasSupabaseUrl = !!process.env.EXPO_PUBLIC_SUPABASE_URL;
  const hasSupabaseKey = !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Debug Info</Text>
      <Text style={styles.info}>
        Supabase URL: {hasSupabaseUrl ? '✅ Set' : '❌ Missing'}
      </Text>
      <Text style={styles.info}>
        Supabase Key: {hasSupabaseKey ? '✅ Set' : '❌ Missing'}
      </Text>
      <ConnectionTest />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    margin: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    marginBottom: 5,
  },
});