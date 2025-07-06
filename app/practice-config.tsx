import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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

  // Main configuration mode
  const [configMode, setConfigMode] = useState<'total' | 'daily' | 'topic_progress' | 'fixed_duration'>(
    practiceType === 'time' ? 'topic_progress' : 'total'
  );

  // Reset duration mode when switching between total and daily for count practices
  useEffect(() => {
    if (practiceType === 'count' && configMode === 'total' && durationMode === '持续进行') {
      setDurationMode('60天');
    }
  }, [configMode, practiceType]);

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
  const [durationMode, setDurationMode] = useState<'30天' | '60天' | '100天' | '1年' | '自定义' | '持续进行'>('60天');
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
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-4">1. 您想如何设定目标？</Text>
        <View className="flex-row bg-gray-100 rounded-lg p-1">
          <TouchableOpacity
            className={`flex-1 py-3 px-4 rounded-md items-center ${
              configMode === 'total' ? 'bg-white shadow-sm' : ''
            }`}
            onPress={() => setConfigMode('total')}
          >
            <Text
              className={`text-base font-medium ${
                configMode === 'total' ? 'text-gray-800' : 'text-gray-600'
              }`}
            >
              按总数目标
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 px-4 rounded-md items-center ${
              configMode === 'daily' ? 'bg-white shadow-sm' : ''
            }`}
            onPress={() => setConfigMode('daily')}
          >
            <Text
              className={`text-base font-medium ${
                configMode === 'daily' ? 'text-gray-800' : 'text-gray-600'
              }`}
            >
              按每日目标
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-4">2. 目标详情</Text>
        <View className="mt-4">
          {configMode === 'total' ? (
            <>
              <Text className="text-base font-semibold text-gray-800 mb-2">总目标数量</Text>
              <View className="flex-row items-center bg-gray-50 rounded-lg px-3 border border-gray-200">
                <TextInput
                  className="flex-1 py-3 text-base text-gray-800"
                  value={totalTarget}
                  onChangeText={setTotalTarget}
                  placeholder="例如: 400000"
                  keyboardType="numeric"
                />
                <Text className="text-base text-gray-600 ml-2">{practiceUnit}</Text>
              </View>
            </>
          ) : (
            <>
              <Text className="text-base font-semibold text-gray-800 mb-2">每日目标</Text>
              <View className="flex-row items-center bg-gray-50 rounded-lg px-3 border border-gray-200">
                <Text className="text-base text-gray-600 mr-2">每日持诵</Text>
                <TextInput
                  className="flex-1 py-3 text-base text-gray-800"
                  value={dailyTarget}
                  onChangeText={setDailyTarget}
                  placeholder="例如: 1000"
                  keyboardType="numeric"
                />
                <Text className="text-base text-gray-600 ml-2">{practiceUnit}</Text>
              </View>
            </>
          )}
        </View>
      </View>
    </>
  );

  const renderTimeBasedConfig = () => (
    <>
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-4">1. 设定您的每周目标</Text>
        <View className="flex-row items-center bg-gray-50 rounded-lg px-3 border border-gray-200">
          <Text className="text-base text-gray-600 mr-2">每周完成</Text>
          <TextInput
            className="flex-1 py-3 text-base text-gray-800"
            value={sessionsTarget}
            onChangeText={setSessionsTarget}
            placeholder="例如: 4"
            keyboardType="numeric"
          />
          <Text className="text-base text-gray-600 ml-2">座</Text>
        </View>
      </View>
    </>
  );

  const renderTimePlanning = () => (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-gray-800 mb-4">2. 时间规划</Text>

      <View className="mt-4 mb-4">
        <Text className="text-base font-semibold text-gray-800 mb-2">开始时间</Text>
        <TouchableOpacity
          className="flex-row justify-between items-center bg-gray-50 rounded-lg px-3 py-3 border border-gray-200"
          onPress={() => setShowStartDatePicker(true)}
        >
          <Text className="text-base text-gray-800">{formatDate(startDate)}</Text>
          <Text className="text-base">📅</Text>
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

      <View className="mt-4">
        <Text className="text-base font-semibold text-gray-800 mb-2">持续时间</Text>
        <View className="flex-row flex-wrap mb-3">
          {['30天', '60天', '100天', '1年'].map((option) => (
            <TouchableOpacity
              key={option}
              className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                durationMode === option ? 'bg-primary' : 'bg-gray-100'
              }`}
              onPress={() => setDurationMode(option as any)}
            >
              <Text
                className={`text-sm font-medium ${
                  durationMode === option ? 'text-white' : 'text-gray-600'
                }`}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          className={`py-3 rounded-lg items-center mb-3 ${
            durationMode === '自定义' ? 'bg-yellow-600' : 'bg-yellow-500'
          }`}
          onPress={() => setDurationMode('自定义')}
        >
          <Text
            className={`text-base font-semibold ${
              durationMode === '自定义' ? 'text-white' : 'text-white'
            }`}
          >
            自定义
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`py-3 rounded-lg items-center mt-2 border-2 ${
            durationMode === '持续进行' ? 'bg-green-500 border-green-500' : 'bg-green-100 border-green-500'
          } ${
            (practiceType === 'count' && configMode === 'total') ? 'opacity-50' : ''
          }`}
          onPress={() => {
            // Only allow ongoing for time-based practices or count-based daily target mode
            if (practiceType === 'time' || configMode === 'daily') {
              setDurationMode('持续进行' as any);
            }
          }}
          disabled={practiceType === 'count' && configMode === 'total'}
        >
          <Text
            className={`text-base font-semibold ${
              durationMode === '持续进行' ? 'text-white' : 'text-green-600'
            } ${
              (practiceType === 'count' && configMode === 'total') ? 'text-gray-400' : ''
            }`}
          >
            持续进行 (直到我停止)
          </Text>
        </TouchableOpacity>

        {durationMode === '自定义' && (
          <View className="mt-3 p-4 bg-gray-50 rounded-lg border-2 border-blue-500">
            <Text className="text-sm font-medium text-gray-800 mb-2">选择结束日期</Text>
            <TouchableOpacity
              className="flex-row justify-between items-center bg-white rounded-md px-3 py-3 border border-gray-200"
              onPress={() => setShowCustomDatePicker(true)}
            >
              <Text className="text-base text-gray-800">{formatDate(customEndDate)}</Text>
              <Text className="text-base">📅</Text>
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
      if (configMode === 'topic_progress') {
        const weeks = durationMode === '持续进行' ? null : calculateWeeks();
        const totalSessions = weeks ? parseInt(sessionsTarget) * weeks : null;

        return {
          duration: weeks ? `约 ${weeks} 周` : '持续进行',
          weeklyTarget: `每周 ${sessionsTarget} 座`,
          totalSessions: totalSessions ? `预计总计完成约 ${totalSessions} 座观修` : '无固定总数，持续进行',
        };
      } else {
        // Fixed duration mode for time practices
        const weeks = calculateWeeks();
        const totalSessions = parseInt(sessionsTarget) * weeks;
        return {
          duration: `约 ${weeks} 周`,
          weeklyTarget: `每周 ${sessionsTarget} 座`,
          totalSessions: `预计总计完成约 ${totalSessions} 座观修`,
        };
      }
    } else {
      // Count-based practice summary
      if (durationMode === '持续进行') {
        // For ongoing count practices
        if (configMode === 'total') {
          return {
            duration: '持续进行',
            target: `目标总数：${parseInt(totalTarget).toLocaleString()} ${practiceUnit}`,
            daily: `建议每日持诵约 ${Math.ceil(parseInt(totalTarget) / 365).toLocaleString()} ${practiceUnit}`,
          };
        } else {
          return {
            duration: '持续进行',
            target: '无固定总数，持续进行',
            daily: `每日 ${parseInt(dailyTarget).toLocaleString()} ${practiceUnit}`,
          };
        }
      } else {
        // For fixed duration count practices
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
    }
  };

  const renderSmartSummary = () => {
    const days = calculatedDays;
    const summary = calculateSummary();

    return (
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-4">4. 智能总结</Text>
        <View className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary">
          <Text className="text-base font-semibold text-gray-800 mb-3">📝 根据您的设置：</Text>
          {practiceType === 'count' ? (
            <View>
              <Text className="text-sm text-gray-600 leading-5 mb-1">
                您需要在约 {days} 天内完成，
              </Text>
              {configMode === 'total' && totalTarget ? (
                <View>
                  <Text className="text-sm text-gray-600 leading-5 mb-1">
                    总计 {parseInt(totalTarget).toLocaleString()} {practiceUnit}。
                  </Text>
                  <Text className="text-sm font-semibold text-primary leading-5 mt-2">
                    👉 建议每日持诵约 {suggestedDaily.toLocaleString()} {practiceUnit}。
                  </Text>
                </View>
              ) : configMode === 'daily' && dailyTarget ? (
                <View>
                  <Text className="text-sm text-gray-600 leading-5 mb-1">
                    每日 {parseInt(dailyTarget).toLocaleString()} {practiceUnit}。
                  </Text>
                  <Text className="text-sm font-semibold text-primary leading-5 mt-2">
                    👉 预计总计完成 {projectedTotal.toLocaleString()} {practiceUnit}。
                  </Text>
                </View>
              ) : (
                <Text className="text-sm text-gray-600 leading-5">请设置目标数量以查看建议。</Text>
              )}
            </View>
          ) : (
            <View>
              {durationMode === '持续进行' ? (
                <View>
                  <Text className="text-sm text-gray-600 leading-5 mb-1">
                    🎯 持续进行模式：每周目标 {sessionsTarget || 4} 座观修
                  </Text>
                  <Text className="text-sm text-gray-600 leading-5 mb-1">
                    📅 从 {formatDate(startDate)} 开始
                  </Text>
                  <Text className="text-sm font-semibold text-primary leading-5 mb-1">
                    👉 记录时需选择具体修法主题和观修时长
                  </Text>
                  <Text className="text-sm font-semibold text-primary leading-5">
                    🏁 将持续进行直到您手动停止
                  </Text>
                </View>
              ) : sessionsTarget ? (
                <View>
                  <Text className="text-sm text-gray-600 leading-5 mb-1">
                    🎯 固定时长模式：在约 {days} 天内完成
                  </Text>
                  <Text className="text-sm text-gray-600 leading-5 mb-1">
                    📅 从 {formatDate(startDate)} 开始，每周 {sessionsTarget} 座观修
                  </Text>
                  <Text className="text-sm font-semibold text-primary leading-5 mt-2">
                    👉 预计总计完成约 {Math.ceil(days / 7) * parseInt(sessionsTarget)} 座观修
                  </Text>
                </View>
              ) : (
                <Text className="text-sm text-gray-600 leading-5">请设置座数目标以查看建议。</Text>
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
        case '持续进行':
          return 36500;
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
        let endDate = null;
        let targetCount = 0;

        if (durationMode !== '持续进行') {
          const weeks = calculateWeeks();
          endDate = new Date(startDateObj);
          endDate.setDate(startDateObj.getDate() + (weeks * 7));
          targetCount = parseInt(sessionsTarget) * weeks;
        }

        projectData = {
          user_id: user.id,
          practice_id: practiceId,
          target_period: 'weekly',
          daily_target: parseInt(sessionsTarget),
          start_date: startDateObj.toISOString().split('T')[0],
          target_end_date: endDate ? endDate.toISOString().split('T')[0] : null,
          target_count: targetCount,
          current_count: 0,
          status: 'active',
          goal_type: configMode,
        };
      } else {
        // Count-based practice configuration
        const startDateObj = new Date(startDate);
        let endDate = null;
        let finalTargetCount, finalDailyTarget;

        if (durationMode === '持续进行') {
          // For ongoing count practices
          endDate = null;
          if (configMode === 'total') {
            finalTargetCount = parseInt(totalTarget);
            finalDailyTarget = Math.ceil(finalTargetCount / 365); // Rough daily estimate
          } else {
            finalDailyTarget = parseInt(dailyTarget);
            finalTargetCount = 0; // No fixed total for ongoing practices
          }
        } else {
          // For fixed duration count practices
          const days = calculateDays();
          endDate = new Date(startDateObj);
          endDate.setDate(startDateObj.getDate() + days);

          if (configMode === 'total') {
            finalTargetCount = parseInt(totalTarget);
            finalDailyTarget = Math.ceil(finalTargetCount / days);
          } else {
            finalDailyTarget = parseInt(dailyTarget);
            finalTargetCount = finalDailyTarget * days;
          }
        }

        projectData = {
          user_id: user.id,
          practice_id: practiceId,
          target_count: finalTargetCount,
          daily_target: finalDailyTarget,
          start_date: startDateObj.toISOString().split('T')[0],
          target_end_date: endDate ? endDate.toISOString().split('T')[0] : null,
          current_count: 0,
          status: 'active',
          target_period: 'daily',
          goal_type: configMode,
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
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="py-2 mb-2">
          <Text className="text-primary text-base font-medium">← 返回</Text>
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-gray-800 text-center">配置"{practiceName}"</Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {practiceType === 'count' ? renderCountBasedConfig() : renderTimeBasedConfig()}
        {renderTimePlanning()}
        {renderSmartSummary()}

        <TouchableOpacity
          className={`bg-primary py-4 rounded-xl items-center mt-6 mb-8 ${loading ? 'opacity-60' : ''}`}
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-lg font-semibold">确认添加项目</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}