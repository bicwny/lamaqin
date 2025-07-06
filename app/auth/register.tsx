import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dharmaName, setDharmaName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('错误', '请填写所有必填字段');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('错误', '密码不匹配');
      return;
    }

    if (password.length < 6) {
      Alert.alert('错误', '密码至少需要6个字符');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password, dharmaName);

      if (error) {
        Alert.alert('注册失败', error);
      } else {
        Alert.alert(
          '注册成功', 
          '请检查您的邮箱并点击验证链接',
          [
            {
              text: '确定',
              onPress: () => router.replace('/auth/email-verification')
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('错误', '注册过程中出现错误');
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
          <Text className="text-base text-gray-600 text-center leading-6">开启您的修行之路</Text>
        </View>

        <View className="w-full">
          <View className="mb-5">
            <Text className="text-base text-gray-800 mb-2 font-medium">📧 邮箱地址 *</Text>
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
            <Text className="text-base text-gray-800 mb-2 font-medium">🏷️ 法名 (可选)</Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-4 text-base bg-white text-gray-800"
              placeholder="您的法名或修行名"
              value={dharmaName}
              onChangeText={setDharmaName}
              autoCapitalize="words"
            />
          </View>

          <View className="mb-5">
            <Text className="text-base text-gray-800 mb-2 font-medium">🔒 密码 *</Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-4 text-base bg-white text-gray-800"
              placeholder="请输入密码"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View className="mb-5">
            <Text className="text-base text-gray-800 mb-2 font-medium">🔒 确认密码 *</Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-4 text-base bg-white text-gray-800"
              placeholder="请再次输入密码"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            className={`bg-primary rounded-xl py-4 items-center mb-4 ${loading ? 'opacity-50' : ''}`}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text className="text-white text-base font-bold">
              {loading ? '注册中...' : '注册账户'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="items-center py-2"
            onPress={() => router.replace('/auth/login')}
          >
            <Text className="text-primary text-base font-medium">已有账户？立即登录</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}