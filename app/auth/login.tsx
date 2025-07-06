import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('提示', '请填写邮箱和密码');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert('登录失败', error.message);
      } else {
        router.replace('/(tabs)/index');
      }
    } catch (error) {
      Alert.alert('登录失败', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
        <View className="items-center mb-10">
          <Text className="text-5xl mb-2">🙏</Text>
          <Text className="text-3xl font-bold text-primary mb-2">修行追踪</Text>
          <Text className="text-base text-gray-600 text-center leading-6">欢迎回来，继续您的修行之路</Text>
        </View>

        <View className="w-full">
          <View className="mb-5">
            <Text className="text-base text-gray-800 mb-2 font-medium">📧 邮箱地址</Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-4 text-base bg-white text-gray-800"
              placeholder="请输入您的邮箱"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View className="mb-5">
            <Text className="text-base text-gray-800 mb-2 font-medium">🔒 密码</Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-4 text-base bg-white text-gray-800"
              placeholder="请输入密码"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity 
            className={`bg-primary py-4 rounded-xl items-center mt-2 shadow-lg ${loading ? 'opacity-60' : ''}`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-bold">登录</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            className="items-center mt-5" 
            onPress={() => router.push('/auth/forgot-password')}
          >
            <Text className="text-primary text-base">忘记密码？</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center items-center mt-8">
            <Text className="text-gray-600 text-base mr-1">还没有账户？</Text>
            <Link href="/auth/register" asChild>
              <TouchableOpacity>
                <Text className="text-primary text-base font-bold">立即注册</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}