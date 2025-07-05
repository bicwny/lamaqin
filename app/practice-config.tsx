import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';

type GoalType = 'topic_progress' | 'fixed_duration';
type TargetPeriod = 'daily' | 'weekly';

export default function PracticeConfigScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const { practiceId, practiceName, practiceType, practiceUnit } = params;

  // Form state
  const [goalType, setGoalType] = useState<GoalType>('fixed_duration');
  const [targetCount, setTargetCount] = useState('');
  const [dailyTarget, setDailyTarget] = useState('');
  const [targetPeriod, setTargetPeriod] = useState<TargetPeriod>('daily');
  const [duration, setDuration] = useState('60');
  const [loading, setLoading] = useState(false);

  // Calculated values
  const [calculatedSummary, setCalculatedSummary] = useState<{
    totalDays: number;
    totalWeeks: number;
    suggestedDaily?: number;
    suggestedWeekly?: number;
    projectedTotal?: number;
  }>({ totalDays: 0, totalWeeks: 0 });

  useEffect(() => {
    calculateSummary();
  }, [goalType, targetCount, dailyTarget, targetPeriod, duration]);

  const calculateSummary = () => {
    const durationDays = parseInt(duration) || 0;
    const durationWeeks = Math.ceil(durationDays / 7);

    let summary = {
      totalDays: durationDays,
      totalWeeks: durationWeeks,
    };

    if (practiceType === 'time') {
      // Time-based practice calculations
      if (goalType === 'fixed_duration') {
        const daily = parseInt(dailyTarget) || 0;
        const weekly = targetPeriod === 'weekly' ? daily : daily * 7;
        summary = {
          ...summary,
          projectedTotal: targetPeriod === 'weekly' ? weekly * durationWeeks : daily * durationDays,
        };
      } else {
        // topic_progress - show 92 topics info
        const weeklyMin = parseInt(dailyTarget) || 1;
        summary = {
          ...summary,
          suggestedWeekly: weeklyMin,
        };
      }
    } else {
      // Count-based practice calculations
      const total = parseInt(targetCount) || 0;
      const daily = parseInt(dailyTarget) || 0;

      if (total && !daily) {
        summary = { ...summary, suggestedDaily: Math.ceil(total / durationDays) };
      } else if (daily && !total) {
        summary = { ...summary, projectedTotal: daily * durationDays };
      }
    }

    setCalculatedSummary(summary);
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('错误', '请先登录');
      return;
    }

    // Validation
    if (practiceType === 'time' && goalType === 'topic_progress') {
      if (!dailyTarget || parseInt(dailyTarget) < 1) {
        Alert.alert('错误', '请设置每周最少完成的法门数量');
        return;
      }
    } else if (practiceType === 'time' && goalType === 'fixed_duration') {
      if (!dailyTarget || parseInt(dailyTarget) < 1) {
        Alert.alert('错误', '请设置' + (targetPeriod === 'daily' ? '每日' : '每周') + '目标座数');
        return;
      }
    } else if (practiceType === 'count') {
      if (!targetCount && !dailyTarget) {
        Alert.alert('错误', '请设置总目标或每日目标');
        return;
      }
    }

    if (!duration || parseInt(duration) < 1) {
      Alert.alert('错误', '请设置持续时间');
      return;
    }

    setLoading(true);

    try {
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      let finalTargetCount = 0;
      let finalDailyTarget = 0;

      if (practiceType === 'time') {
        if (goalType === 'topic_progress') {
          // For topic progress, we don't set a fixed target count
          // Instead, we track progress through the 92 topics
          finalTargetCount = 92; // Total topics
          finalDailyTarget = parseInt(dailyTarget); // Weekly minimum
        } else {
          // Fixed duration
          finalDailyTarget = parseInt(dailyTarget);
          finalTargetCount = calculatedSummary.projectedTotal || 0;
        }
      } else {
        // Count-based
        finalTargetCount = parseInt(targetCount) || calculatedSummary.projectedTotal || 0;
        finalDailyTarget = parseInt(dailyTarget) || calculatedSummary.suggestedDaily || 0;
      }

      const { error } = await supabase
        .from('user_practice_projects')
        .insert({
          user_id: user.id,
          practice_id: practiceId,
          target_count: finalTargetCount,
          daily_target: finalDailyTarget,
          target_period: targetPeriod,
          start_date: startDate,
          target_end_date: endDate,
          status: 'active',
          goal_type: practiceType === 'time' ? goalType : 'fixed_duration',
        });

      if (error) throw error;

      Alert.alert('成功', '修行项目已添加', [
        { text: '确定', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error saving practice:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const renderTimeBasedConfig = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>设置目标类型</Text>

      <View style={styles.goalTypeSelector}>
        <TouchableOpacity
          style={[
            styles.goalTypeButton,
            goalType === 'topic_progress' && styles.selectedGoalTypeButton
          ]}
          onPress={() => setGoalType('topic_progress')}
        >
          <Text style={[
            styles.goalTypeButtonText,
            goalType === 'topic_progress' && styles.selectedGoalTypeButtonText
          ]}>
            法门进度
          </Text>
          <Text style={styles.goalTypeDescription}>
            92个法门逐步完成
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.goalTypeButton,
            goalType === 'fixed_duration' && styles.selectedGoalTypeButton
          ]}
          onPress={() => setGoalType('fixed_duration')}
        >
          <Text style={[
            styles.goalTypeButtonText,
            goalType === 'fixed_duration' && styles.selectedGoalTypeButtonText
          ]}>
            固定时长
          </Text>
          <Text style={styles.goalTypeDescription}>
            设定每日/每周座数
          </Text>
        </TouchableOpacity>
      </View>

      {goalType === 'topic_progress' ? (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>每周最少完成法门数量</Text>
          <TextInput
            style={styles.input}
            value={dailyTarget}
            onChangeText={setDailyTarget}
            keyboardType="numeric"
            placeholder="例如：1"
          />
          <Text style={styles.inputHint}>
            建议每周至少完成1个法门，确保稳定进步
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>修行频率</Text>
            <View style={styles.periodSelector}>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  targetPeriod === 'daily' && styles.selectedPeriodButton
                ]}
                onPress={() => setTargetPeriod('daily')}
              >
                <Text style={[
                  styles.periodButtonText,
                  targetPeriod === 'daily' && styles.selectedPeriodButtonText
                ]}>
                  每日
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  targetPeriod === 'weekly' && styles.selectedPeriodButton
                ]}
                onPress={() => setTargetPeriod('weekly')}
              >
                <Text style={[
                  styles.periodButtonText,
                  targetPeriod === 'weekly' && styles.selectedPeriodButtonText
                ]}>
                  每周
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {targetPeriod === 'daily' ? '每日' : '每周'}目标座数
            </Text>
            <TextInput
              style={styles.input}
              value={dailyTarget}
              onChangeText={setDailyTarget}
              keyboardType="numeric"
              placeholder={targetPeriod === 'daily' ? '例如：1' : '例如：4'}
            />
          </View>
        </>
      )}
    </View>
  );

  const renderCountBasedConfig = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>设置目标</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>总目标数量</Text>
        <TextInput
          style={styles.input}
          value={targetCount}
          onChangeText={setTargetCount}
          keyboardType="numeric"
          placeholder="例如：100000"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>每日目标（可选）</Text>
        <TextInput
          style={styles.input}
          value={dailyTarget}
          onChangeText={setDailyTarget}
          keyboardType="numeric"
          placeholder="例如：1000"
        />
      </View>
    </View>
  );

  const renderDurationConfig = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>时间规划</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>持续时间（天）</Text>
        <TextInput
          style={styles.input}
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
          placeholder="例如：60"
        />
      </View>
    </View>
  );

  const renderSummary = () => (
    <View style={styles.summarySection}>
      <Text style={styles.summaryTitle}>📝 智能总结</Text>

      <View style={styles.summaryContent}>
        {practiceType === 'time' ? (
          goalType === 'topic_progress' ? (
            <View>
              <Text style={styles.summaryText}>
                您选择了法门进度模式，将逐步完成92个观修法门。
              </Text>
              <Text style={styles.summaryText}>
                • 总共92个法门需要完成
              </Text>
              <Text style={styles.summaryText}>
                • 每周最少完成 {dailyTarget || 1} 个法门
              </Text>
              <Text style={styles.summaryText}>
                • 计划持续 {calculatedSummary.totalDays} 天（约 {calculatedSummary.totalWeeks} 周）
              </Text>
              <Text style={styles.summaryHighlight}>
                👉 预计需要约 {Math.ceil(92 / (parseInt(dailyTarget) || 1))} 周完成所有法门
              </Text>
            </View>
          ) : (
            <View>
              <Text style={styles.summaryText}>
                您需要在 {calculatedSummary.totalDays} 天内完成观修。
              </Text>
              <Text style={styles.summaryText}>
                • {targetPeriod === 'daily' ? '每日' : '每周'}目标：{dailyTarget || 0} 座
              </Text>
              <Text style={styles.summaryText}>
                • 计划持续：{calculatedSummary.totalDays} 天（约 {calculatedSummary.totalWeeks} 周）
              </Text>
              <Text style={styles.summaryHighlight}>
                👉 预计总共完成约 {calculatedSummary.projectedTotal || 0} 座观修
              </Text>
            </View>
          )
        ) : (
          <View>
            <Text style={styles.summaryText}>
              您需要在 {calculatedSummary.totalDays} 天内完成修行。
            </Text>
            {calculatedSummary.suggestedDaily && (
              <Text style={styles.summaryHighlight}>
                👉 建议每日修行约 {calculatedSummary.suggestedDaily} {practiceUnit}
              </Text>
            )}
            {calculatedSummary.projectedTotal && (
              <Text style={styles.summaryHighlight}>
                👉 预计总共完成 {calculatedSummary.projectedTotal} {practiceUnit}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: `配置"${practiceName}"`,
        headerShown: true 
      }} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.practiceTitle}>{practiceName}</Text>
          <Text style={styles.practiceType}>
            {practiceType === 'count' ? '计数类' : '计时类'} • {practiceUnit}
          </Text>
        </View>

        {practiceType === 'time' ? renderTimeBasedConfig() : renderCountBasedConfig()}
        {renderDurationConfig()}
        {renderSummary()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>取消</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>确认添加</Text>
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
    marginBottom: 24,
  },
  practiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  practiceType: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  goalTypeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  goalTypeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  selectedGoalTypeButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  goalTypeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  selectedGoalTypeButtonText: {
    color: 'white',
  },
  goalTypeDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
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
  summarySection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  summaryContent: {
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  summaryHighlight: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    lineHeight: 20,
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
});