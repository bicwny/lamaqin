
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';

// Helper function to validate date format (YYYY-MM-DD)
const isValidDate = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  const timestamp = date.getTime();

  if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) return false;

  return date.toISOString().slice(0, 10) === dateString;
};

export default function PracticeConfigScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const {
    practiceId,
    practiceName,
    practiceType,
    practiceUnit,
  } = params as {
    practiceId: string;
    practiceName: string;
    practiceType: string;
    practiceUnit: string;
  };

  // Goal setting mode for count-based practices
  const [goalMode, setGoalMode] = useState<'total' | 'daily'>('total');

  const [formData, setFormData] = useState({
    targetCount: practiceType === 'count' 
      ? (practiceName === '六字大明咒' ? '400000' : '10000')
      : '92',
    dailyTarget: practiceType === 'count'
      ? (practiceName === '六字大明咒' ? '1096' : '108')
      : '1',
    targetPeriod: 'daily',
    duration: '100', // For time-based practices when daily is selected
    durationType: '365', // Predefined duration options (1 year default)
    customEndDate: '', // For custom duration
    startDate: new Date().toISOString().split('T')[0], // Start date for count practices
  });
  const [saving, setSaving] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const getDurationDays = () => {
    if (practiceType !== 'count') return 0;

    if (formData.durationType === 'custom') {
      if (!formData.customEndDate) return 0;
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.customEndDate);
      const diffTime = endDate.getTime() - startDate.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    switch (formData.durationType) {
      case '30': return 30;
      case '60': return 60;
      case '100': return 100;
      case '365': return 365;
      default: return parseInt(formData.durationType) || 365;
    }
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setFormData({
        ...formData,
        startDate: selectedDate.toISOString().split('T')[0]
      });
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setFormData({
        ...formData,
        customEndDate: selectedDate.toISOString().split('T')[0]
      });
    }
  };

  // Calculate intelligent suggestions based on user input
  const getIntelligentSummary = () => {
    if (practiceType !== 'count') return null;

    const totalCount = parseInt(formData.targetCount || '0');
    const dailyCount = parseInt(formData.dailyTarget || '0');
    const durationDays = getDurationDays();

    if (goalMode === 'total' && totalCount > 0 && durationDays > 0) {
      const suggestedDaily = Math.ceil(totalCount / durationDays);
      return {
        mode: 'total',
        totalCount,
        durationDays,
        suggestedDaily,
        message: `您需要在约 ${durationDays} 天内完成，总计 ${totalCount.toLocaleString()} ${practiceUnit}。\n\n👉 建议每日持诵约 ${suggestedDaily.toLocaleString()} ${practiceUnit}。`
      };
    } else if (goalMode === 'daily' && dailyCount > 0 && durationDays > 0) {
      const calculatedTotal = dailyCount * durationDays;
      return {
        mode: 'daily',
        dailyCount,
        durationDays,
        calculatedTotal,
        message: `您计划每日持诵 ${dailyCount.toLocaleString()} ${practiceUnit}，持续 ${durationDays} 天。\n\n📊 总计将完成 ${calculatedTotal.toLocaleString()} ${practiceUnit}。`
      };
    }

    return null;
  };

  const handleSave = async () => {
    if (!practiceId || !user?.id) {
      Alert.alert('错误', '缺少必要信息');
      return;
    }

    // Validate form data
    if (!formData.targetCount || !formData.dailyTarget) {
      Alert.alert('错误', '请填写完整的目标信息');
      return;
    }

    // For time-based practices with daily frequency, validate duration
    if (practiceType === 'time' && formData.targetPeriod === 'daily' && !formData.duration) {
      Alert.alert('错误', '请填写持续天数');
      return;
    }

    // For count-based practices, validate duration
    if (practiceType === 'count') {
      if (formData.durationType === 'custom' && !formData.customEndDate) {
        Alert.alert('错误', '请选择结束日期');
        return;
      }
      if (formData.durationType !== 'custom' && !formData.durationType) {
        Alert.alert('错误', '请选择持续时间');
        return;
      }
    }

    setSaving(true);
    try {
      console.log('💾 Creating new practice project...');

      let finalTargetCount = parseInt(formData.targetCount);
      let finalDailyTarget = parseInt(formData.dailyTarget);
      let targetEndDate = '';

      // For count-based practices, calculate based on goal mode
      if (practiceType === 'count') {
        const durationDays = getDurationDays();
        
        if (goalMode === 'total') {
          // User set total count, calculate daily target
          finalDailyTarget = Math.ceil(finalTargetCount / durationDays);
        } else {
          // User set daily target, calculate total count
          finalTargetCount = finalDailyTarget * durationDays;
        }

        // Calculate target end date
        if (formData.durationType === 'custom') {
          targetEndDate = formData.customEndDate;
        } else {
          const startDate = new Date(formData.startDate || new Date().toISOString().split('T')[0]);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + durationDays);
          targetEndDate = endDate.toISOString().split('T')[0];
        }
      } else if (practiceType === 'time' && formData.targetPeriod === 'daily') {
        // For daily time practices, calculate total sessions based on duration
        const durationDays = parseInt(formData.duration);
        const sessionsPerDay = parseInt(formData.dailyTarget);
        finalTargetCount = sessionsPerDay * durationDays;

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + durationDays);
        targetEndDate = endDate.toISOString().split('T')[0];
      } else if (formData.targetPeriod === 'daily') {
        // For other daily practices
        const days = Math.ceil(finalTargetCount / parseInt(formData.dailyTarget));
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);
        targetEndDate = endDate.toISOString().split('T')[0];
      } else if (formData.targetPeriod === 'weekly') {
        // For weekly practices
        const weeks = Math.ceil(finalTargetCount / parseInt(formData.dailyTarget));
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + (weeks * 7));
        targetEndDate = endDate.toISOString().split('T')[0];
      }

      const { data: newProject, error } = await supabase
        .from('user_practice_projects')
        .insert({
          user_id: user.id,
          practice_id: practiceId,
          target_count: finalTargetCount,
          daily_target: finalDailyTarget,
          target_period: formData.targetPeriod,
          start_date: formData.startDate || new Date().toISOString().split('T')[0],
          target_end_date: targetEndDate,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Practice project created successfully:', newProject);
      Alert.alert('成功', '修行项目已添加！', [
        {
          text: '确定',
          onPress: () => router.replace('/(tabs)/practice'),
        },
      ]);
    } catch (error) {
      console.error('Error creating practice project:', error);
      Alert.alert('错误', '创建修行项目失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const renderTimeConfiguration = () => {
    if (practiceType !== 'time') return null;

    return (
      <>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>修行频率</Text>
          <View style={styles.periodSelector}>
            <TouchableOpacity
              style={[
                styles.periodButton,
                formData.targetPeriod === 'daily' && styles.selectedPeriodButton
              ]}
              onPress={() => setFormData({...formData, targetPeriod: 'daily'})}
            >
              <Text style={[
                styles.periodButtonText,
                formData.targetPeriod === 'daily' && styles.selectedPeriodButtonText
              ]}>
                每日
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                formData.targetPeriod === 'weekly' && styles.selectedPeriodButton
              ]}
              onPress={() => setFormData({...formData, targetPeriod: 'weekly'})}
            >
              <Text style={[
                styles.periodButtonText,
                formData.targetPeriod === 'weekly' && styles.selectedPeriodButtonText
              ]}>
                每周
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {formData.targetPeriod === 'daily' ? (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                每日座数 ({practiceUnit})
              </Text>
              <TextInput
                style={styles.input}
                value={formData.dailyTarget}
                onChangeText={(text) => setFormData({...formData, dailyTarget: text})}
                keyboardType="numeric"
                placeholder="如：1"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>持续天数</Text>
              <TextInput
                style={styles.input}
                value={formData.duration}
                onChangeText={(text) => setFormData({...formData, duration: text})}
                keyboardType="numeric"
                placeholder="如：100"
              />
              <Text style={styles.inputHint}>
                总目标：{parseInt(formData.dailyTarget || '0') * parseInt(formData.duration || '0')} 座
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              总目标座数
            </Text>
            <TextInput
              style={styles.input}
              value={formData.targetCount}
              onChangeText={(text) => setFormData({...formData, targetCount: text})}
              keyboardType="numeric"
              placeholder="如：92"
            />
          </View>
        )}
      </>
    );
  };

  const renderCountConfiguration = () => {
    if (practiceType !== 'count') return null;

    const intelligentSummary = getIntelligentSummary();

    return (
      <>
        {/* Goal Setting Mode Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>您想如何设定目标？</Text>
          <View style={styles.goalModeSelector}>
            <TouchableOpacity
              style={[
                styles.goalModeButton,
                goalMode === 'total' && styles.selectedGoalModeButton
              ]}
              onPress={() => {
                setGoalMode('total');
                // When switching to total mode, auto-calculate daily target
                const totalCount = parseInt(formData.targetCount || '0');
                const durationDays = getDurationDays();
                if (totalCount > 0 && durationDays > 0) {
                  const suggestedDaily = Math.ceil(totalCount / durationDays);
                  setFormData({...formData, dailyTarget: suggestedDaily.toString()});
                }
              }}
            >
              <Text style={[
                styles.goalModeButtonText,
                goalMode === 'total' && styles.selectedGoalModeButtonText
              ]}>
                🔘 按总数目标
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.goalModeButton,
                goalMode === 'daily' && styles.selectedGoalModeButton
              ]}
              onPress={() => {
                setGoalMode('daily');
                // When switching to daily mode, auto-calculate total
                const dailyCount = parseInt(formData.dailyTarget || '0');
                const durationDays = getDurationDays();
                if (dailyCount > 0 && durationDays > 0) {
                  const calculatedTotal = dailyCount * durationDays;
                  setFormData({...formData, targetCount: calculatedTotal.toString()});
                }
              }}
            >
              <Text style={[
                styles.goalModeButtonText,
                goalMode === 'daily' && styles.selectedGoalModeButtonText
              ]}>
                ⚫️ 按每日目标
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Goal Details - Conditional Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>目标详情</Text>
          {goalMode === 'total' ? (
            <View style={styles.goalInputContainer}>
              <Text style={styles.goalInputLabel}>总目标数量：</Text>
              <TextInput
                style={styles.goalInput}
                value={formData.targetCount}
                onChangeText={(text) => {
                  setFormData({...formData, targetCount: text});
                  // Auto-calculate daily target when total changes
                  const totalCount = parseInt(text || '0');
                  const durationDays = getDurationDays();
                  if (totalCount > 0 && durationDays > 0) {
                    const suggestedDaily = Math.ceil(totalCount / durationDays);
                    setFormData(prev => ({...prev, targetCount: text, dailyTarget: suggestedDaily.toString()}));
                  }
                }}
                keyboardType="numeric"
                placeholder={practiceName === '六字大明咒' ? '400000' : '10000'}
              />
              <Text style={styles.goalInputUnit}>{practiceUnit}</Text>
            </View>
          ) : (
            <View style={styles.goalInputContainer}>
              <Text style={styles.goalInputLabel}>每日持诵：</Text>
              <TextInput
                style={styles.goalInput}
                value={formData.dailyTarget}
                onChangeText={(text) => {
                  setFormData({...formData, dailyTarget: text});
                  // Auto-calculate total when daily changes
                  const dailyCount = parseInt(text || '0');
                  const durationDays = getDurationDays();
                  if (dailyCount > 0 && durationDays > 0) {
                    const calculatedTotal = dailyCount * durationDays;
                    setFormData(prev => ({...prev, dailyTarget: text, targetCount: calculatedTotal.toString()}));
                  }
                }}
                keyboardType="numeric"
                placeholder={practiceName === '六字大明咒' ? '1096' : '108'}
              />
              <Text style={styles.goalInputUnit}>{practiceUnit}</Text>
            </View>
          )}
        </View>

        {/* Time Planning */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>时间规划</Text>
          
          {/* Start Date */}
          <View style={styles.timeInputRow}>
            <Text style={styles.timeInputLabel}>开始时间：</Text>
            {Platform.OS === 'web' ? (
              <TextInput
                style={[
                  styles.timeInput,
                  Platform.OS === 'web' && formData.startDate && !isValidDate(formData.startDate) && styles.inputError
                ]}
                value={formData.startDate || new Date().toISOString().split('T')[0]}
                onChangeText={(text) => setFormData({...formData, startDate: text})}
                placeholder="YYYY-MM-DD"
              />
            ) : (
              <TouchableOpacity
                style={styles.timeInputButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.timeInputButtonText}>
                  {formData.startDate || new Date().toISOString().split('T')[0]}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Duration */}
          <View style={styles.timeInputRow}>
            <Text style={styles.timeInputLabel}>持续时间：</Text>
            <View style={styles.durationSelector}>
              {['30', '60', '100', '365', 'custom'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.durationChip,
                    formData.durationType === option && styles.selectedDurationChip
                  ]}
                  onPress={() => {
                    setFormData({...formData, durationType: option});
                    // Recalculate suggestions when duration changes
                    setTimeout(() => {
                      if (goalMode === 'total') {
                        const totalCount = parseInt(formData.targetCount || '0');
                        const newDurationDays = option === 'custom' ? getDurationDays() : parseInt(option) || 365;
                        if (totalCount > 0 && newDurationDays > 0) {
                          const suggestedDaily = Math.ceil(totalCount / newDurationDays);
                          setFormData(prev => ({...prev, dailyTarget: suggestedDaily.toString()}));
                        }
                      } else {
                        const dailyCount = parseInt(formData.dailyTarget || '0');
                        const newDurationDays = option === 'custom' ? getDurationDays() : parseInt(option) || 365;
                        if (dailyCount > 0 && newDurationDays > 0) {
                          const calculatedTotal = dailyCount * newDurationDays;
                          setFormData(prev => ({...prev, targetCount: calculatedTotal.toString()}));
                        }
                      }
                    }, 100);
                  }}
                >
                  <Text style={[
                    styles.durationChipText,
                    formData.durationType === option && styles.selectedDurationChipText
                  ]}>
                    {option === '30' ? '30天' : 
                     option === '60' ? '60天' :
                     option === '100' ? '100天' :
                     option === '365' ? '1年' :
                     '自定义'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom End Date */}
          {formData.durationType === 'custom' && (
            <View style={styles.timeInputRow}>
              <Text style={styles.timeInputLabel}>结束日期：</Text>
              {Platform.OS === 'web' ? (
                <TextInput
                  style={[
                    styles.timeInput,
                    Platform.OS === 'web' && formData.customEndDate && !isValidDate(formData.customEndDate) && styles.inputError
                  ]}
                  value={formData.customEndDate || ''}
                  onChangeText={(text) => setFormData({...formData, customEndDate: text})}
                  placeholder="YYYY-MM-DD"
                />
              ) : (
                <TouchableOpacity
                  style={styles.timeInputButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={styles.timeInputButtonText}>
                    {formData.customEndDate || '选择结束日期'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Intelligent Summary */}
        {intelligentSummary && (
          <View style={styles.intelligentSummary}>
            <Text style={styles.summaryLabel}>📝 根据您的设置：</Text>
            <Text style={styles.summaryText}>{intelligentSummary.message}</Text>
          </View>
        )}

        {/* Date Pickers */}
        {showStartDatePicker && (
          <DateTimePicker
            value={new Date(formData.startDate || new Date().toISOString().split('T')[0])}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleStartDateChange}
          />
        )}
        {showEndDatePicker && (
          <DateTimePicker
            value={formData.customEndDate ? new Date(formData.customEndDate) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleEndDateChange}
            minimumDate={new Date(formData.startDate)}
          />
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: '配置修法目标', headerShown: true }} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.practiceTitle}>📿 {practiceName}</Text>
          <Text style={styles.practiceType}>
            {practiceType === 'count' ? '计数类' : '计时类'} • {practiceUnit}
          </Text>
        </View>

        <View style={styles.configForm}>
          {renderTimeConfiguration()}
          {renderCountConfiguration()}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>取消</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>确认添加项目</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  practiceTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  practiceType: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  configForm: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  inputHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  goalModeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  goalModeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  selectedGoalModeButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  goalModeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  selectedGoalModeButtonText: {
    color: 'white',
  },
  goalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  goalInputLabel: {
    fontSize: 16,
    color: Colors.text,
    marginRight: 8,
  },
  goalInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'right',
    paddingVertical: 4,
  },
  goalInputUnit: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 8,
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeInputLabel: {
    fontSize: 14,
    color: Colors.text,
    width: 80,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    backgroundColor: 'white',
  },
  timeInputButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 6,
    padding: 8,
    backgroundColor: 'white',
  },
  timeInputButtonText: {
    fontSize: 14,
    color: Colors.text,
  },
  durationSelector: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  durationChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: 'white',
  },
  selectedDurationChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  durationChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
  },
  selectedDurationChipText: {
    color: 'white',
  },
  intelligentSummary: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  selectedPeriodButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  selectedPeriodButtonText: {
    color: 'white',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    backgroundColor: 'white',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
});
