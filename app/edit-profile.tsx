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
  const [enrolledClassIds, setEnrolledClassIds] = useState<string[]>([]);
  const [enrollmentStatuses, setEnrollmentStatuses] = useState<Record<string, 'active' | 'paused' | 'completed'>>({});
  const [availableClasses, setAvailableClasses] = useState<ClassCurriculum[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Practice choice system states
  const [optionalPracticeGroups, setOptionalPracticeGroups] = useState<Map<string, Map<string, any[]>>>(new Map());
  const [selectedPractices, setSelectedPractices] = useState<Map<string, Map<string, string[]>>>(new Map());

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  useEffect(() => {
    loadOptionalPracticesAndChoices();
  }, [enrolledClassIds]);

  const loadUserProfile = async () => {
    if (!user?.id) return;

    try {
      const [userData, classes, allEnrollments] = await Promise.all([
        supabase
          .from('users')
          .select('dharma_name, lay_name, location, class_name')
          .eq('id', user.id)
          .single()
          .then(r => r.data),
        classCurriculumService.getAllClassCurricula(),
        supabase
          .from('user_enrolled_classes')
          .select('class_id, status')
          .eq('user_id', user.id)
      ]);

      if (userData) {
        setDharmaName(userData.dharma_name || '');
        setLayName(userData.lay_name || '');
        setLocation(userData.location || '');
        setCurrentClass(userData.class_name || '');
      }
      
      setAvailableClasses(classes);
      
      // Build enrollment status map
      const statusMap: Record<string, 'active' | 'paused' | 'completed'> = {};
      const enrolledIds: string[] = [];
      const activeIds: string[] = [];
      
      (allEnrollments.data || []).forEach(enrollment => {
        enrolledIds.push(enrollment.class_id);
        statusMap[enrollment.class_id] = enrollment.status as 'active' | 'paused' | 'completed';
        
        // Only active enrollments are selected
        if (enrollment.status === 'active') {
          activeIds.push(enrollment.class_id);
        }
      });
      
      setEnrolledClassIds(enrolledIds);
      setEnrollmentStatuses(statusMap);
      setSelectedClassIds(activeIds);
    } catch (error) {
      console.error('❌ Error loading profile:', error);
    } finally {
      setInitialLoading(false);
      setLoadingClasses(false);
    }
  };

  const loadOptionalPracticesAndChoices = async () => {
    if (!user?.id) return;
    
    const newGroups = new Map<string, Map<string, any[]>>();
    const newSelections = new Map<string, Map<string, string[]>>();
    
    for (const classId of enrolledClassIds) {
      try {
        const [groups, userChoices] = await Promise.all([
          classCurriculumService.getOptionalPracticesByChoiceGroup(classId),
          classCurriculumService.getUserPracticeChoices(user.id, classId)
        ]);
        
        if (groups.size > 0) {
          newGroups.set(classId, groups);
          
          // Build selections map from user's existing choices
          const classSelections = new Map<string, string[]>();
          groups.forEach((_, groupName) => {
            const choicesForGroup = userChoices
              .filter((choice: any) => choice.choice_group === groupName)
              .map((choice: any) => choice.practice_id);
            classSelections.set(groupName, choicesForGroup);
          });
          newSelections.set(classId, classSelections);
        }
      } catch (error) {
        console.error(`Error loading optional practices for class ${classId}:`, error);
      }
    }
    
    setOptionalPracticeGroups(newGroups);
    setSelectedPractices(newSelections);
  };

  const toggleClassSelection = (classId: string) => {
    // Prevent toggling if already enrolled
    if (enrolledClassIds.includes(classId)) {
      return;
    }
    
    setSelectedClassIds(prev => {
      if (prev.includes(classId)) {
        return prev.filter(id => id !== classId);
      } else {
        return [...prev, classId];
      }
    });
  };

  const togglePracticeSelection = (classId: string, groupName: string, practiceId: string) => {
    setSelectedPractices(prev => {
      const newMap = new Map(prev);
      const classMap = newMap.get(classId) || new Map<string, string[]>();
      const groupPractices = classMap.get(groupName) || [];
      
      if (groupPractices.includes(practiceId)) {
        classMap.set(groupName, groupPractices.filter(id => id !== practiceId));
      } else {
        classMap.set(groupName, [...groupPractices, practiceId]);
      }
      
      newMap.set(classId, classMap);
      return newMap;
    });
  };

  const handleSaveProfile = async () => {
    if (!user) {
      toastService.error('用户信息未找到');
      return;
    }

    if (!dharmaName.trim()) {
      toastService.error({ title: '验证失败', message: '请输入法名' });
      return;
    }

    if (!layName.trim()) {
      toastService.error({ title: '验证失败', message: '请输入俗名' });
      return;
    }

    if (selectedClassIds.length === 0) {
      toastService.error({ title: '验证失败', message: '请至少选择一个班级' });
      return;
    }

    // Validate practice choices for enrolled classes - ensure at least one practice is selected for each choice group
    for (const classId of enrolledClassIds) {
      const groups = optionalPracticeGroups.get(classId);
      if (groups) {
        for (const [groupName, practices] of groups) {
          const selectedForGroup = selectedPractices.get(classId)?.get(groupName) || [];
          if (selectedForGroup.length === 0) {
            const className = availableClasses.find(c => c.id === classId)?.class_name || '该班级';
            toastService.error({ 
              title: '验证失败', 
              message: `${className} 的 ${groupName} 请至少选择一项修法` 
            });
            return;
          }
        }
      }
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
          dharma_name: dharmaName.trim(),
          lay_name: layName.trim(),
          class_name: classNames || currentClass.trim() || null,
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

      // Save practice choices for enrolled classes (both existing and new)
      for (const classId of enrolledClassIds) {
        const groups = optionalPracticeGroups.get(classId);
        if (groups) {
          for (const [groupName, practices] of groups) {
            const selectedForGroup = selectedPractices.get(classId)?.get(groupName) || [];
            if (selectedForGroup.length > 0) {
              try {
                await classCurriculumService.saveUserPracticeChoices(
                  user.id,
                  classId,
                  groupName,
                  selectedForGroup
                );
                console.log(`💾 Saved practice choices for ${groupName} in class ${classId}`);
              } catch (error) {
                console.error(`Error saving practice choices for ${groupName}:`, error);
              }
            }
          }
          
          // Sync practice projects for this class based on updated choices
          try {
            await classCurriculumService.syncPracticeProjectsForClass(user.id, classId);
            console.log(`🔄 Synced practice projects for class ${classId}`);
          } catch (error) {
            console.error(`Error syncing practice projects for class ${classId}:`, error);
          }
        }
      }

      // Also update auth metadata for consistency
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          dharma_name: dharmaName.trim(),
          lay_name: layName.trim(),
          class_name: classNames || currentClass.trim() || null,
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
              <ThemedText style={styles.label}>俗名 *</ThemedText>
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
              <ThemedText style={styles.label}>班级 *</ThemedText>
              {loadingClasses ? (
                <ActivityIndicator size="small" color={DesignSystem.colors.primary} />
              ) : (
                <View style={styles.classSelectionContainer}>
                  {availableClasses.length > 0 ? (
                    availableClasses.map((classItem) => {
                      const isEnrolled = enrolledClassIds.includes(classItem.id);
                      const isSelected = selectedClassIds.includes(classItem.id);
                      const enrollmentStatus = enrollmentStatuses[classItem.id];
                      const hasOptionalPractices = optionalPracticeGroups.has(classItem.id);
                      
                      const statusLabel = enrollmentStatus === 'completed' ? '圆满' : '已加入';
                      
                      return (
                        <View key={classItem.id}>
                          <TouchableOpacity
                            style={styles.classCheckbox}
                            onPress={() => toggleClassSelection(classItem.id)}
                            disabled={isEnrolled}
                          >
                            {!isEnrolled && (
                              <View style={[
                                styles.checkbox,
                                isSelected && styles.checkboxSelected
                              ]}>
                                {isSelected && (
                                  <ThemedText style={styles.checkmark}>✓</ThemedText>
                                )}
                              </View>
                            )}
                            <View style={styles.classInfo}>
                              <ThemedText style={styles.className}>
                                {classItem.class_name === '预科：入行' 
                                  ? '🧘 预科：入行 观修选择 *（至少选择一项）'
                                  : classItem.class_name}
                                {isEnrolled && ` (${statusLabel})`}
                              </ThemedText>
                              {classItem.description && (
                                <ThemedText style={styles.classDescription}>
                                  {classItem.description}
                                </ThemedText>
                              )}
                            </View>
                          </TouchableOpacity>

                          {/* Practice choices shown directly under enrolled class */}
                          {isEnrolled && hasOptionalPractices && (
                            <View style={styles.practiceChoiceSection}>
                              <ThemedText style={styles.practiceChoiceTitle}>
                                🧘 观修选择（可修改）
                              </ThemedText>
                              <ThemedText style={styles.practiceChoiceSubtitle}>
                                至少选择一项，可选择多项
                              </ThemedText>
                              {Array.from(optionalPracticeGroups.get(classItem.id)?.entries() || []).map(([groupName, practices]) => {
                                const selectedForGroup = selectedPractices.get(classItem.id)?.get(groupName) || [];
                                
                                return (
                                  <View key={groupName} style={styles.practiceGroupContainer}>
                                    <ThemedText style={styles.practiceGroupLabel}>{groupName}:</ThemedText>
                                    {practices.map((practice: any) => {
                                      const isSelected = selectedForGroup.includes(practice.practice_id);
                                      
                                      return (
                                        <TouchableOpacity
                                          key={practice.practice_id}
                                          style={[
                                            styles.practiceOption,
                                            isSelected && styles.practiceOptionSelected
                                          ]}
                                          onPress={() => togglePracticeSelection(classItem.id, groupName, practice.practice_id)}
                                        >
                                          <View style={[
                                            styles.checkbox,
                                            isSelected && styles.checkboxSelected
                                          ]}>
                                            {isSelected && (
                                              <ThemedText style={styles.checkmark}>✓</ThemedText>
                                            )}
                                          </View>
                                          <View style={styles.practiceOptionTextContainer}>
                                            <ThemedText style={[
                                              styles.practiceOptionText,
                                              isSelected && styles.practiceOptionTextSelected
                                            ]}>
                                              {practice.practice?.name || '未知修法'}
                                            </ThemedText>
                                            {practice.practice?.description && (
                                              <ThemedText style={styles.practiceOptionDescription}>
                                                {practice.practice.description}
                                              </ThemedText>
                                            )}
                                          </View>
                                        </TouchableOpacity>
                                      );
                                    })}
                                  </View>
                                );
                              })}
                            </View>
                          )}
                        </View>
                      );
                    })
                  ) : (
                    <ThemedText style={styles.noClassesText}>暂无可选班级</ThemedText>
                  )}
                </View>
              )}
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
  classCheckboxDisabled: {
    opacity: 0.5,
    backgroundColor: '#F5F5F5',
  },
  checkboxDisabled: {
    backgroundColor: '#E0E0E0',
    borderColor: '#BDBDBD',
  },
  classNameDisabled: {
    color: '#9E9E9E',
  },
  classDescriptionDisabled: {
    color: '#BDBDBD',
  },
  // Practice choice styles
  practiceChoiceSection: {
    padding: 16,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
    gap: 12,
  },
  practiceChoiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  practiceChoiceSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  practiceGroupContainer: {
    gap: 8,
  },
  practiceGroupLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  practiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    gap: 12,
  },
  practiceOptionSelected: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  practiceOptionTextContainer: {
    flex: 1,
    gap: 4,
  },
  practiceOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  practiceOptionTextSelected: {
    color: '#FF9800',
  },
  practiceOptionDescription: {
    fontSize: 12,
    color: '#666',
  },
});