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
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { DesignSystem, createStyles } from '@/constants/DesignSystem';
import { ComponentTokens } from '@/utils/componentTokens';
import { useAuth } from '@/contexts/AuthContext';
import PageTemplate from '@/components/PageTemplate';
import { ThemedText } from '@/components/ThemedText';
import { toastService } from '@/lib/toast';
import { classCurriculumService } from '@/lib/database';
import type { ClassCurriculum } from '@/types/database';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const [dharmaName, setDharmaName] = useState('');
  const [layName, setLayName] = useState('');
  const [currentClass, setCurrentClass] = useState('');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [availableClasses, setAvailableClasses] = useState<ClassCurriculum[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [practiceYears, setPracticeYears] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user?.id) return;

    try {
      const [userData, classes, enrolledClasses] = await Promise.all([
        supabase
          .from('users')
          .select('dharma_name, lay_name, location, practice_years, class_name')
          .eq('id', user.id)
          .single()
          .then(r => r.data),
        classCurriculumService.getAllClassCurricula(),
        classCurriculumService.getUserEnrolledClasses(user.id)
      ]);

      if (userData) {
        setDharmaName(userData.dharma_name || '');
        setLayName(userData.lay_name || '');
        setLocation(userData.location || '');
        setPracticeYears(userData.practice_years ? userData.practice_years.toString() : '');
        setCurrentClass(userData.class_name || '');
      }
      
      setAvailableClasses(classes);
      setSelectedClassIds(enrolledClasses.map(e => e.class_id));
    } catch (error) {
      console.error('❌ Error loading profile:', error);
    } finally {
      setInitialLoading(false);
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
      toastService.error('用户信息未找到');
      return;
    }

    setLoading(true);
    try {
      const classNames = selectedClassIds
        .map(id => availableClasses.find(c => c.id === id)?.class_name)
        .filter(Boolean)
        .join(', ');

      // Update user data in database
      const { error: dbError } = await supabase
        .from('users')
        .update({
          dharma_name: dharmaName.trim() || null,
          lay_name: layName.trim() || null,
          class_name: classNames || currentClass.trim() || null,
          practice_years: practiceYears ? parseInt(practiceYears) : null,
          location: location.trim() || null,
        })
        .eq('id', user.id);

      if (dbError) {
        console.error('Database update error:', dbError);
        toastService.error({
          title: '保存失败',
          message: '更新数据库时发生错误，请重试'
        });
        return;
      }

      // Handle class enrollments
      const currentEnrollments = await classCurriculumService.getUserEnrolledClasses(user.id);
      const currentClassIds = currentEnrollments.map(e => e.class_id);
      
      const classesToAdd = selectedClassIds.filter(id => !currentClassIds.includes(id));
      const classesToRemove = currentClassIds.filter(id => !selectedClassIds.includes(id));
      
      // Pause deselected classes
      for (const classId of classesToRemove) {
        try {
          await classCurriculumService.updateEnrollmentStatus(user.id, classId, 'paused');
          console.log(`⏸️ Paused enrollment in class ${classId}`);
        } catch (error) {
          console.error(`Error pausing class ${classId}:`, error);
        }
      }
      
      // Enroll in newly selected classes
      for (const classId of classesToAdd) {
        try {
          await classCurriculumService.enrollUserInClass(user.id, classId);
          await classCurriculumService.createPracticeProjectsForClass(user.id, classId);
          console.log(`✅ Enrolled in class ${classId}`);
        } catch (error) {
          console.error(`Error enrolling in class ${classId}:`, error);
        }
      }

      // Also update auth metadata for consistency
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          dharma_name: dharmaName.trim() || null,
          lay_name: layName.trim() || null,
          class_name: classNames || currentClass.trim() || null,
          practice_years: practiceYears ? parseInt(practiceYears) : null,
          location: location.trim() || null,
        }
      });

      if (authError) {
        console.warn('Auth metadata update warning:', authError);
      }

      toastService.success({
        title: '保存成功',
        message: '个人资料已更新'
      });

    } catch (error) {
      console.error('❌ Save profile error:', error);
      toastService.error({
        title: '保存失败',
        message: '请检查网络连接后重试'
      });
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  if (initialLoading) {
    return (
      <PageTemplate
        title="编辑个人资料"
        subtitle="正在加载..."
        showBackButton={true}
        onBackPress={goBack}
        scrollable={false}
        backgroundColor={DesignSystem.colors.background}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DesignSystem.colors.primary} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="编辑个人资料"
      subtitle="更新您的个人信息"
      showBackButton={true}
      onBackPress={goBack}
      scrollable={true}
      backgroundColor={DesignSystem.colors.background}
      padding={0}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
          <View style={styles.formContainer}>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>法名 *</ThemedText>
              <TextInput
                style={styles.input}
                value={dharmaName}
                onChangeText={setDharmaName}
                placeholder="请输入您的法名"
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>俗名</ThemedText>
              <TextInput
                style={styles.input}
                value={layName}
                onChangeText={setLayName}
                placeholder="请输入您的俗名"
                placeholderTextColor="#999"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>班级</ThemedText>
              {loadingClasses ? (
                <ActivityIndicator size="small" color={DesignSystem.colors.primary} />
              ) : (
                <View style={styles.classSelectionContainer}>
                  {availableClasses.length > 0 ? (
                    availableClasses.map((classItem) => (
                      <TouchableOpacity
                        key={classItem.id}
                        style={styles.classCheckbox}
                        onPress={() => toggleClassSelection(classItem.id)}
                      >
                        <View style={[
                          styles.checkbox,
                          selectedClassIds.includes(classItem.id) && styles.checkboxSelected
                        ]}>
                          {selectedClassIds.includes(classItem.id) && (
                            <ThemedText style={styles.checkmark}>✓</ThemedText>
                          )}
                        </View>
                        <View style={styles.classInfo}>
                          <ThemedText style={styles.className}>{classItem.class_name}</ThemedText>
                          {classItem.description && (
                            <ThemedText style={styles.classDescription}>{classItem.description}</ThemedText>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <ThemedText style={styles.noClassesText}>暂无可选班级</ThemedText>
                  )}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>修行年限</ThemedText>
              <TextInput
                style={styles.input}
                value={practiceYears}
                onChangeText={setPracticeYears}
                placeholder="请输入修行年数"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>常住地</ThemedText>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="例如：纽约、北京等"
                placeholderTextColor="#999"
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
              onPress={handleSaveProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>保存更改</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={goBack}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>

          </View>
      </KeyboardAvoidingView>
    </PageTemplate>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    padding: 20,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  input: {
    ...ComponentTokens.input.standard,
    ...DesignSystem.shadow.sm,
  },
  saveButton: {
    ...createStyles.primaryButton(),
    marginTop: DesignSystem.spacing.xl,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  classSelectionContainer: {
    gap: 12,
  },
  classCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: DesignSystem.colors.primary,
    borderColor: DesignSystem.colors.primary,
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  classInfo: {
    flex: 1,
    gap: 4,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  classDescription: {
    fontSize: 14,
    color: '#666',
  },
  noClassesText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});