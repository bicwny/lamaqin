import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '@/lib/supabase';

export function DebugInfo() {
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPractices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('practices')
        .select('*')
        .limit(20);

      if (error) throw error;

      console.log('📋 All available practices:', data);
      setPractices(data || []);
    } catch (error) {
      console.error('Error loading practices:', error);
      setPractices([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>调试信息</Text>

      <TouchableOpacity style={styles.button} onPress={loadPractices}>
        <Text style={styles.buttonText}>
          {loading ? '加载中...' : '加载修行项目'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>可用修行项目 ({practices.length}): </Text>
      {practices.map((practice: any, index) => (
        <View key={practice.id} style={styles.practiceItem}>
          <Text style={styles.practiceName}>{practice.name}</Text>
          <Text style={styles.practiceDetails}>
            类型: {practice.type} | 单位: {practice.unit}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  practiceItem: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  practiceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  practiceDetails: {
    fontSize: 14,
    color: 'gray',
  },
});

export function ConnectionTest() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch(process.env.EXPO_PUBLIC_SUPABASE_URL + '/health', {
          method: 'GET',
          headers: {
            apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
          },
        });
        setIsConnected(response.ok);
      } catch (error) {
        console.error('Connection test failed:', error);
        setIsConnected(false);
      }
    };

    testConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔗 Connection Test</Text>
      <Text style={styles.text}>
        Status: {isConnected ? '✅ Connected' : '❌ Not Connected'}
      </Text>
    </View>
  );
}

const styles2 = StyleSheet.create({
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

export function Welcome() {
  return (
    <View style={styles3.container}>
      <Text style={styles3.title}>欢迎!</Text>
      <Text style={styles3.subtitle}>
        请选择你的修行项目
      </Text>
    </View>
  );
}

const styles3 = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
  },
});

export function SectionHeader({ title }) {
  return (
    <View style={styles4.container}>
      <Text style={styles4.title}>{title}</Text>
    </View>
  );
}

const styles4 = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#e2e8f0',
    marginTop: 20,
    marginHorizontal: 16,
  },
});Bottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});