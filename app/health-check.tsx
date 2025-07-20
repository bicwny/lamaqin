
import React from 'react';
import { View, Text } from 'react-native';

export default function HealthCheck() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4CAF50' }}>
        ✅ App is running
      </Text>
      <Text style={{ fontSize: 14, marginTop: 10, textAlign: 'center' }}>
        Health check endpoint - deployment is working correctly
      </Text>
    </View>
  );
}
