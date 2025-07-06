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

export default function RegisterScreen() {
  const [dharmaName, setDharmaName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('提示', '请填写必填项目');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('提示', '两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      Alert.alert('提示', '密码至少需要6位字符');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            dharma_name: dharmaName.trim() || null,
          },
        },
      });

      if (error) {
        Alert.alert('注册失败', error.message);
      } else {
        // Redirect to email verification page instead of login
        router.push({
          pathname: '/auth/email-verification',
          params: { email }
        });
      }
    } catch (error) {
      Alert.alert('注册失败', '网络错误，请稍后重试');
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
          <Text className="text-5xl mb-2">🌸</Text>
          <Text className="text-3xl font-bold text-primary mb-2">开始修行</Text>
          <Text className="text-base text-gray-600 text-center leading-6">注册账户，开启您的修行之旅</Text>
        </View>

        <View className="w-full">
          <View className="mb-5">
            <Text className="text-base text-gray-800 mb-2 font-medium">👤 法名（可选）</Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-4 text-base bg-white text-gray-800"
              placeholder="如：多吉、白玛等"
              value={dharmaName}
              onChangeText={setDharmaName}
              autoCapitalize="words"
            />
          </View>

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
            <Text className="text-base text-gray-800 mb-2 font-medium">🔒 密码 *</Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-4 text-base bg-white text-gray-800"
              placeholder="至少6位密码"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
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
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity 
            className={`bg-primary py-4 rounded-xl items-center mt-2 shadow-lg ${loading ? 'opacity-60' : ''}`}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-bold">注册</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center items-center mt-8">
            <Text className="text-gray-600 text-base mr-1">已有账户？</Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity>
                <Text className="text-primary text-base font-bold">立即登录</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}