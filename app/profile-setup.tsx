
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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { ComponentTokens } from '@/utils/componentTokens';
import { useAuth } from '@/contexts/AuthContext';
import { classCurriculumService } from '@/lib/database';
import type { ClassCurriculum } from '@/types/database';
import PageTemplate from '@/components/PageTemplate';

export default function ProfileSetupScreen() {
  const { user } = useAuth();
  const [dharmaName, setDharmaName] = useState('');
  const [layName, setLayName] = useState('');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [practiceYears, setPracticeYears] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [availableClasses, setAvailableClasses] = useState<ClassCurriculum[]>([]);

  useEffect(() => {
    loadDataAndClasses();
  }, [user]);

  const loadDataAndClasses = async () => {
    if (!user) return;
    
    try {
      const [classes, enrolledClasses] = await Promise.all([
        classCurriculumService.getAllClassCurricula(),
        classCurriculumService.getUserEnrolledClasses(user.id)
      ]);
      
      setAvailableClasses(classes);
      setSelectedClassIds(enrolledClasses.map(e => e.class_id));
    } catch (error) {
      console.error('Error loading classes:', error);
      Alert.alert('提示', '加载班级列表失败，请稍后重试');
    } finally {
      setLoadingClasses(false);
    }
  };

  const toggleClassSelection = (classId: string) => {
    setSelectedClassIds(prev => {
      if (prev.includes(classId)) {
        return prev.filter(id => id !== classId);
      } else {
        return [...prev, classId];
      }
    });
  };

  const handleSaveProfile = async () => {
    if (!user) {
      Alert.alert('错误', '用户信息未找到');
      return;
    }

    // Validation - matching edit-profile.tsx requirements
    if (!dharmaName.trim()) {
      Alert.alert('验证失败', '请输入法名');
      return;
    }

    if (!layName.trim()) {
      Alert.alert('验证失败', '请输入俗名');
      return;
    }

    if (selectedClassIds.length === 0) {
      Alert.alert('验证失败', '请至少选择一个班级');
      return;
    }

    setLoading(true);
    try {
      const classNames = selectedClassIds
        .map(id => availableClasses.find(c => c.id === id)?.class_name)
        .filter(Boolean)
        .join(', ');

      // Update user metadata in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          dharma_name: dharmaName.trim() || null,
          lay_name: layName.trim() || null,
          class_name: classNames || null,
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
          class_name: classNames || null,
          practice_years: practiceYears ? parseInt(practiceYears) : null,
          location: location.trim() || null,
          updated_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Database update error:', dbError);
        Alert.alert('保存失败', '数据库更新失败，请稍后重试');
        return;
      }

      // Get current enrollments
      const currentEnrollments = await classCurriculumService.getUserEnrolledClasses(user.id);
      const currentClassIds = currentEnrollments.map(e => e.class_id);
      
      // Determine which classes to add and which to remove
      const classesToAdd = selectedClassIds.filter(id => !currentClassIds.includes(id));
      const classesToRemove = currentClassIds.filter(id => !selectedClassIds.includes(id));
      
      // Remove deselected classes
      for (const classId of classesToRemove) {
        try {
          await classCurriculumService.updateEnrollmentStatus(user.id, classId, 'paused');
          console.log(`⏸️ Paused enrollment in class ${classId}`);
        } catch (error) {
          console.error(`Error pausing class ${classId}:`, error);
          Alert.alert('提示', '部分班级退出失败，请稍后重试');
        }
      }
      
      // Enroll in newly selected classes
      for (const classId of classesToAdd) {
        try {
          await classCurriculumService.enrollUserInClass(user.id, classId);
          await classCurriculumService.createPracticeProjectsForClass(user.id, classId);
          console.log(`✅ Enrolled in class ${classId}`);
        } catch (enrollError) {
          console.error(`Error enrolling in class ${classId}:`, enrollError);
          Alert.alert('提示', '部分班级加入失败，请稍后重试');
        }
      }
      
      if (classesToAdd.length > 0 || classesToRemove.length > 0) {
        console.log(`📊 Enrollment updated: +${classesToAdd.length} -${classesToRemove.length}`);
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
            <Text style={styles.inputLabel}>👤 法名 *</Text>
            <TextInput
              style={styles.input}
              placeholder="如：多吉、白玛等"
              value={dharmaName}
              onChangeText={setDharmaName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>🏷️ 俗名 *</Text>
            <TextInput
              style={styles.input}
              placeholder="您的姓名"
              value={layName}
              onChangeText={setLayName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📚 选择学修班级 *（可多选）</Text>
            {loadingClasses ? (
              <View style={styles.classLoadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.classLoadingText}>加载班级列表中...</Text>
              </View>
            ) : (
              <View style={styles.classOptionsContainer}>
                {availableClasses.map((classItem) => (
                  <TouchableOpacity
                    key={classItem.id}
                    style={[
                      styles.classOption,
                      selectedClassIds.includes(classItem.id) && styles.classOptionSelected
                    ]}
                    onPress={() => toggleClassSelection(classItem.id)}
                  >
                    <View style={[
                      styles.checkbox,
                      selectedClassIds.includes(classItem.id) && styles.checkboxSelected
                    ]}>
                      {selectedClassIds.includes(classItem.id) && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                    <View style={styles.classOptionTextContainer}>
                      <Text style={[
                        styles.classOptionText,
                        selectedClassIds.includes(classItem.id) && styles.classOptionTextSelected
                      ]}>
                        {classItem.class_name}
                      </Text>
                      {classItem.description && (
                        <Text style={styles.classOptionDescription}>{classItem.description}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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

          <View style={styles.noteSection}>
            <Text style={styles.noteTitle}>💡 温馨提示</Text>
            <Text style={styles.noteText}>
              • 法名、俗名和班级为必填项{'\n'}
              • 修行年限和常住地为可选项{'\n'}
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
    ...ComponentTokens.input.standard,
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
  classLoadingContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  classLoadingText: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  classOptionsContainer: {
    gap: 12,
  },
  classOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  classOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F4FF',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  classOptionTextContainer: {
    flex: 1,
  },
  classOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  classOptionTextSelected: {
    color: Colors.primary,
  },
  classOptionDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
