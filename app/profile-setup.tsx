
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

export default function ProfileSetupScreen() {
  const { user } = useAuth();
  const [dharmaName, setDharmaName] = useState('');
  const [layName, setLayName] = useState('');
  const [currentClass, setCurrentClass] = useState('');
  const [practiceYears, setPracticeYears] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user?.id) {
      setInitialLoading(false);
      return;
    }

    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('dharma_name, lay_name, location, practice_years, class_name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Error fetching user data:', error);
      } else if (userData) {
        console.log('✅ Preloaded user data:', userData);
        setDharmaName(userData.dharma_name || '');
        setLayName(userData.lay_name || '');
        setLocation(userData.location || '');
        setPracticeYears(userData.practice_years ? userData.practice_years.toString() : '');
        setCurrentClass(userData.class_name || '');
      }
    } catch (error) {
      console.error('❌ Error loading profile:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) {
      Alert.alert('错误', '用户信息未找到');
      return;
    }

    // Validate minimal requirements
    if (!dharmaName.trim()) {
      Alert.alert('请填写法名', '法名是必填项，请输入您的法名');
      return;
    }

    if (!currentClass.trim()) {
      Alert.alert('请填写班级', '班级是必填项，请输入您当前的学修班级');
      return;
    }

    if (!location.trim()) {
      Alert.alert('请填写地区', '地区是必填项，请输入您所在的地区');
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

      Alert.alert('保存成功', '个人资料已更新', [
        {
          text: '确定',
          onPress: () => {
            // Navigate to tabs - AuthContext will handle proper routing
            router.replace('/(tabs)');
          }
        }
      ]);
    } catch (error) {
      console.error('Profile save error:', error);
      Alert.alert('保存失败', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Check if minimal requirements are met
    const hasMinimalInfo = dharmaName.trim() && currentClass.trim() && location.trim();
    
    if (!hasMinimalInfo) {
      Alert.alert(
        '信息不完整',
        '请至少填写法名、班级和地区信息才能继续使用应用',
        [{ text: '确定' }]
      );
      return;
    }

    Alert.alert(
      '跳过设置',
      '您可以稍后在个人资料页面完善其他信息',
      [
        { text: '继续设置', style: 'cancel' },
        { 
          text: '跳过', 
          onPress: () => router.replace('/(tabs)') 
        }
      ]
    );
  };

  if (initialLoading) {
    return (
      <KeyboardAvoidingView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.logo}>🌸</Text>
          <Text style={styles.title}>加载中...</Text>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>🌸</Text>
          <Text style={styles.title}>完善个人资料</Text>
          <Text style={styles.subtitle}>
            帮助我们更好地了解您的修行情况
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>👤 法名 <Text style={styles.required}>*</Text></Text>
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
            <Text style={styles.inputLabel}>📚 当前学修班级 <Text style={styles.required}>*</Text></Text>
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
            <Text style={styles.inputLabel}>📍 所在地区 <Text style={styles.required}>*</Text></Text>
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
              • 法名、班级、地区为必填项{'\n'}
              • 其他信息可选填，随时可修改{'\n'}
              • 我们会保护您的隐私信息
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
  required: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
