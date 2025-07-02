import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { practiceService, dailyRecordService } from '@/lib/database';

interface Practice {
  id: string;
  name: string;
  type: 'count' | 'time';
  unit: '次' | '分钟';
}

interface UserPracticeProject {
  id: string;
  practice_id: string;
  target_count: number;
  current_count: number;
  daily_target: number;
  practice?: Practice;
}

interface DailyRecord {
  practice_project_id: string;
  count: number;
}

export default function PracticeScreen() {
  const { user } = useAuth();
  const [practiceProjects, setPracticeProjects] = useState<UserPracticeProject[]>([]);
  const [todayRecords, setTodayRecords] = useState<Record<string, number>>({});
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPracticeData();
  }, [user]);

  const loadPracticeData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Loading practice data for user:', user.id);
      
      const projects = await practiceService.getUserPracticeProjects(user.id);
      const today = new Date().toISOString().split('T')[0];
      const records = await dailyRecordService.getTodayRecords(user.id, today);

      console.log('📋 Loaded practice projects:', projects.length);
      console.log('📅 Loaded today records:', records.length);

      setPracticeProjects(projects);

      // Organize today's records by practice project
      const recordsMap: Record<string, number> = {};
      records.forEach(record => {
        recordsMap[record.practice_project_id] = 
          (recordsMap[record.practice_project_id] || 0) + record.count;
      });
      setTodayRecords(recordsMap);

    } catch (error) {
      console.error('❌ Error loading practice data:', error);
      // Don't set any fallback data - show empty state instead
      setPracticeProjects([]);
      setTodayRecords({});
    } finally {
      setLoading(false);
    }
  };

  const recordPractice = async (projectId: string, count: number) => {
    if (!user || count <= 0) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      await dailyRecordService.recordPractice({
        user_id: user.id,
        practice_project_id: projectId,
        record_date: today,
        count: count,
        notes: ''
      });

      Alert.alert('成功', '修行记录已保存');
      loadPracticeData(); // Refresh data
      setInputValues(prev => ({ ...prev, [projectId]: '' }));

    } catch (error) {
      console.error('Error recording practice:', error);
      Alert.alert('错误', '保存失败，请重试');
    }
  };

  const quickAdd = (projectId: string, amount: number) => {
    const currentToday = todayRecords[projectId] || 0;
    recordPractice(projectId, amount);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📿 修行功课</Text>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📿 修行功课</Text>

      {practiceProjects.map(project => {
        const todayCount = todayRecords[project.id] || 0;
        const progressPercent = Math.min((todayCount / project.daily_target) * 100, 100);
        const isCompleted = todayCount >= project.daily_target;

        return (
          <View key={project.id} style={styles.practiceCard}>
            <View style={styles.practiceHeader}>
              <Text style={styles.practiceName}>
                {project.practice?.name || '修行项目'}
              </Text>
              <Text style={[styles.status, isCompleted && styles.completed]}>
                {isCompleted ? '✅ 已完成' : '⏳ 进行中'}
              </Text>
            </View>

            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                今日: {todayCount} / {project.daily_target} {project.practice?.unit}
              </Text>
              <Text style={styles.totalProgress}>
                总计: {project.current_count} / {project.target_count} {project.practice?.unit}
              </Text>
            </View>

            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progressPercent}%` },
                  isCompleted && styles.completedFill
                ]} 
              />
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.countInput}
                placeholder="数量"
                value={inputValues[project.id] || ''}
                onChangeText={(text) => setInputValues(prev => ({ ...prev, [project.id]: text }))}
                keyboardType="numeric"
              />
              <TouchableOpacity 
                style={styles.recordButton}
                onPress={() => {
                  const count = parseInt(inputValues[project.id] || '0');
                  if (count > 0) recordPractice(project.id, count);
                }}
              >
                <Text style={styles.buttonText}>记录</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickButtons}>
              <TouchableOpacity 
                style={styles.quickButton}
                onPress={() => quickAdd(project.id, 1)}
              >
                <Text style={styles.quickButtonText}>+1</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickButton}
                onPress={() => quickAdd(project.id, 10)}
              >
                <Text style={styles.quickButtonText}>+10</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickButton}
                onPress={() => quickAdd(project.id, 100)}
              >
                <Text style={styles.quickButtonText}>+100</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {practiceProjects.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>还没有设置修行功课</Text>
          <Text style={styles.emptySubtext}>请先添加修行项目</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  practiceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  practiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  practiceName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '500',
  },
  completed: {
    color: '#34C759',
  },
  progressInfo: {
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    marginBottom: 4,
  },
  totalProgress: {
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5E7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  completedFill: {
    backgroundColor: '#34C759',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  countInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  recordButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  quickButtonText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});