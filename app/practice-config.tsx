
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Practice {
  id: string;
  name: string;
  type: string;
  unit: string;
  description?: string;
}

export default function PracticeConfigScreen() {
  const { practiceId, practiceName, practiceType, practiceUnit } = useLocalSearchParams<{
    practiceId: string;
    practiceName: string;
    practiceType: string;
    practiceUnit: string;
  }>();

  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Target configuration mode
  const [targetMode, setTargetMode] = useState<'total' | 'daily'>('total');
  
  // Count-based configuration
  const [totalTarget, setTotalTarget] = useState('');
  const [dailyTarget, setDailyTarget] = useState('');
  
  // Time-based configuration
  const [targetPeriod, setTargetPeriod] = useState<'daily' | 'weekly'>('weekly');
  const [sessionTarget, setSessionTarget] = useState('');
  
  // Time planning
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [durationMode, setDurationMode] = useState<'30天' | '60天' | '100天' | '1年' | '自定义'>('60天');
  const [customEndDate, setCustomEndDate] = useState(new Date());
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customDays, setCustomDays] = useState('');

  // Calculated values
  const [suggestedDaily, setSuggestedDaily] = useState(0);
  const [projectedTotal, setProjectedTotal] = useState(0);
  const [calculatedDays, setCalculatedDays] = useState(0);

  useEffect(() => {
    calculateSuggestions();
  }, [totalTarget, dailyTarget, startDate, durationMode, customEndDate, customDays, targetMode]);

  const getDurationInDays = () => {
    const start = startDate;
    let end: Date;

    switch (durationMode) {
      case '30天':
        end = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      case '60天':
        end = new Date(start.getTime() + 60 * 24 * 60 * 60 * 1000);
        break;
      case '100天':
        end = new Date(start.getTime() + 100 * 24 * 60 * 60 * 1000);
        break;
      case '1年':
        end = new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000);
        break;
      case '自定义':
        if (customDays) {
          end = new Date(start.getTime() + parseInt(customDays) * 24 * 60 * 60 * 1000);
        } else {
          end = customEndDate;
        }
        break;
      default:
        end = new Date(start.getTime() + 60 * 24 * 60 * 60 * 1000);
    }

    return Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  };

  const calculateSuggestions = () => {
    const days = getDurationInDays();
    setCalculatedDays(days);

    if (practiceType === 'count') {
      if (targetMode === 'total' && totalTarget) {
        const total = parseInt(totalTarget);
        const suggested = Math.ceil(total / days);
        setSuggestedDaily(suggested);
      } else if (targetMode === 'daily' && dailyTarget) {
        const daily = parseInt(dailyTarget);
        const projected = daily * days;
        setProjectedTotal(projected);
      }
    }
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('错误', '用户未登录');
      return;
    }

    if (practiceType === 'count') {
      if (targetMode === 'total' && !totalTarget) {
        Alert.alert('错误', '请输入总目标数量');
        return;
      }
      if (targetMode === 'daily' && !dailyTarget) {
        Alert.alert('错误', '请输入每日目标数量');
        return;
      }
    } else {
      if (!sessionTarget) {
        Alert.alert('错误', '请输入座数目标');
        return;
      }
    }

    setLoading(true);

    try {
      const days = getDurationInDays();
      const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);

      let finalTotalTarget: number;
      let finalDailyTarget: number;

      if (practiceType === 'count') {
        if (targetMode === 'total') {
          finalTotalTarget = parseInt(totalTarget);
          finalDailyTarget = Math.ceil(finalTotalTarget / days);
        } else {
          finalDailyTarget = parseInt(dailyTarget);
          finalTotalTarget = finalDailyTarget * days;
        }
      } else {
        finalTotalTarget = parseInt(sessionTarget) * (targetPeriod === 'weekly' ? Math.ceil(days / 7) : days);
        finalDailyTarget = parseInt(sessionTarget);
      }

      const { error } = await supabase
        .from('user_practice_projects')
        .insert({
          user_id: user.id,
          practice_id: practiceId,
          target_count: finalTotalTarget,
          daily_target: finalDailyTarget,
          target_period: practiceType === 'time' ? targetPeriod : 'daily',
          start_date: startDate.toISOString().split('T')[0],
          target_end_date: endDate.toISOString().split('T')[0],
          status: 'not_started',
          current_count: 0,
        });

      if (error) throw error;

      Alert.alert('成功', '修行项目已添加', [
        {
          text: '确定',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error saving practice project:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const renderTargetModeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>1. 您想如何设定目标？</Text>
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            targetMode === 'total' && styles.segmentButtonActive,
          ]}
          onPress={() => setTargetMode('total')}
        >
          <Text
            style={[
              styles.segmentButtonText,
              targetMode === 'total' && styles.segmentButtonTextActive,
            ]}
          >
            按总数目标
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            targetMode === 'daily' && styles.segmentButtonActive,
          ]}
          onPress={() => setTargetMode('daily')}
        >
          <Text
            style={[
              styles.segmentButtonText,
              targetMode === 'daily' && styles.segmentButtonTextActive,
            ]}
          >
            按每日目标
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTargetDetails = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>2. 目标详情</Text>
      <View style={styles.inputContainer}>
        {targetMode === 'total' ? (
          <>
            <Text style={styles.inputLabel}>总目标数量</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                value={totalTarget}
                onChangeText={setTotalTarget}
                placeholder="例如: 400000"
                keyboardType="numeric"
              />
              <Text style={styles.inputUnit}>{practiceUnit}</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.inputLabel}>每日目标</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputPrefix}>每日持诵</Text>
              <TextInput
                style={styles.textInput}
                value={dailyTarget}
                onChangeText={setDailyTarget}
                placeholder="例如: 1000"
                keyboardType="numeric"
              />
              <Text style={styles.inputUnit}>{practiceUnit}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );

  const renderTimeBasedConfig = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>2. 目标详情</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>修行频率</Text>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              targetPeriod === 'weekly' && styles.segmentButtonActive,
            ]}
            onPress={() => setTargetPeriod('weekly')}
          >
            <Text
              style={[
                styles.segmentButtonText,
                targetPeriod === 'weekly' && styles.segmentButtonTextActive,
              ]}
            >
              每周
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              targetPeriod === 'daily' && styles.segmentButtonActive,
            ]}
            onPress={() => setTargetPeriod('daily')}
          >
            <Text
              style={[
                styles.segmentButtonText,
                targetPeriod === 'daily' && styles.segmentButtonTextActive,
              ]}
            >
              每日
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputRow}>
          <Text style={styles.inputPrefix}>{targetPeriod === 'weekly' ? '每周' : '每日'}完成</Text>
          <TextInput
            style={styles.textInput}
            value={sessionTarget}
            onChangeText={setSessionTarget}
            placeholder="例如: 4"
            keyboardType="numeric"
          />
          <Text style={styles.inputUnit}>座</Text>
        </View>
      </View>
    </View>
  );

  const renderTimePlanning = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>3. 时间规划</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>开始时间</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowStartDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
          <Text style={styles.dateButtonIcon}>📅</Text>
        </TouchableOpacity>
        
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setStartDate(selectedDate);
              }
            }}
          />
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>持续时间</Text>
        <View style={styles.durationOptions}>
          {['30天', '60天', '100天', '1年'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.durationButton,
                durationMode === option && styles.durationButtonActive,
              ]}
              onPress={() => setDurationMode(option as any)}
            >
              <Text
                style={[
                  styles.durationButtonText,
                  durationMode === option && styles.durationButtonTextActive,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity
          style={[
            styles.customButton,
            durationMode === '自定义' && styles.customButtonActive,
          ]}
          onPress={() => setDurationMode('自定义')}
        >
          <Text
            style={[
              styles.customButtonText,
              durationMode === '自定义' && styles.customButtonTextActive,
            ]}
          >
            自定义
          </Text>
        </TouchableOpacity>

        {durationMode === '自定义' && (
          <View style={styles.customInputContainer}>
            <Text style={styles.customInputLabel}>请输入天数</Text>
            <TextInput
              style={styles.customInput}
              value={customDays}
              onChangeText={setCustomDays}
              placeholder="例如: 90"
              keyboardType="numeric"
            />
          </View>
        )}
      </View>
    </View>
  );

  const renderSmartSummary = () => {
    const days = calculatedDays;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. 智能总结</Text>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>📝 根据您的设置：</Text>
          
          <Text style={styles.summaryText}>
            您需要在约 {days} 天内完成，
          </Text>
          
          {practiceType === 'count' ? (
            <>
              {targetMode === 'total' && totalTarget ? (
                <>
                  <Text style={styles.summaryText}>
                    总计 {parseInt(totalTarget).toLocaleString()} {practiceUnit}。
                  </Text>
                  <Text style={styles.summaryHighlight}>
                    👉 建议每日持诵约 {suggestedDaily.toLocaleString()} {practiceUnit}。
                  </Text>
                </>
              ) : targetMode === 'daily' && dailyTarget ? (
                <>
                  <Text style={styles.summaryText}>
                    每日 {parseInt(dailyTarget).toLocaleString()} {practiceUnit}。
                  </Text>
                  <Text style={styles.summaryHighlight}>
                    👉 预计总计完成 {projectedTotal.toLocaleString()} {practiceUnit}。
                  </Text>
                </>
              ) : (
                <Text style={styles.summaryText}>请设置目标数量以查看建议。</Text>
              )}
            </>
          ) : (
            sessionTarget && (
              <>
                <Text style={styles.summaryText}>
                  {targetPeriod === 'weekly' ? '每周' : '每日'} {sessionTarget} 座观修。
                </Text>
                <Text style={styles.summaryHighlight}>
                  👉 预计总计完成约 {Math.ceil(days / (targetPeriod === 'weekly' ? 7 : 1)) * parseInt(sessionTarget)} 座观修。
                </Text>
              </>
            )
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>配置"{practiceName}"</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {practiceType === 'count' ? (
          <>
            {renderTargetModeSelector()}
            {renderTargetDetails()}
          </>
        ) : (
          renderTimeBasedConfig()
        )}
        
        {renderTimePlanning()}
        {renderSmartSummary()}

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>确认添加项目</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  segmentButtonTextActive: {
    color: '#333',
  },
  inputContainer: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputPrefix: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  inputUnit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dateButtonIcon: {
    fontSize: 16,
  },
  durationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f3f4',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  durationButtonActive: {
    backgroundColor: Colors.primary,
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  durationButtonTextActive: {
    color: 'white',
  },
  customButton: {
    backgroundColor: '#d4af37',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  customButtonActive: {
    backgroundColor: '#b8941f',
  },
  customButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  customButtonTextActive: {
    color: 'white',
  },
  customInputContainer: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  customInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  customInput: {
    backgroundColor: 'white',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  summaryContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 4,
  },
  summaryHighlight: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
    lineHeight: 22,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
