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
import { getCurrentWeekStart } from '@/lib/topic-progress';
import { practiceService, presetProjectNameService } from '@/lib/database';

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
  const [projectName, setProjectName] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState(''); // Store UUID instead of name
  const [usePresetName, setUsePresetName] = useState(false);
  const [presetProjectNames, setPresetProjectNames] = useState<Array<{
    id: string;
    name: string;
    category?: string;
    display_order: number;
  }>>([]);
  const [loadingPresets, setLoadingPresets] = useState(true);

  // Main configuration mode
  const [configMode, setConfigMode] = useState<'total' | 'daily' | 'topic_progress' | 'fixed_duration'>(
    practiceType === 'time' ? 'topic_progress' : 'total'
  );



  // Count-based configuration
  const [totalTarget, setTotalTarget] = useState('');
  const [dailyTarget, setDailyTarget] = useState('');

  // Time-based configuration
  const [frequencyMode, setFrequencyMode] = useState<'weekly' | 'daily'>('weekly');
  const [sessionsTarget, setSessionsTarget] = useState('4'); // Default 4 sessions per week
    const [weeklyGoal, setWeeklyGoal] = useState('');

  // Time planning
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [durationMode, setDurationMode] = useState<'30天' | '60天' | '100天' | '1年' | '自定义'>('60天');
  const [customEndDate, setCustomEndDate] = useState(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)); // Default to 60 days from now
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Calculated values
  const [suggestedDaily, setSuggestedDaily] = useState(0);
  const [projectedTotal, setProjectedTotal] = useState(0);
  const [calculatedDays, setCalculatedDays] = useState(0);

  const [targetPeriod, setTargetPeriod] = useState<'daily' | 'weekly'>('weekly');
  const [goalType, setGoalType] = useState<'fixed_duration' | 'topic_progress'>('fixed_duration');
  const [weeklyTopicTarget, setWeeklyTopicTarget] = useState(2);


  useEffect(() => {
    calculateSuggestions();
  }, [totalTarget, dailyTarget, startDate, durationMode, customEndDate, configMode]);

  useEffect(() => {
    const fetchPresets = async () => {
      setLoadingPresets(true);
      try {
        const presets = await presetProjectNameService.getPresetProjectNames();
        setPresetProjectNames(presets);
      } catch (error) {
        console.error('Failed to fetch preset project names:', error);
        Alert.alert('错误', 'Failed to load preset project names.');
      } finally {
        setLoadingPresets(false);
      }
    };

    fetchPresets();
  }, []);

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
        end = customEndDate;
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
      if (configMode === 'total' && totalTarget) {
        const total = parseInt(totalTarget);
        const suggested = Math.ceil(total / days);
        setSuggestedDaily(suggested);
      } else if (configMode === 'daily' && dailyTarget) {
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

    // Validation
    if (practiceType === 'count') {
      if (configMode === 'total' && !totalTarget) {
        Alert.alert('错误', '请输入总目标数量');
        return;
      }
      if (configMode === 'daily' && !dailyTarget) {
        Alert.alert('错误', '请输入每日目标数量');
        return;
      }
    } else {
      if (!sessionsTarget) {
        Alert.alert('错误', '请输入每周目标座数');
        return;
      }
    }

    setLoading(true);

    try {
      let finalTotalTarget: number;
      let finalDailyTarget: number;
      let endDate: Date | null = null;
      let targetPeriod: string;

      if (practiceType === 'count') {
        const days = getDurationInDays();
        endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
        targetPeriod = 'daily';

        if (configMode === 'total') {
          finalTotalTarget = parseInt(totalTarget);
          finalDailyTarget = Math.ceil(finalTotalTarget / days);
        } else {
          finalDailyTarget = parseInt(dailyTarget);
          finalTotalTarget = finalDailyTarget * days;
        }
      } else {
        // Time-based practices - unified approach
        finalDailyTarget = parseInt(sessionsTarget); // User's weekly goal
        targetPeriod = 'weekly';

        if (durationMode === '持续进行') {
          // Ongoing practice - no end date
          endDate = null;
          finalTotalTarget = 0; // 0 indicates ongoing
        } else {
          // Fixed duration practice
          const days = getDurationInDays();
          endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
          finalTotalTarget = finalDailyTarget * Math.ceil(days / 7);
        }
      }

      const projectData = {
        user_id: user.id,
        practice_id: practiceId,
        target_count: finalTotalTarget,
        daily_target: finalDailyTarget,
        target_period: targetPeriod,
        start_date: startDate.toISOString().split('T')[0],
        target_end_date: endDate ? endDate.toISOString().split('T')[0] : null,
        status: 'active',
        current_count: 0,
        preset_project_id: selectedPresetId || null,
        project_name: selectedPresetId ? null : (projectName || null),
      };

      // Try to include goal_type, but handle cases where column doesn't exist yet
      try {
        const { error } = await supabase
          .from('user_practice_projects')
          .insert({ ...projectData, goal_type: configMode });

        if (error) throw error;
      } catch (error: any) {
        // If goal_type column doesn't exist, try without it
        if (error?.message?.includes('goal_type')) {
          const { error: fallbackError } = await supabase
            .from('user_practice_projects')
            .insert(projectData);

          if (fallbackError) throw fallbackError;
        } else {
          throw error;
        }
      }

      Alert.alert('成功', '修行项目已添加', [
        {
          text: '确定',
          onPress: () => router.replace('/(tabs)/practice'),
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

  const renderCountBasedConfig = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. 您想如何设定目标？</Text>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              configMode === 'total' && styles.segmentButtonActive,
            ]}
            onPress={() => setConfigMode('total')}
          >
            <Text
              style={[
                styles.segmentButtonText,
                configMode === 'total' && styles.segmentButtonTextActive,
              ]}
            >
              按总数目标
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              configMode === 'daily' && styles.segmentButtonActive,
            ]}
            onPress={() => setConfigMode('daily')}
          >
            <Text
              style={[
                styles.segmentButtonText,
                configMode === 'daily' && styles.segmentButtonTextActive,
              ]}
            >
              按每日目标
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. 目标详情</Text>
        <View style={styles.inputContainer}>
          {configMode === 'total' ? (
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
    </>
  );

  const renderTimeBasedConfig = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. 设定您的每周目标</Text>
        <View style={styles.inputRow}>
          <Text style={styles.inputPrefix}>每周完成</Text>
          <TextInput
            style={styles.textInput}
            value={sessionsTarget}
            onChangeText={setSessionsTarget}
            placeholder="例如: 4"
            keyboardType="numeric"
          />
          <Text style={styles.inputUnit}>座</Text>
        </View>
      </View>
    </>
  );

  const renderTimePlanning = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>2. 时间规划</Text>

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
            <Text style={styles.customInputLabel}>选择结束日期</Text>
            <TouchableOpacity
              style={styles.customDateButton}
              onPress={() => setShowCustomDatePicker(true)}
            >
              <Text style={styles.customDateButtonText}>{formatDate(customEndDate)}</Text>
              <Text style={styles.dateButtonIcon}>📅</Text>
            </TouchableOpacity>

            {showCustomDatePicker && (
              <DateTimePicker
                value={customEndDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)} // At least one day after start
                onChange={(event, selectedDate) => {
                  setShowCustomDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setCustomEndDate(selectedDate);
                  }
                }}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );

  const calculateSummary = () => {
    if (practiceType === 'time') {
      // Time-based practice summary
      const weeks = calculateWeeks();
      const totalSessions = parseInt(sessionsTarget) * weeks;
      return {
        duration: `约 ${weeks} 周`,
        weeklyTarget: `每周 ${sessionsTarget} 座`,
        totalSessions: `预计总计完成约 ${totalSessions} 座观修`,
      };
    } else {
      // Count-based practice summary
      if (configMode === 'total') {
        const days = calculateDays();
        const dailyAmount = Math.ceil(parseInt(totalTarget) / days);
        return {
          duration: `约 ${days} 天`,
          target: `总计 ${parseInt(totalTarget).toLocaleString()} ${practiceUnit}`,
          daily: `建议每日持诵约 ${dailyAmount.toLocaleString()} ${practiceUnit}`,
        };
      } else {
        const days = calculateDays();
        const totalAmount = parseInt(dailyTarget) * days;
        return {
          duration: `约 ${days} 天`,
          target: `总计 ${totalAmount.toLocaleString()} ${practiceUnit}`,
          daily: `每日 ${parseInt(dailyTarget).toLocaleString()} ${practiceUnit}`,
        };
      }
    }
  };

  const renderSmartSummary = () => {
    const days = calculatedDays;
    const summary = calculateSummary();

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. 智能总结</Text>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>📝 根据您的设置：</Text>
          {practiceType === 'count' ? (
            <View>
              <Text style={styles.summaryText}>
                您需要在约 {days} 天内完成，
              </Text>
              {configMode === 'total' && totalTarget ? (
                <View>
                  <Text style={styles.summaryText}>
                    总计 {parseInt(totalTarget).toLocaleString()} {practiceUnit}。
                  </Text>
                  <Text style={styles.summaryHighlight}>
                    👉 建议每日持诵约 {suggestedDaily.toLocaleString()} {practiceUnit}。
                  </Text>
                </View>
              ) : configMode === 'daily' && dailyTarget ? (
                <View>
                  <Text style={styles.summaryText}>
                    每日 {parseInt(dailyTarget).toLocaleString()} {practiceUnit}。
                  </Text>
                  <Text style={styles.summaryHighlight}>
                    👉 预计总计完成 {projectedTotal.toLocaleString()} {practiceUnit}。
                  </Text>
                </View>
              ) : (
                <Text style={styles.summaryText}>请设置目标数量以查看建议。</Text>
              )}
            </View>
          ) : (
            <View>
              {sessionsTarget ? (
                <View>
                  <Text style={styles.summaryText}>
                    🎯 在约 {days} 天内完成
                  </Text>
                  <Text style={styles.summaryText}>
                    📅 从 {formatDate(startDate)} 开始，每周 {sessionsTarget} 座观修
                  </Text>
                  <Text style={styles.summaryHighlight}>
                    👉 预计总计完成约 {Math.ceil(days / 7) * parseInt(sessionsTarget)} 座观修
                  </Text>
                </View>
              ) : (
                <Text style={styles.summaryText}>请设置座数目标以查看建议。</Text>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const calculateDays = () => {
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
        end = customEndDate;
        break;
      default:
        end = new Date(start.getTime() + 60 * 24 * 60 * 60 * 1000);
    }

    return Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  };

  const calculateWeeks = () => {
    return Math.ceil(calculateDays() / 7);
  };

  const handleConfirm = async () => {
    if (!user) return;

    // Validation
    if (practiceType === 'time') {
      if (!sessionsTarget || parseInt(sessionsTarget) <= 0) {
        Alert.alert('错误', '请输入有效的座数');
        return;
      }
    } else {
      if (configMode === 'total') {
        if (!totalTarget || parseInt(totalTarget) <= 0) {
          Alert.alert('错误', '请输入有效的总目标数量');
          return;
        }
      } else {
        if (!dailyTarget || parseInt(dailyTarget) <= 0) {
          Alert.alert('错误', '请输入有效的每日目标数量');
          return;
        }
      }
    }

    setLoading(true);

    try {
      let projectData;

      if (practiceType === 'time') {
        // Time-based practice configuration
        const startDateObj = new Date(startDate);
        const weeks = calculateWeeks();
        const endDate = new Date(startDateObj);
        endDate.setDate(startDateObj.getDate() + (weeks * 7));
        const targetCount = parseInt(sessionsTarget) * weeks;

        projectData = {
          user_id: user.id,
          practice_id: practiceId,
          target_period: 'weekly',
          daily_target: parseInt(sessionsTarget),
          start_date: startDateObj.toISOString().split('T')[0],
          target_end_date: endDate.toISOString().split('T')[0],
          target_count: targetCount,
          current_count: 0,
          status: 'active',
          goal_type: configMode,
          preset_project_id: selectedPresetId || null,
          project_name: selectedPresetId ? null : (projectName || null),
        };
      } else {
        // Count-based practice configuration
        const startDateObj = new Date(startDate);
        const days = calculateDays();
        const endDate = new Date(startDateObj);
        endDate.setDate(startDateObj.getDate() + days);
        let finalTargetCount, finalDailyTarget;

        if (configMode === 'total') {
          finalTargetCount = parseInt(totalTarget);
          finalDailyTarget = Math.ceil(finalTargetCount / days);
        } else {
          finalDailyTarget = parseInt(dailyTarget);
          finalTargetCount = finalDailyTarget * days;
        }

        projectData = {
          user_id: user.id,
          practice_id: practiceId,
          target_count: finalTargetCount,
          daily_target: finalDailyTarget,
          start_date: startDateObj.toISOString().split('T')[0],
          target_end_date: endDate.toISOString().split('T')[0],
          current_count: 0,
          status: 'active',
          target_period: 'daily',
          goal_type: configMode,
          preset_project_id: selectedPresetId || null,
          project_name: selectedPresetId ? null : (projectName || null),
        };
      }

      const { data, error } = await supabase
        .from('user_practice_projects')
        .insert([projectData])
        .select();

      if (error) throw error;

      console.log('✅ Practice project created:', data);
      Alert.alert('成功', '修行项目已添加！', [
        { text: '确定', onPress: () => router.push('/(tabs)/practice') }
      ]);

    } catch (error) {
      console.error('❌ Error creating practice project:', error);
      Alert.alert('错误', '创建修行项目失败');
    } finally {
      setLoading(false);
    }
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


        <View style={styles.section}>
          <Text style={styles.sectionTitle}>项目名称 (可选)</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>为这个修行项目起个名字</Text>

            {/* Tab Interface */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  usePresetName && styles.tabButtonActive,
                ]}
                onPress={() => {
                  setUsePresetName(true);
                  setProjectName('');
                  setSelectedPresetId('');
                }}
              >
                <Text style={[
                  styles.tabButtonText,
                  usePresetName && styles.tabButtonTextActive,
                ]}>
                  预设
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  !usePresetName && styles.tabButtonActive,
                ]}
                onPress={() => {
                  setUsePresetName(false);
                  setProjectName('');
                  setSelectedPresetId('');
                }}
              >
                <Text style={[
                  styles.tabButtonText,
                  !usePresetName && styles.tabButtonTextActive,
                ]}>
                  自定义
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            <View style={styles.tabContent}>
              {usePresetName ? (
                <View style={styles.presetContainer}>
                  {loadingPresets ? (
                    <Text style={styles.loadingText}>加载中...</Text>
                  ) : (
                    <ScrollView 
                      style={styles.presetScrollView}
                      showsVerticalScrollIndicator={false}
                    >
                      <View style={styles.presetGrid}>
                        {presetProjectNames.map((preset) => (
                          <TouchableOpacity
                            key={preset.id}
                            style={[
                              styles.presetButton,
                              selectedPresetId === preset.id && styles.presetButtonActive,
                            ]}
                            onPress={() => {
                              setSelectedPresetId(preset.id);
                            }}
                          >
                            <Text style={[
                              styles.presetButtonText,
                              selectedPresetId === preset.id && styles.presetButtonTextActive,
                            ]}>
                              {preset.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  )}
                </View>
              ) : (
                <View style={styles.customContainer}>
                  <Text style={styles.customLabel}>输入项目名称</Text>
                  <TextInput
                    style={styles.customInput}
                    placeholder="例如：2025金刚萨埵法会、请水晶念珠等"
                    value={projectName}
                    onChangeText={setProjectName}
                    multiline={false}
                  />
                </View>
              )}
            </View>

            <Text style={styles.helpText}>
              项目名称可以帮助您区分同一种修行的不同发愿或阶段
            </Text>
          </View>
        </View>

        {practiceType === 'count' ? renderCountBasedConfig() : renderTimeBasedConfig()}
        {renderTimePlanning()}
        {renderSmartSummary()}

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleConfirm}
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
  },```text
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
  customDateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  customDateButtonText: {
    fontSize: 16,
    color: '#333',
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
  topicProgressInfo: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
    marginTop: 8,
  },
  topicProgressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  topicProgressSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
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
  specialSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  topicProgressConfig: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  configLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  configDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    textAlign: 'center',
    minWidth: 60,
    backgroundColor: '#fff',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  projectNameInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    padding: 2,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  tabButtonTextActive: {
    color: '#333',
    fontWeight: '600',
  },
  tabContent: {
    minHeight: 120,
  },
  presetContainer: {
    marginTop: 8,
  },
  presetScrollView: {
    maxHeight: 200,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
  },
  presetButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minWidth: 100,
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  presetButtonTextActive: {
    color: 'white',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    padding: 20,
  },
  customContainer: {
    marginTop: 8,
  },
  customLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 12,
  },
  customInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
});