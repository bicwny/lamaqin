
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
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';

export default function OnboardingScreen() {
  const { user } = useAuth();
  const [dharmaName, setDharmaName] = useState('');
  const [layName, setLayName] = useState('');
  const [currentClass, setCurrentClass] = useState('入行班');
  const [practiceYears, setPracticeYears] = useState('0');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const classOptions = ['入行班', '加行班', '净土班', '密法班', '其他'];

  const handleCompleteProfile = async () => {
    if (!user) {
      Alert.alert('错误', '用户信息丢失，请重新登录');
      router.replace('/auth');
      return;
    }

    setLoading(true);
    try {
      // Create user record in our database
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          dharma_name: dharmaName.trim() || null,
          lay_name: layName.trim() || null,
          current_class: currentClass,
          practice_years: parseInt(practiceYears) || 0,
          location: location.trim() || null,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating user:', insertError);
        Alert.alert('保存失败', '无法保存个人信息，请重试');
        return;
      }

      // Update Supabase auth metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          dharma_name: dharmaName.trim() || null,
          lay_name: layName.trim() || null,
          current_class: currentClass,
          onboarding_completed: true
        }
      });

      if (updateError) {
        console.warn('Failed to update auth metadata:', updateError);
        // Continue anyway, as the main user record was created
      }

      Alert.alert(
        '欢迎！', 
        '个人信息设置完成，开始您的修行之旅吧！',
        [
          { text: '开始修行', onPress: () => router.replace('/(tabs)/index') }
        ]
      );
    } catch (error) {
      console.error('Onboarding error:', error);
      Alert.alert('设置失败', '发生未知错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      '跳过设置？',
      '您可以稍后在个人资料页面完善这些信息',
      [
        { text: '继续设置', style: 'cancel' },
        { 
          text: '跳过', 
          onPress: async () => {
            // Create minimal user record
            try {
              const { error } = await supabase
                .from('users')
                .insert({
                  id: user?.id,
                  email: user?.email,
                  created_at: new Date().toISOString()
                });

              if (error) {
                console.error('Error creating minimal user:', error);
              }
            } catch (err) {
              console.error('Skip onboarding error:', err);
            }
            
            router.replace('/(tabs)/index');
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>🌸</Text>
          <Text style={styles.title}>欢迎加入</Text>
          <Text style={styles.subtitle}>请完善您的个人信息</Text>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>第 1 步，共 1 步</Text>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>👤 法名 (Dharma Name)</Text>
            <TextInput
              style={styles.input}
              placeholder="如：多吉、白玛等（可选）"
              value={dharmaName}
              onChangeText={setDharmaName}
              autoCapitalize="words"
              maxLength={20}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>🏷️ 俗名 (Lay Name)</Text>
            <TextInput
              style={styles.input}
              placeholder="您的姓名（可选）"
              value={layName}
              onChangeText={setLayName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📚 当前班级 *</Text>
            <View style={styles.classContainer}>
              {classOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.classOption,
                    currentClass === option && styles.classOptionSelected
                  ]}
                  onPress={() => setCurrentClass(option)}
                >
                  <Text style={[
                    styles.classOptionText,
                    currentClass === option && styles.classOptionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>⏰ 修行年限</Text>
            <TextInput
              style={styles.input}
              placeholder="修行多少年了？（默认0年）"
              value={practiceYears}
              onChangeText={(text) => {
                // Only allow numbers
                const numericText = text.replace(/[^0-9]/g, '');
                setPracticeYears(numericText);
              }}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📍 常住地</Text>
            <TextInput
              style={styles.input}
              placeholder="如：纽约、北京等（可选）"
              value={location}
              onChangeText={setLocation}
              autoCapitalize="words"
            />
          </View>

          <TouchableOpacity 
            style={[styles.completeButton, loading && styles.completeButtonDisabled]} 
            onPress={handleCompleteProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <Text style={styles.completeButtonText}>完成设置</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={handleSkip}
            disabled={loading}
          >
            <Text style={styles.skipButtonText}>暂时跳过</Text>
          </TouchableOpacity>

          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              💡 这些信息可以帮助我们为您提供更好的修行体验，您也可以稍后在个人资料页面修改
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 10,
  },
  progressContainer: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  progressText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
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
  classContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  classOption: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  classOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  classOptionText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  classOptionTextSelected: {
    color: Colors.surface,
  },
  completeButton: {
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
  completeButtonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
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
  noteContainer: {
    backgroundColor: '#F0F8FF',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  noteText: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
