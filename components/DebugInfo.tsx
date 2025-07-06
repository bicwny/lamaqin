import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
    <View className="flex-1 p-6">
      <Text className="text-2xl font-bold mb-6 text-buddhist-slate">调试信息</Text>

      <TouchableOpacity 
        className="bg-primary rounded-lg p-4 mb-6 active:opacity-80" 
        onPress={loadPractices}
      >
        <Text className="text-white text-center font-bold">
          {loading ? '加载中...' : '加载修行项目'}
        </Text>
      </TouchableOpacity>

      <Text className="text-lg font-bold mt-3 mb-3 text-buddhist-slate">
        可用修行项目 ({practices.length}): 
      </Text>
      {practices.map((practice: any, index) => (
        <View key={practice.id} className="mb-3 p-4 border border-gray-300 rounded-lg bg-surface">
          <Text className="text-base font-bold text-buddhist-slate">{practice.name}</Text>
          <Text className="text-sm text-buddhist-gray">
            类型: {practice.type} | 单位: {practice.unit}
          </Text>
        </View>
      ))}
    </View>
  );
}

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
    <View className="p-6 bg-gray-100 m-3 rounded-lg">
      <Text className="text-base font-bold mb-3 text-buddhist-slate">🔗 Connection Test</Text>
      <Text className="text-sm text-buddhist-gray">
        Status: {isConnected ? '✅ Connected' : '❌ Not Connected'}
      </Text>
    </View>
  );
}

export function Welcome() {
  return (
    <View className="p-6">
      <Text className="text-2xl font-bold mb-3 text-primary">欢迎!</Text>
      <Text className="text-lg text-buddhist-slate">
        请选择你的修行项目
      </Text>
    </View>
  );
}

export function SectionHeader({ title }: { title: string }) {
  return (
    <View className="p-4 bg-gray-200 mt-6 mb-3 rounded-lg">
      <Text className="text-lg font-semibold text-gray-800">{title}</Text>
    </View>
  );
}Name="text-lg font-bold text-buddhist-slate">{title}</Text>
    </View>
  );
}