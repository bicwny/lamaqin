
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import PageTemplate from '@/components/PageTemplate';

export default function ProfileSetupScreen() {
  const { user } = useAuth();
  const [dharmaName, setDharmaName] = useState('');
  const [layName, setLayName] = useState('');
  const [currentClass, setCurrentClass] = useState('');
  const [practiceYears, setPracticeYears] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async () => {
    if (!user) {
      Alert.alert('错误', '用户信息未找到');
      return;
    }

    setLoading(true);
    try {
      // Update user metadata in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          dharma_name: dharmaName.trim() || null,
          lay_name: layName.trim() || null,
          class_name: currentClass.trim() || null,
          practice_years: practiceYears ? parseInt(practiceYears) : null,
          location: location.trim() || null,
        }
      });

      if (authError) {
        console.error('Auth update error:', authError);
      }

      // Update user record in database
      const { error: dbError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          dharma_name: dharmaName.trim() || null,
          lay_name: layName.trim() || null,
          class_name: currentClass.trim() || null,
          practice_years: practiceYears ? parseInt(practiceYears) : null,
          location: location.trim() || null,
          updated_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Database update error:', dbError);
        Alert.alert('保存失败', '数据库更新失败，请稍后重试');
        return;
      }

      // For profile setup, navigate directly without alert to avoid staying on page
      console.log('✅ Profile saved successfully, navigating to main app');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Profile save error:', error);
      Alert.alert('保存失败', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    console.log('⏭️ Skipping profile setup, navigating to main app');
    router.replace('/(tabs)');
  };

  return (
    <PageTemplate
      title="完善个人资料"
      subtitle="帮助我们更好地了解您的修行情况"
      showBackButton={false}
      scrollable={true}
      backgroundColor={Colors.background}
    >
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>🌸</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>👤 法名（可选）</Text>
            <TextInput
              style={styles.input}
              placeholder="如：多吉、白玛等"
              value={dharmaName}
              onChangeText={setDharmaName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>🏷️ 俗名（可选）</Text>
            <TextInput
              style={styles.input}
              placeholder="您的姓名"
              value={layName}
              onChangeText={setLayName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📚 当前学修班级（可选）</Text>
            <TextInput
              style={styles.input}
              placeholder="如：加行班、净土班等"
              value={currentClass}
              onChangeText={setCurrentClass}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>⏰ 修行年限（可选）</Text>
            <TextInput
              style={styles.input}
              placeholder="修行多少年了"
              value={practiceYears}
              onChangeText={setPracticeYears}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📍 所在地区（可选）</Text>
            <TextInput
              style={styles.input}
              placeholder="如：北京、上海等"
              value={location}
              onChangeText={setLocation}
              autoCapitalize="words"
            />
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
            onPress={handleSaveProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <Text style={styles.saveButtonText}>保存资料</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={handleSkip}
            disabled={loading}
          >
            <Text style={styles.skipButtonText}>暂时跳过</Text>
          </TouchableOpacity>

          <View style={styles.noteSection}>
            <Text style={styles.noteTitle}>💡 温馨提示</Text>
            <Text style={styles.noteText}>
              • 所有信息都是可选的{'\n'}
              • 您可以随时在个人资料页面修改{'\n'}
              • 我们会保护您的隐私信息
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </PageTemplate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    marginBottom: 10,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: Colors.surface,
    color: Colors.text,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    alignItems: 'center',
    marginTop: 15,
    paddingVertical: 10,
  },
  skipButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  noteSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  noteText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
