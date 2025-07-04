
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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';

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

  const [formData, setFormData] = useState({
    targetCount: practiceType === 'count' 
      ? (practiceName === '六字大明咒' ? '100000' : '10000')
      : '92',
    dailyTarget: practiceType === 'count'
      ? (practiceName === '六字大明咒' ? '3000' : '108')
      : '1',
    targetPeriod: 'daily',
    duration: '100', // For time-based practices when daily is selected
    durationType: '100', // Predefined duration options
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
      default: return parseInt(formData.durationType) || 100;
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
      let targetEndDate = '';

      // Calculate target end date and final target count based on practice type and period
      if (practiceType === 'time' && formData.targetPeriod === 'daily') {
        // For daily time practices, calculate total sessions based on duration
        const durationDays = parseInt(formData.duration);
        const sessionsPerDay = parseInt(formData.dailyTarget);
        finalTargetCount = sessionsPerDay * durationDays;
        
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + durationDays);
        targetEndDate = endDate.toISOString().split('T')[0];
      } else if (practiceType === 'count') {
        // For count-based practices, calculate duration based on type
        if (formData.durationType === 'custom') {
          targetEndDate = formData.customEndDate;
        } else {
          let durationDays;
          switch (formData.durationType) {
            case '30':
              durationDays = 30;
              break;
            case '60':
              durationDays = 60;
              break;
            case '100':
              durationDays = 100;
              break;
            case '365':
              durationDays = 365;
              break;
            default:
              durationDays = parseInt(formData.durationType) || 100;
          }
          const startDate = new Date(formData.startDate || new Date().toISOString().split('T')[0]);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + durationDays);
          targetEndDate = endDate.toISOString().split('T')[0];
        }
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
          daily_target: parseInt(formData.dailyTarget),
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

    return (
      <>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>总目标数量</Text>
          <TextInput
            style={styles.input}
            value={formData.targetCount}
            onChangeText={(text) => setFormData({...formData, targetCount: text})}
            keyboardType="numeric"
            placeholder={practiceName === '六字大明咒' ? '如：100000' : '如：10000'}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>开始日期</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={styles.datePickerButtonText}>
              {formData.startDate || new Date().toISOString().split('T')[0]}
            </Text>
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={new Date(formData.startDate || new Date().toISOString().split('T')[0])}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleStartDateChange}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            每日目标 ({practiceUnit})
          </Text>
          <TextInput
            style={styles.input}
            value={formData.dailyTarget}
            onChangeText={(text) => setFormData({...formData, dailyTarget: text})}
            keyboardType="numeric"
            placeholder={practiceName === '六字大明咒' ? '如：3000' : '如：108'}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>持续时间</Text>
          <View style={styles.durationSelector}>
            {['30', '60', '100', '365', 'custom'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.durationOption,
                  formData.durationType === option && styles.selectedDurationOption
                ]}
                onPress={() => setFormData({...formData, durationType: option})}
              >
                <Text style={[
                  styles.durationOptionText,
                  formData.durationType === option && styles.selectedDurationOptionText
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

        {formData.durationType === 'custom' && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>结束日期</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text style={styles.datePickerButtonText}>
                {formData.customEndDate || '选择结束日期'}
              </Text>
            </TouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker
                value={formData.customEndDate ? new Date(formData.customEndDate) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleEndDateChange}
                minimumDate={new Date(formData.startDate)}
              />
            )}
          </View>
        )}

        <View style={styles.calculationInfo}>
          <Text style={styles.calculationLabel}>目标统计</Text>
          <Text style={styles.calculationText}>
            总目标：{formData.targetCount} {practiceUnit}
          </Text>
          <Text style={styles.calculationText}>
            每日目标：{formData.dailyTarget} {practiceUnit}
          </Text>
          <Text style={styles.calculationText}>
            平均每日需完成：{Math.ceil(parseInt(formData.targetCount || '0') / getDurationDays())} {practiceUnit}
          </Text>
          <Text style={styles.calculationHint}>
            预计完成天数：{Math.ceil(parseInt(formData.targetCount || '0') / parseInt(formData.dailyTarget || '1'))} 天
          </Text>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: '配置修法目标', headerShown: true }} />
      
      <View style={styles.content}>
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
      </View>

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
            <Text style={styles.saveButtonText}>添加修法</Text>
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
  durationSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: 'white',
    minWidth: 60,
    alignItems: 'center',
  },
  selectedDurationOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  durationOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  selectedDurationOptionText: {
    color: 'white',
  },
  calculationInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  calculationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  calculationText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  calculationHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
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
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: Colors.text,
  },
});
