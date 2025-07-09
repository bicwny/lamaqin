
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';

interface ProfileData {
  dharmaName: string;
  layName: string;
  currentClass: string;
  practiceYears: string;
  location: string;
}

const classOptions = [
  { label: '入行班', value: '入行班' },
  { label: '加行班', value: '加行班' },
  { label: '净土班', value: '净土班' },
  { label: '密法班', value: '密法班' },
  { label: '其他', value: '其他' },
];

export default function Onboarding() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    dharmaName: '',
    layName: '',
    currentClass: '入行班',
    practiceYears: '0',
    location: '',
  });

  const handleProfileUpdate = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleComplete = async () => {
    if (!user) {
      Alert.alert('错误', '用户信息未找到，请重新登录');
      return;
    }

    setLoading(true);
    try {
      console.log('💾 Creating user profile for:', user.email);
      
      const userData = {
        id: user.id,
        email: user.email,
        dharma_name: profile.dharmaName.trim() || null,
        lay_name: profile.layName.trim() || null,
        current_class: profile.currentClass,
        practice_years: parseInt(profile.practiceYears) || 0,
        location: profile.location.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('users')
        .insert([userData]);

      if (error) {
        console.error('❌ Error creating user profile:', error);
        throw error;
      }

      console.log('✅ User profile created successfully');
      Alert.alert(
        '欢迎！', 
        '您的档案已创建完成，开始您的修行之旅吧！',
        [
          {
            text: '开始修行',
            onPress: () => router.replace('/(tabs)'),
          }
        ]
      );

    } catch (error: any) {
      console.error('❌ Error in handleComplete:', error);
      Alert.alert(
        '保存失败', 
        error.message || '保存档案时出现错误，请重试',
        [
          { text: '重试', onPress: handleComplete },
          { text: '跳过', onPress: () => router.replace('/(tabs)') }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      '跳过档案设置？',
      '您可以稍后在个人档案页面完善这些信息',
      [
        { text: '继续完善', style: 'cancel' },
        { text: '跳过', onPress: () => router.replace('/(tabs)') }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>完善个人档案</Text>
            <Text style={styles.subtitle}>
              欢迎加入修行之路！请完善您的基本信息
            </Text>

            <View style={styles.form}>
              {/* Dharma Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>法名 (可选)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="如：多吉丹"
                  value={profile.dharmaName}
                  onChangeText={(text) => handleProfileUpdate('dharmaName', text)}
                  maxLength={20}
                  editable={!loading}
                />
              </View>

              {/* Lay Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>俗名 (可选)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="您的姓名"
                  value={profile.layName}
                  onChangeText={(text) => handleProfileUpdate('layName', text)}
                  maxLength={30}
                  editable={!loading}
                />
              </View>

              {/* Current Class */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>当前班级</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={profile.currentClass}
                    onValueChange={(value) => handleProfileUpdate('currentClass', value)}
                    style={styles.picker}
                    enabled={!loading}
                  >
                    {classOptions.map((option) => (
                      <Picker.Item 
                        key={option.value} 
                        label={option.label} 
                        value={option.value} 
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Practice Years */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>修行年限</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={profile.practiceYears}
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9]/g, '');
                    if (parseInt(numericText) <= 50 || numericText === '') {
                      handleProfileUpdate('practiceYears', numericText);
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={2}
                  editable={!loading}
                />
                <Text style={styles.helperText}>年 (0-50)</Text>
              </View>

              {/* Location */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>常住地 (可选)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="如：纽约"
                  value={profile.location}
                  onChangeText={(text) => handleProfileUpdate('location', text)}
                  maxLength={50}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleComplete}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? '保存中...' : '完成设置'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleSkip}
                disabled={loading}
              >
                <Text style={styles.secondaryButtonText}>跳过</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    width: '100%',
    maxWidth: 350,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 350,
    gap: 12,
    marginTop: 20,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.light.tint,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
