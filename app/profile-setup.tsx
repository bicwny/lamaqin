import React, { useState, useEffect } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { toastService } from '@/lib/toast';

export default function ProfileSetupScreen() {
  const [dharmaName, setDharmaName] = useState('');
  const [layName, setLayName] = useState('');
  const [currentClass, setCurrentClass] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadUserData();
  }, [user?.id]);

  const loadUserData = async () => {
    if (!user?.id) {
      setInitialLoading(false);
      return;
    }

    try {
      console.log('🔍 Loading existing user data for profile setup:', user.email);

      const { data: userData, error } = await supabase
        .from('users')
        .select('dharma_name, lay_name, class_name, location')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Error loading user data:', error);
      } else if (userData) {
        console.log('✅ Loaded existing user data:', userData);
        // Pre-populate form fields with existing data
        setDharmaName(userData.dharma_name || '');
        setLayName(userData.lay_name || '');
        setCurrentClass(userData.class_name || '');
        setLocation(userData.location || '');
      } else {
        console.log('ℹ️ No existing user data found');
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  

  const handleSaveProfile = async () => {
    if (!user) {
      toastService.error('用户信息未找到');
      return;
    }

    // Validate required fields
    const trimmedLayName = layName.trim();
    const trimmedLocation = location.trim();

    if (!trimmedLayName) {
      toastService.error({
        title: '请填写俗名',
        message: '俗名是必填项，请输入您的姓名'
      });
      return;
    }

    if (!trimmedLocation) {
      toastService.error({
        title: '请填写所在地区',
        message: '所在地区是必填项，请输入您的地区'
      });
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
          location: location.trim() || null,
          updated_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Database update error:', dbError);
        toastService.error({
          title: '保存失败',
          message: '数据库更新失败，请稍后重试'
        });
        return;
      }

      console.log('✅ Profile saved successfully');

      // Show success toast
      toastService.success({
        title: '保存成功',
        message: '个人资料已更新'
      });

      // Navigate to main app after a short delay to show the toast
      setTimeout(() => {
        router.replace('/(tabs)/index');
      }, 1500);
    } catch (error) {
      console.error('Profile save error:', error);
      toastService.error({
        title: '保存失败',
        message: '网络错误，请稍后重试'
      });
    } finally {
      setLoading(false);
    }
  };

  

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>正在加载...</Text>
      </View>
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
            <Text style={styles.inputLabel}>👤 法名</Text>
            <TextInput
              style={styles.input}
              placeholder="如：多吉、白玛等"
              value={dharmaName}
              onChangeText={setDharmaName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, styles.requiredLabel]}>🏷️ 俗名（必填）</Text>
            <TextInput
              style={[styles.input, styles.requiredInput]}
              placeholder="您的姓名 *"
              value={layName}
              onChangeText={setLayName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📚 当前学修班级</Text>
            <TextInput
              style={styles.input}
              placeholder="如：加行班、净土班等"
              value={currentClass}
              onChangeText={setCurrentClass}
              autoCapitalize="words"
            />
          </View>



          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, styles.requiredLabel]}>📍 所在地区（必填）</Text>
            <TextInput
              style={[styles.input, styles.requiredInput]}
              placeholder="如：北京、上海等 *"
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

          

          <View style={styles.noteSection}>
            <Text style={styles.noteTitle}>💡 温馨提示</Text>
            <Text style={styles.noteText}>
              • 俗名和所在地区为必填项{'\n'}
              • 法名和学修班级为可选项{'\n'}
              • 您可以随时在个人资料页面修改{'\n'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  requiredLabel: {
    color: Colors.primary,
    fontWeight: '600',
  },
  requiredInput: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
});