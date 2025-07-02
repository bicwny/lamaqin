
import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { getUserPracticeProjects, getTodayRecords, createDailyRecord } from '@/lib/database';

interface PracticeProject {
  id: string;
  practice_id: string;
  target_count: number;
  current_count: number;
  daily_target: number;
  status: 'not_started' | 'active' | 'completed';
  practices: {
    name: string;
    type: 'count' | 'time';
    unit: '次' | '分钟';
  };
  themes?: {
    name: string;
    type: string;
  };
}

interface TodayRecord {
  id: string;
  count: number;
  practice_project_id: string;
}

export default function PracticeScreen() {
  const [projects, setProjects] = useState<PracticeProject[]>([]);
  const [todayRecords, setTodayRecords] = useState<TodayRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mock user ID - in real app, get from auth
  const userId = 'user-123';
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // For now, using mock data since Supabase isn't connected
      setProjects([
        {
          id: '1',
          practice_id: 'mantra-1',
          target_count: 1000,
          current_count: 250,
          daily_target: 108,
          status: 'active',
          practices: {
            name: '六字大明咒',
            type: 'count',
            unit: '次'
          },
          themes: {
            name: '基础修行',
            type: 'foundation'
          }
        },
        {
          id: '2',
          practice_id: 'meditation-1',
          target_count: 30,
          current_count: 12,
          daily_target: 1,
          status: 'active',
          practices: {
            name: '禅修',
            type: 'time',
            unit: '分钟'
          }
        }
      ]);
      
      setTodayRecords([
        {
          id: '1',
          count: 54,
          practice_project_id: '1'
        }
      ]);
    } catch (error) {
      console.error('Error loading practice data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTodayCount = (projectId: string) => {
    const record = todayRecords.find(r => r.practice_project_id === projectId);
    return record ? record.count : 0;
  };

  const addPracticeCount = async (projectId: string, currentCount: number, increment: number) => {
    try {
      const newCount = currentCount + increment;
      
      // Update local state immediately for better UX
      setTodayRecords(prev => {
        const existing = prev.find(r => r.practice_project_id === projectId);
        if (existing) {
          return prev.map(r => 
            r.practice_project_id === projectId 
              ? { ...r, count: newCount }
              : r
          );
        } else {
          return [...prev, {
            id: `temp-${Date.now()}`,
            count: newCount,
            practice_project_id: projectId
          }];
        }
      });

      // In real app, save to database here
      // await createDailyRecord({
      //   user_id: userId,
      //   practice_project_id: projectId,
      //   record_date: today,
      //   count: newCount
      // });
      
    } catch (error) {
      console.error('Error adding practice count:', error);
      Alert.alert('错误', '记录失败，请重试');
    }
  };

  const getProgressPercent = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading practices...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            📿 修行记录
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Buddhist Practice Tracking
          </ThemedText>
        </ThemedView>

        {/* Today's Summary */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            今日修行
          </ThemedText>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>已完成项目:</ThemedText>
              <ThemedText style={styles.summaryValue}>
                {todayRecords.length} / {projects.length}
              </ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>今日状态:</ThemedText>
              <ThemedText style={[styles.summaryValue, { color: Colors.success }]}>
                修行中
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Active Practice Projects */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            我的修行项目
          </ThemedText>
          
          {projects.map((project) => {
            const todayCount = getTodayCount(project.id);
            const dailyProgress = getProgressPercent(todayCount, project.daily_target);
            const totalProgress = getProgressPercent(project.current_count + todayCount, project.target_count);
            
            return (
              <View key={project.id} style={styles.practiceCard}>
                <View style={styles.practiceHeader}>
                  <ThemedText type="defaultSemiBold" style={styles.practiceName}>
                    {project.practices.name}
                  </ThemedText>
                  {project.themes && (
                    <View style={styles.themeTag}>
                      <Text style={styles.themeText}>{project.themes.name}</Text>
                    </View>
                  )}
                </View>
                
                {/* Daily Progress */}
                <View style={styles.progressSection}>
                  <ThemedText style={styles.progressLabel}>
                    今日: {todayCount} / {project.daily_target} {project.practices.unit}
                  </ThemedText>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${dailyProgress}%`, backgroundColor: Colors.practice }
                      ]} 
                    />
                  </View>
                </View>

                {/* Total Progress */}
                <View style={styles.progressSection}>
                  <ThemedText style={styles.progressLabel}>
                    总计: {project.current_count + todayCount} / {project.target_count} {project.practices.unit}
                  </ThemedText>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${totalProgress}%`, backgroundColor: Colors.success }
                      ]} 
                    />
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={styles.countButton}
                    onPress={() => addPracticeCount(project.id, todayCount, 1)}
                  >
                    <Text style={styles.countButtonText}>+1</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.countButton}
                    onPress={() => addPracticeCount(project.id, todayCount, 10)}
                  >
                    <Text style={styles.countButtonText}>+10</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.countButton}
                    onPress={() => addPracticeCount(project.id, todayCount, 108)}
                  >
                    <Text style={styles.countButtonText}>+108</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ThemedView>

        {/* Quick Actions */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            快速操作
          </ThemedText>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.gridButton}>
              <Text style={styles.gridButtonText}>添加修行</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridButton}>
              <Text style={styles.gridButtonText}>计时器</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridButton}>
              <Text style={styles.gridButtonText}>修行主题</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridButton}>
              <Text style={styles.gridButtonText}>历史记录</Text>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.practice,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.surface,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.surface,
    opacity: 0.9,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: Colors.text,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  practiceCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: Colors.practice,
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
    marginBottom: 15,
  },
  practiceName: {
    fontSize: 18,
    color: Colors.text,
    flex: 1,
  },
  themeTag: {
    backgroundColor: Colors.practice,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  themeText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressSection: {
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  countButton: {
    backgroundColor: Colors.practice,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  countButtonText: {
    color: Colors.surface,
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridButton: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 10,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.practice,
  },
  gridButtonText: {
    color: Colors.practice,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
