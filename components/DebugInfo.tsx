
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function DebugInfo() {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Info</Text>
      <Text style={styles.text}>
        Supabase URL: {supabaseUrl ? 'Set' : 'Missing'}
      </Text>
      <Text style={styles.text}>
        Supabase Key: {supabaseKey ? 'Set' : 'Missing'}
      </Text>
      <Text style={styles.text}>
        Environment: {__DEV__ ? 'Development' : 'Production'}
      </Text>
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
