
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Linking } from 'react-native';

export function DeepLinkTester() {
  const testDeepLink = (url: string) => {
    console.log('Testing deep link:', url);
    Linking.openURL(url);
  };

  const testLinks = [
    'dharmapractice://practice',
    'dharmapractice://study',
    'dharmapractice://mindfulness',
    'dharmapractice://stats',
    'dharmapractice://meditation-history',
    'dharmapractice://auth/login',
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deep Link Tester</Text>
      {testLinks.map((link, index) => (
        <TouchableOpacity
          key={index}
          style={styles.button}
          onPress={() => testDeepLink(link)}
        >
          <Text style={styles.buttonText}>{link}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});
