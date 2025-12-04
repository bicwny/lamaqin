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
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { DesignSystem, createStyles } from '@/constants/DesignSystem';
import { ComponentTokens } from '@/utils/componentTokens';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import PageTemplate from '@/components/PageTemplate';
import { ThemedText } from '@/components/ThemedText';
import { toastService } from '@/lib/toast';
import { classCurriculumService } from '@/lib/database';
import type { ClassCurriculum } from '@/types/database';

// Generate entry year options from 1984 to current year
const generateEntryYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let year = 1984; year <= currentYear; year++) {
    years.push(year.toString());
  }
  return years.reverse(); // Most recent first
};

const ENTRY_YEAR_OPTIONS = generateEntryYearOptions();

export default function EditProfileScreen() {
  const { user } = useAuth();
  const [dharmaName, setDharmaName] = useState('');
  const [noDharmaName, setNoDharmaName] = useState(false);
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
  
  // Entry year tracking
  const [entryYears, setEntryYears] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  useEffect(() => {
    loadOptionalPracticesAndChoices();
  }, [enrolledClassIds, selectedClassIds]);

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
          .select('class_id, status, entry_year')
          .eq('user_id', user.id)
      ]);

      if (userData) {
        const hasDharmaName = userData.dharma_name && userData.dharma_name.trim() !== '';
        setDharmaName(userData.dharma_name || '');
        setNoDharmaName(!hasDharmaName);
        setLayName(userData.lay_name || '');
        setLocation(userData.location || '');
        setCurrentClass(userData.class_name || '');
      }
      
      setAvailableClasses(classes);
      
      // Build enrollment status map and entry years
      const statusMap: Record<string, 'active' | 'paused' | 'completed'> = {};
      const enrolledIds: string[] = [];
      const activeIds: string[] = [];
      const entryYearMap = new Map<string, string>();
      
      (allEnrollments.data || []).forEach(enrollment => {
        enrolledIds.push(enrollment.class_id);
        statusMap[enrollment.class_id] = enrollment.status as 'active' | 'paused' | 'completed';
        
        // Store entry year if it exists
        if (enrollment.entry_year) {
          entryYearMap.set(enrollment.class_id, enrollment.entry_year);
        }
        
        // Only active enrollments are selected
        if (enrollment.status === 'active') {
          activeIds.push(enrollment.class_id);
        }
      });
      
      setEnrolledClassIds(enrolledIds);
      setEnrollmentStatuses(statusMap);
      setSelectedClassIds(activeIds);
      setEntryYears(entryYearMap);
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
    
    // Get all classes that need practice loading (enrolled + selected)
    const classIdsToLoad = Array.from(new Set([...enrolledClassIds, ...selectedClassIds]));
    
    for (const classId of classIdsToLoad) {
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

  const updateEntryYear = (classId: string, year: string) => {
    setEntryYears(prev => {
      const newMap = new Map(prev);
      newMap.set(classId, year);
      return newMap;
    });
  };

  const updateEntryYearForEnrolled = async (classId: string, year: string) => {
    if (!user || !year) return;
    
    // Update local state first
    updateEntryYear(classId, year);
    
    try {
      // Update in database
      const { error } = await supabase
        .from('user_enrolled_classes')
        .update({ entry_year: year })
        .eq('user_id', user.id)
        .eq('class_id', classId);
      
      if (error) throw error;
      
      toastService.success('年份已更新');
    } catch (error: any) {
      console.error('Error updating entry year:', error);
      toastService.error('更新年份失败');
    }
  };

  const toggleEnrollmentStatus = async (classId: string) => {
    if (!user) return;
    
    const currentStatus = enrollmentStatuses[classId];
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    const className = availableClasses.find(c => c.id === classId)?.class_name || '班级';
    
    try {
      await classCurriculumService.updateEnrollmentStatus(user.id, classId, newStatus);
      
      // Update local state
      setEnrollmentStatuses(prev => ({
        ...prev,
        [classId]: newStatus
      }));
      
      // Update selectedClassIds to reflect the change
      if (newStatus === 'paused') {
        setSelectedClassIds(prev => prev.filter(id => id !== classId));
      } else {
        setSelectedClassIds(prev => [...prev, classId]);
      }
      
      toastService.success({
        title: newStatus === 'paused' ? '已暂停' : '已恢复',
        message: `${className} ${newStatus === 'paused' ? '学习已暂停' : '学习已恢复'}`
      });
    } catch (error: any) {
      console.error('Error toggling enrollment status:', error);
      toastService.error({
        title: '操作失败',
        message: '更新班级状态时发生错误'
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) {
      toastService.error('用户信息未找到');
      return;
    }

    if (!noDharmaName && !dharmaName.trim()) {
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

    // Validate entry year for newly selected classes
    const newClassIds = selectedClassIds.filter(id => !enrolledClassIds.includes(id));
    for (const classId of newClassIds) {
      const entryYear = entryYears.get(classId);
      if (!entryYear) {
        const className = availableClasses.find(c => c.id === classId)?.class_name || '该班级';
        toastService.error({ 
          title: '验证失败', 
          message: `请为 ${className} 选择入行年份` 
        });
        return;
      }
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
          dharma_name: noDharmaName ? null : dharmaName.trim(),
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
          const entryYear = entryYears.get(classId);
          await classCurriculumService.enrollUserInClass(user.id, classId, entryYear);
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
          dharma_name: noDharmaName ? null : dharmaName.trim(),
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
        backgroundColor={Colors.background}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
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
      backgroundColor={Colors.background}
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
                style={[styles.input, noDharmaName && styles.inputDisabled]}
                value={dharmaName}
                onChangeText={setDharmaName}
                placeholder="请输入您的法名"
                placeholderTextColor={Colors.textSecondary}
                autoCapitalize="none"
                editable={!noDharmaName}
              />
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => {
                  setNoDharmaName(!noDharmaName);
                  if (!noDharmaName) {
                    setDharmaName('');
                  }
                }}
              >
                <View style={[styles.smallCheckbox, noDharmaName && styles.smallCheckboxSelected]}>
                  {noDharmaName && <ThemedText style={styles.smallCheckmark}>✓</ThemedText>}
                </View>
                <ThemedText style={styles.checkboxLabel}>未得法名</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>俗名 *</ThemedText>
              <TextInput
                style={styles.input}
                value={layName}
                onChangeText={setLayName}
                placeholder="请输入您的俗名"
                placeholderTextColor={Colors.textSecondary}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>班级 *</ThemedText>
              {loadingClasses ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <View style={styles.classSelectionContainer}>
                  {availableClasses.length > 0 ? (
                    availableClasses.map((classItem) => {
                      const isEnrolled = enrolledClassIds.includes(classItem.id);
                      const isSelected = selectedClassIds.includes(classItem.id);
                      const enrollmentStatus = enrollmentStatuses[classItem.id];
                      const hasOptionalPractices = optionalPracticeGroups.has(classItem.id);
                      
                      const statusLabel = enrollmentStatus === 'completed' ? '圆满' 
                        : enrollmentStatus === 'paused' ? '已暂停' 
                        : '学习中';
                      const isPaused = enrollmentStatus === 'paused';
                      
                      return (
                        <View key={classItem.id}>
                          <View style={[
                            styles.classCheckbox,
                            isSelected && styles.classCheckboxSelected,
                            isPaused && styles.classCheckboxPaused
                          ]}>
                            <TouchableOpacity
                              style={styles.classMainArea}
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
                                <ThemedText style={[
                                  styles.className,
                                  isSelected && styles.classNameSelected,
                                  isPaused && styles.classNamePaused
                                ]}>
                                  {classItem.class_name}
                                  {isEnrolled && ` (${statusLabel})`}
                                </ThemedText>
                                {classItem.description && (
                                  <ThemedText style={styles.classDescription}>
                                    {classItem.description}
                                  </ThemedText>
                                )}
                              </View>
                            </TouchableOpacity>
                            
                            {/* Pause/Resume button for enrolled classes */}
                            {isEnrolled && enrollmentStatus !== 'completed' && (
                              <TouchableOpacity
                                style={[
                                  styles.statusToggleButton,
                                  isPaused ? styles.resumeButton : styles.pauseButton
                                ]}
                                onPress={() => toggleEnrollmentStatus(classItem.id)}
                              >
                                <ThemedText style={[
                                  styles.statusToggleText,
                                  isPaused && styles.resumeButtonText
                                ]}>
                                  {isPaused ? '恢复' : '暂停'}
                                </ThemedText>
                              </TouchableOpacity>
                            )}
                          </View>

                          {/* Combined Year & Practice Selection - for both new and enrolled classes */}
                          {(isSelected && !isEnrolled) || isEnrolled ? (
                            <View style={styles.combinedSelectionSection}>
                              {/* Year Selection */}
                              <View style={styles.yearFieldContainer}>
                                <ThemedText style={styles.fieldLabel}>📅 年份{!isEnrolled && ' *'}</ThemedText>
                                <View style={styles.pickerContainer}>
                                  <Picker
                                    selectedValue={entryYears.get(classItem.id) || ''}
                                    onValueChange={(value) => 
                                      isEnrolled 
                                        ? updateEntryYearForEnrolled(classItem.id, value)
                                        : updateEntryYear(classItem.id, value)
                                    }
                                    style={styles.picker}
                                  >
                                    <Picker.Item label="请选择年份" value="" />
                                    {ENTRY_YEAR_OPTIONS.map((year) => (
                                      <Picker.Item key={year} label={year} value={year} />
                                    ))}
                                  </Picker>
                                </View>
                              </View>

                              {/* Practice Choice - shown if this class has optional practices */}
                              {hasOptionalPractices && (
                                <View style={styles.practiceFieldContainer}>
                                  <ThemedText style={styles.fieldLabel}>
                                    🧘 修行选择{!isEnrolled && ' *'}（{isEnrolled ? '可修改，' : ''}至少选择一项）
                                  </ThemedText>
                                  {Array.from(optionalPracticeGroups.get(classItem.id)?.entries() || []).map(([groupName, practices]) => {
                                    const selectedForGroup = selectedPractices.get(classItem.id)?.get(groupName) || [];
                                    
                                    return (
                                      <View key={groupName} style={styles.practiceGroupContainer}>
                                        <ThemedText style={styles.practiceGroupLabel}>{groupName}:</ThemedText>
                                        {practices.map((practice: any) => {
                                          const isPracticeSelected = selectedForGroup.includes(practice.practice_id);
                                          
                                          return (
                                            <TouchableOpacity
                                              key={practice.practice_id}
                                              style={[
                                                styles.practiceOption,
                                                isPracticeSelected && styles.practiceOptionSelected
                                              ]}
                                              onPress={() => togglePracticeSelection(classItem.id, groupName, practice.practice_id)}
                                            >
                                              <View style={[
                                                styles.checkbox,
                                                isPracticeSelected && styles.checkboxSelected
                                              ]}>
                                                {isPracticeSelected && (
                                                  <ThemedText style={styles.checkmark}>✓</ThemedText>
                                                )}
                                              </View>
                                              <View style={styles.practiceOptionTextContainer}>
                                                <ThemedText style={[
                                                  styles.practiceOptionText,
                                                  isPracticeSelected && styles.practiceOptionTextSelected
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
                          ) : null}
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
                placeholderTextColor={Colors.textSecondary}
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
    marginTop: 10,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
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
  cancelButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginTop: 10,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
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
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  classCheckboxSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F4FF',
  },
  classCheckboxPaused: {
    borderColor: '#9CA3AF',
    backgroundColor: '#F3F4F6',
    opacity: 0.8,
  },
  classMainArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  classNamePaused: {
    color: '#6B7280',
  },
  statusToggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  pauseButton: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  resumeButton: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  statusToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B45309',
  },
  resumeButtonText: {
    color: '#059669',
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
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  classNameSelected: {
    color: Colors.primary,
  },
  classDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  noClassesText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  classCheckboxDisabled: {
    opacity: 0.5,
    backgroundColor: '#F5F5F5',
  },
  checkboxDisabled: {
    backgroundColor: Colors.borderLight,
    borderColor: Colors.borderDark,
  },
  classNameDisabled: {
    color: Colors.textSecondary,
  },
  classDescriptionDisabled: {
    color: Colors.borderDark,
  },
  // Practice choice styles
  combinedSelectionSection: {
    marginTop: 8,
    padding: 16,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  yearFieldContainer: {
    marginBottom: 16,
  },
  practiceFieldContainer: {
    marginTop: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  practiceChoiceSection: {
    padding: 16,
    marginLeft: 16,
    marginTop: 8,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
    gap: 12,
  },
  practiceChoiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  practiceChoiceSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  practiceGroupContainer: {
    marginTop: 12,
  },
  practiceGroupLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  practiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  practiceOptionSelected: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  practiceOptionTextContainer: {
    flex: 1,
  },
  practiceOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
  },
  practiceOptionTextSelected: {
    color: '#FF9800',
  },
  practiceOptionDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  entryYearDisplay: {
    padding: 12,
    marginLeft: 16,
    marginTop: 8,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  entryYearDisplayLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  smallCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  smallCheckboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  smallCheckmark: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});