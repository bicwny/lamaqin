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
import ModalDatetimePicker from 'react-native-modal-datetime-picker';

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
  const [presetProjectNames, setPresetProjectNames] = useState<Array<{
    id: string;
    name: string;
    category?: string;
    display_order: number;
  }>>([]);
  const [loadingPresets, setLoadingPresets] = useState(true);
  const [filteredPresets, setFilteredPresets] = useState<Array<{
    id: string;
    name: string;
    category?: string;
    display_order: number;
  }>>([]);

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
  const [customDays, setCustomDays] = useState('60'); // Default to 60 days

  // Calculated values
  const [suggestedDaily, setSuggestedDaily] = useState(0);
  const [projectedTotal, setProjectedTotal] = useState(0);
  const [calculatedDays, setCalculatedDays] = useState(0);

  const [targetPeriod, setTargetPeriod] = useState<'daily' | 'weekly'>('weekly');
  const [goalType, setGoalType] = useState<'fixed_duration' | 'topic_progress'>('fixed_duration');
  const [weeklyTopicTarget, setWeeklyTopicTarget] = useState(2);
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isCustomDatePickerVisible, setCustomDatePickerVisibility] = useState(false);


  useEffect(() => {
    calculateSuggestions();
  }, [totalTarget, dailyTarget, startDate, durationMode, customEndDate, configMode]);

  // Handle days input change - auto update end date
  const handleDaysInputChange = (text: string) => {
    setCustomDays(text);
    const days = parseInt(text);
    if (!isNaN(days) && days > 0) {
      const newEndDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
      setCustomEndDate(newEndDate);
      setDurationMode('自定义');
    }
  };

  // Handle end date change - auto update days
  const handleEndDateChange = (selectedDate: Date) => {
    setCustomEndDate(selectedDate);
    const daysDiff = Math.ceil((selectedDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    setCustomDays(daysDiff.toString());
    setDurationMode('自定义');
  };

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

  const handleProjectNameChange = (text: string) => {
    setProjectName(text);
    setSelectedPresetId(''); // Clear preset selection when typing custom name

    // Filter presets based on input
    if (text.length > 0) {
      const filtered = presetProjectNames.filter(preset => 
        preset.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredPresets(filtered);
    } else {
      setFilteredPresets([]);
    }
  };

  const selectPreset = (preset: { id: string; name: string; category?: string; display_order: number }) => {
    setProjectName(preset.name);
    setSelectedPresetId(preset.id);
    setFilteredPresets([]); // Hide dropdown
  };

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
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>目标设置</Text>

      {/* Simple toggle for goal type */}
      <View style={styles.goalTypeContainer}>
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
              总数目标
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
              每日目标
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Single input field for goal */}
      <View style={styles.goalInputContainer}>
        {configMode === 'total' ? (
          <>
            <Text style={styles.goalInputLabel}>总目标数量</Text>
            <View style={styles.goalInputRow}>
              <TextInput
                style={styles.goalTextInput}
                value={totalTarget}
                onChangeText={setTotalTarget}
                placeholder="例如: 400000"
                keyboardType="numeric"
              />
              <Text style={styles.goalInputUnit}>{practiceUnit}</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.goalInputLabel}>每日目标</Text>
            <View style={styles.goalInputRow}>
              <TextInput
                style={styles.goalTextInput}
                value={dailyTarget}
                onChangeText={setDailyTarget}
                placeholder="例如: 1000"
                keyboardType="numeric"
              />
              <Text style={styles.goalInputUnit}>{practiceUnit}</Text>
            </View>
          </>
        )}
      </View>
    </View>
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

  const showStartDatepicker = () => {
    if (Platform.OS === 'web') {
      setShowStartDatePicker(true);
    } else {
      setStartDatePickerVisibility(true);
    }
  };

  const hideStartDatePicker = () => {
    setStartDatePickerVisibility(false);
    setShowStartDatePicker(false);
  };

    const showCustomDatepicker = () => {
    if (Platform.OS === 'web') {
      setShowCustomDatePicker(true);
    } else {
      setCustomDatePickerVisibility(true);
    }
  };

  const hideCustomDatePicker = () => {
    setCustomDatePickerVisibility(false);
    setShowCustomDatePicker(false);
  };

  const handleStartDateConfirm = (date: Date) => {
    setStartDate(date);
    hideStartDatePicker();
  };

    const handleCustomDateConfirm = (date: Date) => {
    setCustomEndDate(date);
    hideCustomDatePicker();
  };

  const renderTimePlanning = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>时间规划</Text>

      {/* Start date - always defaults to today, but editable */}
      <View style={styles.timeInputContainer}>
        <Text style={styles.timeInputLabel}>开始日期</Text>
        <TouchableOpacity
          style={styles.simpleDateButton}
          onPress={showStartDatepicker}
        >
          <Text style={styles.simpleDateButtonText}>{formatDate(startDate)}</Text>
          <Text style={styles.dateButtonIcon}>📅</Text>
        </TouchableOpacity>

        {/* DateTimePicker Modal */}
        {practiceType === 'count' && (
          <ModalDatetimePicker
            isVisible={isStartDatePickerVisible}
            mode="date"
            onConfirm={handleStartDateConfirm}
            onCancel={hideStartDatePicker}
            value={startDate}
          />
        )}

        {showStartDatePicker && Platform.OS !== 'web' && (
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

        {showStartDatePicker && Platform.OS === 'web' && (
          <View style={styles.webDatePicker}>
            <TextInput
              style={styles.webDateInput}
              type="date"
              value={startDate.toISOString().split('T')[0]}
              onChange={(event) => {
                const newDate = new Date(event.target.value);
                setStartDate(newDate);
                setShowStartDatePicker(false);
              }}
            />
          </View>
        )}
      </View>

      {/* End date - smart duration input */}
      <View style={styles.timeInputContainer}>
        <Text style={styles.timeInputLabel}>结束日期</Text>

        {/* Smart duration input */}
        <View style={styles.smartDurationContainer}>
          <View style={styles.daysInputContainer}>
            <TextInput
              style={styles.daysInput}
              value={customDays}
              onChangeText={handleDaysInputChange}
              placeholder="天数"
              keyboardType="numeric"
            />
            <Text style={styles.daysInputLabel}>天</Text>
          </View>

          <Text style={styles.durationSeparator}>或</Text>

          <TouchableOpacity
            style={styles.endDatePickerButton}
            onPress={showCustomDatepicker}
          >
            <Text style={styles.endDatePickerButtonText}>
              {formatDate(customEndDate)}
            </Text>
            <Text style={styles.dateButtonIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* Duration display */}
        <View style={styles.durationDisplay}>
          <Text style={styles.durationDisplayText}>
            {formatDate(startDate)} → {formatDate(customEndDate)} (共 {calculatedDays} 天)
          </Text>
        </View>

          {/* DateTimePicker Modal */}
        {practiceType === 'count' && (
          <ModalDatetimePicker
            isVisible={isCustomDatePickerVisible}
            mode="date"
            onConfirm={handleCustomDateConfirm}
            onCancel={hideCustomDatePicker}
            value={customEndDate}
          />
        )}

        {showCustomDatePicker && Platform.OS !== 'web' && (
          <DateTimePicker
            value={customEndDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)}
            onChange={(event, selectedDate) => {
              setShowCustomDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                handleEndDateChange(selectedDate);
              }
            }}
          />
        )}

        {showCustomDatePicker && Platform.OS === 'web' && (
          <View style={styles.webDatePicker}>
            <TextInput
              style={styles.webDateInput}
              type="date"
              value={customEndDate.toISOString().split('T')[0]}
              min={new Date(startDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              onChange={(event) => {
                const newDate = new Date(event.target.value);
                handleEndDateChange(newDate);
                setShowCustomDatePicker(false);
              }}
            />
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

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>项目预览</Text>
        <View style={styles.previewCard}>
          {practiceType === 'count' ? (
            <View>
              <View style={styles.previewHeader}>
                <Text style={styles.previewPracticeName}>{practiceName}</Text>
                {projectName && (
                  <View style={styles.previewProjectPill}>
                    <Text style={styles.previewProjectPillText}>{projectName}</Text>
                  </View>
                )}
              </View>

              <View style={styles.previewDetails}>
                <Text style={styles.previewDetailItem}>
                  📅 {formatDate(startDate)} → {formatDate(durationMode === '自定义' ? customEndDate : new Date(startDate.getTime() + (durationMode === '60天' ? 60 : durationMode === '100天' ? 100 : durationMode === '1年' ? 365 : 60) * 24 * 60 * 60 * 1000))} ({days} 天)
                </Text>

                {configMode === 'total' && totalTarget ? (
                  <>
                    <Text style={styles.previewDetailItem}>
                      🎯 总目标: {parseInt(totalTarget).toLocaleString()} {practiceUnit}
                    </Text>
                    <Text style={styles.previewDetailItem}>
                      📊 每日目标: {suggestedDaily.toLocaleString()} {practiceUnit}
                    </Text>
                  </>
                ) : configMode === 'daily' && dailyTarget ? (
                  <>
                    <Text style={styles.previewDetailItem}>
                      🎯 每日目标: {parseInt(dailyTarget).toLocaleString()} {practiceUnit}
                    </Text>
                    <Text style={styles.previewDetailItem}>
                      📊 预计总数: {projectedTotal.toLocaleString()} {practiceUnit}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.previewPlaceholder}>请设置目标以查看详情</Text>
                )}
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.previewHeader}>
                <Text style={styles.previewPracticeName}>{practiceName}</Text>
                {projectName && (
                  <View style={styles.previewProjectPill}>
                    <Text style={styles.previewProjectPillText}>{projectName}</Text>
                  </View>
                )}
              </View>

              <View style={styles.previewDetails}>
                <Text style={styles.previewDetailItem}>
                  📅 {formatDate(startDate)} → {formatDate(durationMode === '自定义' ? customEndDate : new Date(startDate.getTime() + (durationMode === '60天' ? 60 : durationMode === '100天' ? 100 : durationMode === '1年' ? 365 : 60) * 24 * 60 * 60 * 1000))} ({days} 天)
                </Text>

                {sessionsTarget ? (
                  <Text style={styles.previewDetailItem}>
                    🎯 每周目标: {sessionsTarget} 座
                  </Text>
                ) : (
                  <Text style={styles.previewPlaceholder}>请设置目标以查看详情</Text>
                )}
              </View>
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

            {/* Single Input Field with Autocomplete */}
            <View style={styles.autocompleteContainer}>
              <TextInput
                style={[
                  styles.autocompleteInput,
                  filteredPresets.length > 0 && projectName.length > 0 && styles.autocompleteInputActive
                ]}
                placeholder="输入项目名称或选择预设..."
                value={projectName}
                onChangeText={handleProjectNameChange}
                multiline={false}
              />

              {/* Autocomplete Dropdown */}
              {filteredPresets.length > 0 && projectName.length > 0 && (
                <View style={styles.autocompleteDropdown}>
                  <ScrollView 
                    style={styles.autocompleteScrollView}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    {filteredPresets.map((preset) => (
                      <TouchableOpacity
                        key={preset.id}
                        style={styles.autocompleteItem}
                        onPress={() => selectPreset(preset)}
                      >
                        <Text style={styles.autocompleteItemText}>{preset.name}</Text>
                        {preset.category && (
                          <Text style={styles.autocompleteItemCategory}>{preset.category}</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
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
  // Simplified count-based config styles
  goalTypeContainer: {
    marginBottom: 20,
  },
  goalInputContainer: {
    marginTop: 8,
  },
  goalInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  goalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  goalTextInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  goalInputUnit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  // Simplified time planning styles
  timeInputContainer: {
    marginBottom: 16,
  },
  timeInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  simpleDateButton: {
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
  simpleDateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  quickDurationButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  quickDurationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f3f4',
    borderRadius: 20,
  },
  quickDurationButtonActive: {
    backgroundColor: Colors.primary,
  },
  quickDurationButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  quickDurationButtonTextActive: {
    color: 'white',
  },
  customDatePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginTop: 8,
  },
  customDatePickerButtonActive: {
    backgroundColor: '#e8f4fd',
    borderColor: Colors.primary,
  },
  customDatePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  // Smart duration input styles
  smartDurationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  daysInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flex: 1,
  },
  daysInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  daysInputLabel: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  durationSeparator: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  endDatePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flex: 2,
    justifyContent: 'space-between',
  },
  endDatePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  durationDisplay: {
    backgroundColor: '#f0f8ff',
    borderRadius: 6,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  durationDisplayText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  // Preview card styles
  previewCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  previewPracticeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  previewProjectPill: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  previewProjectPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  previewDetails: {
    gap: 6,
  },
  previewDetailItem: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  previewPlaceholder: {
    fontSize: 14,
    color: '#999',
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
  autocompleteContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  autocompleteInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  autocompleteInputActive: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomColor: 'transparent',
  },
  autocompleteDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#e9ecef',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1001,
  },
  autocompleteScrollView: {
    flex: 1,
  },
  autocompleteItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  autocompleteItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  autocompleteItemCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  webDatePicker: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  webDateInput: {
    fontSize: 16,
    color: '#333',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
  },
});