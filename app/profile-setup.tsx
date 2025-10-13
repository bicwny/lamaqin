
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
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
import { toastService } from '@/lib/toast';

// Entry year options
const ENTRY_YEAR_OPTIONS = ['18入行', '20入行', '24入行'];

export default function ProfileSetupScreen() {
  const { user } = useAuth();
  const [dharmaName, setDharmaName] = useState('');
  const [layName, setLayName] = useState('');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [enrolledClassIds, setEnrolledClassIds] = useState<string[]>([]);
  const [enrollmentStatuses, setEnrollmentStatuses] = useState<Record<string, 'active' | 'paused' | 'completed'>>({});
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [availableClasses, setAvailableClasses] = useState<ClassCurriculum[]>([]);
  
  // Practice choice system states
  const [optionalPracticeGroups, setOptionalPracticeGroups] = useState<Map<string, Map<string, any[]>>>(new Map());
  const [selectedPractices, setSelectedPractices] = useState<Map<string, Map<string, string[]>>>(new Map());
  
  // Entry year tracking
  const [entryYears, setEntryYears] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    loadDataAndClasses();
  }, [user]);

  useEffect(() => {
    loadOptionalPracticesForSelectedClasses();
  }, [selectedClassIds]);

  const loadDataAndClasses = async () => {
    if (!user) return;
    
    try {
      const [classes, allEnrollments, userData] = await Promise.all([
        classCurriculumService.getAllClassCurricula(),
        supabase
          .from('user_enrolled_classes')
          .select('class_id, status, entry_year')
          .eq('user_id', user.id),
        supabase
          .from('users')
          .select('dharma_name, lay_name, location')
          .eq('id', user.id)
          .single()
      ]);
      
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
      
      // Pre-fill existing user data
      if (userData.data) {
        setDharmaName(userData.data.dharma_name || '');
        setLayName(userData.data.lay_name || '');
        setLocation(userData.data.location || '');
      }
    } catch (error) {
      console.error('Error loading classes:', error);
      toastService.error({ title: '加载失败', message: '加载班级列表失败，请稍后重试' });
    } finally {
      setLoadingClasses(false);
    }
  };

  const loadOptionalPracticesForSelectedClasses = async () => {
    const newGroups = new Map<string, Map<string, any[]>>();
    const newSelections = new Map<string, Map<string, string[]>>();
    
    for (const classId of selectedClassIds) {
      try {
        const groups = await classCurriculumService.getOptionalPracticesByChoiceGroup(classId);
        if (groups.size > 0) {
          newGroups.set(classId, groups);
          
          // Initialize empty selections for this class if not already set
          if (!selectedPractices.has(classId)) {
            const classSelections = new Map<string, string[]>();
            groups.forEach((_, groupName) => {
              classSelections.set(groupName, []);
            });
            newSelections.set(classId, classSelections);
          } else {
            newSelections.set(classId, selectedPractices.get(classId)!);
          }
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

  const handleSaveProfile = async () => {
    if (!user) {
      toastService.error({ title: '错误', message: '用户信息未找到' });
      return;
    }

    // Validation - matching edit-profile.tsx requirements
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

    // Validate entry year for each selected class
    for (const classId of selectedClassIds) {
      // Skip validation for already enrolled classes
      if (!enrolledClassIds.includes(classId)) {
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
    }

    // Validate practice choices - ensure at least one practice is selected for each choice group
    for (const classId of selectedClassIds) {
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

      // Update user metadata in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          dharma_name: dharmaName.trim() || null,
          lay_name: layName.trim() || null,
          class_name: classNames || null,
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
          toastService.error({ title: '提示', message: '部分班级退出失败，请稍后重试' });
        }
      }
      
      // Enroll in newly selected classes
      for (const classId of classesToAdd) {
        try {
          const entryYear = entryYears.get(classId);
          await classCurriculumService.enrollUserInClass(user.id, classId, entryYear);
          
          // Save practice choices if this class has optional practices
          const groups = optionalPracticeGroups.get(classId);
          if (groups) {
            for (const [groupName, practices] of groups) {
              const selectedForGroup = selectedPractices.get(classId)?.get(groupName) || [];
              if (selectedForGroup.length > 0) {
                await classCurriculumService.saveUserPracticeChoices(
                  user.id,
                  classId,
                  groupName,
                  selectedForGroup
                );
              }
            }
          }
          
          // Create practice projects (will respect saved choices)
          await classCurriculumService.createPracticeProjectsForClass(user.id, classId);
          console.log(`✅ Enrolled in class ${classId}`);
        } catch (enrollError) {
          console.error(`Error enrolling in class ${classId}:`, enrollError);
          toastService.error({ title: '提示', message: '部分班级加入失败，请稍后重试' });
        }
      }
      
      if (classesToAdd.length > 0 || classesToRemove.length > 0) {
        console.log(`📊 Enrollment updated: +${classesToAdd.length} -${classesToRemove.length}`);
      }

      // For profile setup, show success message before navigating
      toastService.success({
        title: '保存成功',
        message: '个人资料已完成'
      });
      console.log('✅ Profile saved successfully, navigating to main app');
      router.replace('/(tabs)');
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
          {user?.email && (
            <View style={styles.emailContainer}>
              <Text style={styles.emailLabel}>正在为以下账号完善资料：</Text>
              <Text style={styles.emailText}>{user.email}</Text>
            </View>
          )}
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
                {availableClasses.map((classItem) => {
                  const isEnrolled = enrolledClassIds.includes(classItem.id);
                  const isSelected = selectedClassIds.includes(classItem.id);
                  const enrollmentStatus = enrollmentStatuses[classItem.id];
                  const groups = optionalPracticeGroups.get(classItem.id);
                  const hasOptionalPractices = groups && groups.size > 0;
                  
                  const statusLabel = enrollmentStatus === 'completed' ? '圆满' : '已加入';
                  
                  return (
                    <React.Fragment key={classItem.id}>
                      <TouchableOpacity
                        style={[
                          styles.classOption,
                          isSelected && !isEnrolled && styles.classOptionSelected
                        ]}
                        onPress={() => toggleClassSelection(classItem.id)}
                        disabled={isEnrolled}
                      >
                        {!isEnrolled && (
                          <View style={[
                            styles.checkbox,
                            isSelected && styles.checkboxSelected
                          ]}>
                            {isSelected && (
                              <Text style={styles.checkmark}>✓</Text>
                            )}
                          </View>
                        )}
                        <View style={styles.classOptionTextContainer}>
                          <Text style={[
                            styles.classOptionText,
                            isSelected && !isEnrolled && styles.classOptionTextSelected
                          ]}>
                            {classItem.class_name}
                            {isEnrolled && ` (${statusLabel})`}
                          </Text>
                          {classItem.description && (
                            <Text style={styles.classOptionDescription}>
                              {classItem.description}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>

                      {/* Entry Year Selection - shown for selected classes that are not yet enrolled */}
                      {isSelected && !isEnrolled && (
                        <View style={styles.entryYearSection}>
                          <Text style={styles.entryYearLabel}>📅 入行年份 *</Text>
                          <View style={styles.entryYearOptions}>
                            {ENTRY_YEAR_OPTIONS.map((year) => {
                              const isYearSelected = entryYears.get(classItem.id) === year;
                              
                              return (
                                <TouchableOpacity
                                  key={year}
                                  style={[
                                    styles.entryYearOption,
                                    isYearSelected && styles.entryYearOptionSelected
                                  ]}
                                  onPress={() => updateEntryYear(classItem.id, year)}
                                >
                                  <View style={[
                                    styles.radioButton,
                                    isYearSelected && styles.radioButtonSelected
                                  ]}>
                                    {isYearSelected && (
                                      <View style={styles.radioButtonInner} />
                                    )}
                                  </View>
                                  <Text style={[
                                    styles.entryYearOptionText,
                                    isYearSelected && styles.entryYearOptionTextSelected
                                  ]}>
                                    {year}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>
                      )}

                      {/* Practice Choice UI - shown right below the class if it has optional practices and is selected */}
                      {isSelected && hasOptionalPractices && (
                        <View style={styles.practiceChoiceSection}>
                          <Text style={styles.practiceChoiceTitle}>
                            🧘 {classItem.class_name} 观修选择 *（至少选择一项）
                          </Text>
                          {Array.from(groups.entries()).map(([groupName, practices]) => {
                            const selectedForGroup = selectedPractices.get(classItem.id)?.get(groupName) || [];
                            
                            return (
                              <View key={groupName} style={styles.practiceGroupContainer}>
                                <Text style={styles.practiceGroupLabel}>{groupName}:</Text>
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
                                          <Text style={styles.checkmark}>✓</Text>
                                        )}
                                      </View>
                                      <View style={styles.practiceOptionTextContainer}>
                                        <Text style={[
                                          styles.practiceOptionText,
                                          isPracticeSelected && styles.practiceOptionTextSelected
                                        ]}>
                                          {practice.practice?.name || '未知修法'}
                                        </Text>
                                        {practice.practice?.description && (
                                          <Text style={styles.practiceOptionDescription}>
                                            {practice.practice.description}
                                          </Text>
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
                    </React.Fragment>
                  );
                })}
              </View>
            )}
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
              • 常住地为可选项{'\n'}
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
  emailContainer: {
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F0F4FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  emailLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
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
  classOptionDisabled: {
    opacity: 0.5,
    backgroundColor: '#F5F5F5',
  },
  checkboxDisabled: {
    backgroundColor: '#E0E0E0',
    borderColor: '#BDBDBD',
  },
  classOptionTextDisabled: {
    color: '#9E9E9E',
  },
  classOptionDescriptionDisabled: {
    color: '#BDBDBD',
  },
  // Practice choice styles
  practiceChoiceSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  practiceChoiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
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
  entryYearSection: {
    marginTop: 8,
    marginLeft: 36,
    paddingLeft: 12,
    paddingVertical: 12,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  entryYearLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  entryYearOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  entryYearOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  entryYearOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F4FF',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  entryYearOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  entryYearOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
