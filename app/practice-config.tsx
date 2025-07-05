import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function PracticeConfigScreen() {
  const { practiceId, practiceName, practiceType } = useLocalSearchParams();
  const { user } = useAuth();

  // Configuration mode: 法门进度 or 固定时长
  const [configMode, setConfigMode] = useState<'topic_progress' | 'fixed_duration'>('topic_progress');

  // Weekly target (unified for both modes)
  const [weeklyTarget, setWeeklyTarget] = useState<string>('4');

  // Time planning
  const [startDate, setStartDate] = useState(new Date());
  const [durationMode, setDurationMode] = useState<'30days' | '60days' | '100days' | '1year' | 'custom'>('100days');
  const [customEndDate, setCustomEndDate] = useState(new Date(Date.now() + 100 * 24 * 60 * 60 * 1000));
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Calculations
  const [suggestions, setSuggestions] = useState({
    totalWeeks: 0,
    totalSessions: 0,
    description: ''
  });

  const [loading, setLoading] = useState(false);

  const calculateSuggestions = () => {
    const weekly = parseInt(weeklyTarget) || 0;
    const endDate = durationMode === 'custom' ? customEndDate : getEndDateFromDuration();
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const weeks = Math.ceil(days / 7);
    const totalSessions = weekly * weeks;

    let description = '';
    if (configMode === 'topic_progress') {
      if (practiceType === 'time') {
        description = `您需要在约 ${weeks} 周内完成 92 个观修主题，每个主题每周至少 ${weekly} 座，总计约 ${totalSessions} 座观修。`;
      } else {
        description = `您需要在约 ${weeks} 周内完成所有计数类修法，每周 ${weekly} 次，总计 ${totalSessions} 次。`;
      }
    } else {
      if (practiceType === 'time') {
        description = `您将在 ${weeks} 周内每周完成 ${weekly} 座观修，总计 ${totalSessions} 座。`;
      } else {
        description = `您将在 ${weeks} 周内每周完成 ${weekly} 次修法，总计 ${totalSessions} 次。`;
      }
    }

    setSuggestions({
      totalWeeks: weeks,
      totalSessions,
      description
    });
  };

  useEffect(() => {
    calculateSuggestions();
  }, [weeklyTarget, startDate, durationMode, customEndDate, configMode]);

  const getEndDateFromDuration = () => {
    const start = startDate;
    switch (durationMode) {
      case '30days':
        return new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
      case '60days':
        return new Date(start.getTime() + 60 * 24 * 60 * 60 * 1000);
      case '100days':
        return new Date(start.getTime() + 100 * 24 * 60 * 60 * 1000);
      case '1year':
        return new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000);
      default:
        return customEndDate;
    }
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('错误', '用户未登录');
      return;
    }

    if (!weeklyTarget || parseInt(weeklyTarget) <= 0) {
      Alert.alert('错误', '请设置有效的周目标');
      return;
    }

    setLoading(true);
    try {
      const endDate = durationMode === 'custom' ? customEndDate : getEndDateFromDuration();
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const weeks = Math.ceil(days / 7);
      const totalTarget = parseInt(weeklyTarget) * weeks;

      const projectData = {
        user_id: user.id,
        practice_id: practiceId,
        target_count: totalTarget,
        daily_target: parseInt(weeklyTarget), // Store weekly target in daily_target field
        target_period: 'weekly',
        start_date: startDate.toISOString().split('T')[0],
        target_end_date: endDate.toISOString().split('T')[0],
        status: 'active',
        current_count: 0,
        goal_type: configMode,
      };

      const { error } = await supabase
        .from('user_practice_projects')
        .insert(projectData);

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>配置"{practiceName}"</Text>
        <Text style={styles.subtitle}>类型: {practiceType === 'time' ? '计时类' : '计数类'}</Text>
      </View>

      {/* 1. 目标设定方式 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. 您想如何设定目标？</Text>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              configMode === 'topic_progress' && styles.segmentButtonActive
            ]}
            onPress={() => setConfigMode('topic_progress')}
          >
            <Text style={[
              styles.segmentText,
              configMode === 'topic_progress' && styles.segmentTextActive
            ]}>
              法门进度
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              configMode === 'fixed_duration' && styles.segmentButtonActive
            ]}
            onPress={() => setConfigMode('fixed_duration')}
          >
            <Text style={[
              styles.segmentText,
              configMode === 'fixed_duration' && styles.segmentTextActive
            ]}>
              固定时长
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. 修行频率 - 统一为周目标 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. 修行频率</Text>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>每周目标：</Text>
          <TextInput
            style={styles.input}
            value={weeklyTarget}
            onChangeText={setWeeklyTarget}
            keyboardType="numeric"
            placeholder="4"
          />
          <Text style={styles.inputUnit}>
            {practiceType === 'time' ? '座' : '次'}
          </Text>
        </View>
      </View>

      {/* 3. 时间规划 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. 时间规划</Text>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>开始时间：</Text>
          <Text style={styles.dateText}>{startDate.toLocaleDateString()}</Text>
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>持续时间：</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={durationMode}
              style={styles.picker}
              onValueChange={(value) => setDurationMode(value)}
            >
              <Picker.Item label="30天" value="30days" />
              <Picker.Item label="60天" value="60days" />
              <Picker.Item label="100天" value="100days" />
              <Picker.Item label="1年" value="1year" />
              <Picker.Item label="自定义" value="custom" />
            </Picker>
          </View>
        </View>

        {durationMode === 'custom' && (
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>结束时间：</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowCustomDatePicker(true)}
            >
              <Text style={styles.dateText}>{customEndDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </View>
        )}

        {showCustomDatePicker && (
          <DateTimePicker
            value={customEndDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)}
            onChange={(event, selectedDate) => {
              setShowCustomDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setCustomEndDate(selectedDate);
              }
            }}
          />
        )}
      </View>

      {/* 4. 智能总结 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. 智能总结</Text>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>📝 根据您的设置：</Text>
          <Text style={styles.summaryText}>{suggestions.description}</Text>
          <Text style={styles.summaryHighlight}>
            👉 建议每周完成 {weeklyTarget} {practiceType === 'time' ? '座' : '次'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? '保存中...' : '确认添加项目'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
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
    marginBottom: 12,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: '#007AFF',
  },
  segmentText: {
    fontSize: 16,
    color: '#666',
  },
  segmentTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    minWidth: 80,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    minWidth: 80,
    textAlign: 'center',
    marginRight: 8,
  },
  inputUnit: {
    fontSize: 16,
    color: '#666',
  },
  dateText: {
    fontSize: 16,
    color: '#007AFF',
  },
  dateButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  picker: {
    height: 50,
  },
  summaryBox: {
    backgroundColor: '#f8f9ff',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  summaryHighlight: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
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