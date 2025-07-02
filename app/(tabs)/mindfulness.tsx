
<old_str>import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';

interface MindState {
  id: string;
  date: string;
  morning_state?: 'good' | 'bad';
  evening_state?: 'good' | 'bad';
  gratitude_count: number;
  compassion_practice: boolean;
  notes?: string;
}

interface HeartPractice {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly';
  icon: string;
}

export default function MindfulnessScreen() {
  const [todayState, setTodayState] = useState<MindState | null>(null);
  const [weeklyProgress, setWeeklyProgress] = useState<number[]>([]);
  const [heartPractices, setHeartPractices] = useState<HeartPractice[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadMindfulnessData();
  }, []);

  const loadMindfulnessData = async () => {
    try {
      // Mock data - replace with actual database calls
      setTodayState({
        id: '1',
        date: today,
        morning_state: 'good',
        evening_state: null,
        gratitude_count: 3,
        compassion_practice: true,
        notes: ''
      });

      // Weekly progress (7 days, percentage of good states)
      setWeeklyProgress([80, 60, 90, 70, 85, 75, 65]);

      setHeartPractices([
        {
          id: '1',
          name: '感恩练习',
          description: '每日记录三件感恩的事',
          type: 'daily',
          icon: '🙏'
        },
        {
          id: '2',
          name: '慈悲观修',
          description: '培养对自他的慈悲心',
          type: 'daily',
          icon: '💖'
        },
        {
          id: '3',
          name: '菩提心训练',
          description: '菩提心的生起次第',
          type: 'weekly',
          icon: '🧠'
        }
      ]);
    } catch (error) {
      console.error('Error loading mindfulness data:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordMindState = (type: 'good' | 'bad') => {
    // In real app, save to database
    console.log(`Recording ${type} mind state`);
    
    // Update local state for immediate feedback
    if (todayState) {
      setTodayState({
        ...todayState,
        evening_state: type
      });
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>加载中...</ThemedText>
      </ThemedView>
    );
  }

  const goodCount = 8; // Mock data
  const badCount = 3; // Mock data
  const goodPercentage = Math.round((goodCount / (goodCount + badCount)) * 100);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            💝 心性观察
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Mindfulness & Heart Cultivation
          </ThemedText>
        </ThemedView>

        {/* Quick Record */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            快速记录心念
          </ThemedText>
          
          <View style={styles.quickButtons}>
            <TouchableOpacity 
              style={[styles.mindButton, styles.goodMindButton]}
              onPress={() => recordMindState('good')}
            >
              <Text style={styles.mindButtonText}>🤍 善心</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.mindButton, styles.badMindButton]}
              onPress={() => recordMindState('bad')}
            >
              <Text style={styles.mindButtonText}>🖤 恶心</Text>
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Today's Stats */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            今日善恶心统计
          </ThemedText>
          
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <ThemedText style={styles.statsLabel}>🤍 善心：{goodCount}次</ThemedText>
              <ThemedText style={styles.statsLabel}>🖤 恶心：{badCount}次</ThemedText>
            </View>
            <ThemedText style={styles.percentageText}>
              善心比例：{goodPercentage}% ↗️
            </ThemedText>
            
            <TouchableOpacity style={styles.statsButton}>
              <Text style={styles.statsButtonText}>统计</Text>
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Heart Practices */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            心性修持
          </ThemedText>
          
          {heartPractices.map((practice) => (
            <View key={practice.id} style={styles.practiceCard}>
              <View style={styles.practiceHeader}>
                <Text style={styles.practiceIcon}>{practice.icon}</Text>
                <View style={styles.practiceInfo}>
                  <ThemedText style={styles.practiceName}>{practice.name}</ThemedText>
                  <ThemedText style={styles.practiceDesc}>{practice.description}</ThemedText>
                </View>
              </View>
              <TouchableOpacity style={styles.practiceButton}>
                <Text style={styles.practiceButtonText}>开始修持</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ThemedView>

        {/* Weekly Visualization */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            本周心境趋势
          </ThemedText>
          
          <View style={styles.weeklyChart}>
            {weeklyProgress.map((percentage, index) => (
              <View key={index} style={styles.dayColumn}>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.goodBar, 
                      { height: `${percentage}%` }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.badBar, 
                      { height: `${100 - percentage}%` }
                    ]} 
                  />
                </View>
                <ThemedText style={styles.dayLabel}>
                  {['一', '二', '三', '四', '五', '六', '日'][index]}
                </ThemedText>
              </View>
            ))}
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
    backgroundColor: Colors.mindfulness,
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
  quickButtons: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'center',
  },
  mindButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  goodMindButton: {
    backgroundColor: Colors.success,
  },
  badMindButton: {
    backgroundColor: Colors.error,
  },
  mindButtonText: {
    color: Colors.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statsLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  percentageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.success,
    textAlign: 'center',
    marginBottom: 15,
  },
  statsButton: {
    backgroundColor: Colors.mindfulness,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'center',
  },
  statsButtonText: {
    color: Colors.surface,
    fontWeight: 'bold',
    fontSize: 14,
  },
  practiceCard: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.mindfulness,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  practiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  practiceIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  practiceInfo: {
    flex: 1,
  },
  practiceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  practiceDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  practiceButton: {
    backgroundColor: Colors.mindfulness,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  practiceButtonText: {
    color: Colors.surface,
    fontWeight: 'bold',
    fontSize: 14,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 150,
    alignItems: 'flex-end',
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    width: 20,
    height: 100,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 5,
  },
  goodBar: {
    backgroundColor: Colors.success,
    width: '100%',
  },
  badBar: {
    backgroundColor: Colors.error,
    width: '100%',
  },
  dayLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});</old_str>
<new_str>import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';

interface DayStats {
  good: number;
  bad: number;
  date: string;
}

export default function MindfulnessScreen() {
  const [todayStats, setTodayStats] = useState<DayStats>({ good: 8, bad: 3, date: new Date().toISOString().split('T')[0] });
  const [weeklyData, setWeeklyData] = useState<DayStats[]>([]);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Mock weekly data
    const mockWeekly = [
      { good: 8, bad: 3, date: '2025-01-27' }, // 今天
      { good: 7, bad: 2, date: '2025-01-26' }, // 周六
      { good: 9, bad: 2, date: '2025-01-25' }, // 周五
      { good: 6, bad: 2, date: '2025-01-24' }, // 周四
      { good: 6, bad: 3, date: '2025-01-23' }, // 周三
      { good: 8, bad: 2, date: '2025-01-22' }, // 周二
      { good: 7, bad: 3, date: '2025-01-21' }, // 周一
    ];
    setWeeklyData(mockWeekly);
  };

  const recordMind = (type: 'good' | 'bad') => {
    setTodayStats(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
    
    // Update weekly data
    setWeeklyData(prev => prev.map(day => 
      day.date === todayStats.date 
        ? { ...day, [type]: day[type] + 1 }
        : day
    ));
  };

  const getGoodPercentage = (day: DayStats) => {
    const total = day.good + day.bad;
    return total > 0 ? Math.round((day.good / total) * 100) : 0;
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return '↗️';
    if (current < previous) return '↘️';
    return '';
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            👁 观心记录
          </ThemedText>
        </ThemedView>

        {/* Quick Record */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            快速记录：
          </ThemedText>
          
          <View style={styles.quickButtons}>
            <TouchableOpacity 
              style={[styles.mindButton, styles.goodMindButton]}
              onPress={() => recordMind('good')}
            >
              <Text style={styles.mindButtonText}>🤍 善心</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.mindButton, styles.badMindButton]}
              onPress={() => recordMind('bad')}
            >
              <Text style={styles.mindButtonText}>🖤 恶心</Text>
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Today's Stats */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            今日善恶心统计：
          </ThemedText>
          
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <ThemedText style={styles.statsLabel}>🤍 善心：{todayStats.good}次</ThemedText>
              <ThemedText style={styles.statsLabel}>🖤 恶心：{todayStats.bad}次</ThemedText>
            </View>
            
            <ThemedText style={styles.percentageText}>
              善心比例：{getGoodPercentage(todayStats)}% {getTrendIcon(getGoodPercentage(todayStats), weeklyData[1] ? getGoodPercentage(weeklyData[1]) : 0)}
            </ThemedText>
            
            <TouchableOpacity 
              style={styles.statsButton}
              onPress={() => setShowStatsModal(true)}
            >
              <Text style={styles.statsButtonText}>统计</Text>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ScrollView>

      {/* Stats Modal */}
      <Modal visible={showStatsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              👁 观心统计
            </ThemedText>
            
            <ThemedText style={styles.modalSubtitle}>
              📊 过去7天：（今天在最上面）
            </ThemedText>
            
            <ScrollView style={styles.weeklyList}>
              {weeklyData.map((day, index) => {
                const percentage = getGoodPercentage(day);
                const dayName = index === 0 ? '今天' : ['周六', '周五', '周四', '周三', '周二', '周一'][index - 1];
                const trendIcon = index < weeklyData.length - 1 ? getTrendIcon(percentage, getGoodPercentage(weeklyData[index + 1])) : '';
                
                return (
                  <View key={day.date} style={styles.weeklyItem}>
                    <ThemedText style={styles.weeklyText}>
                      {dayName}：善{percentage}% 恶{100 - percentage}% {trendIcon}
                    </ThemedText>
                  </View>
                );
              })}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowStatsModal(false)}
              >
                <Text style={styles.cancelButtonText}>返回</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  setShowStatsModal(false);
                  setShowVisualization(true);
                }}
              >
                <Text style={styles.modalButtonText}>visualization</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Visualization Modal */}
      <Modal visible={showVisualization} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              📈 观心趋势可视化
            </ThemedText>
            
            <ThemedText style={styles.modalSubtitle}>
              📊 过去7天视觉图表：
            </ThemedText>
            
            <ScrollView style={styles.visualizationContainer}>
              {weeklyData.map((day, index) => {
                const goodPercentage = getGoodPercentage(day);
                const dayName = index === 0 ? '今天' : ['周六', '周五', '周四', '周三', '周二', '周一'][index - 1];
                const goodCount = Math.round((goodPercentage / 100) * 10);
                const badCount = 10 - goodCount;
                
                return (
                  <View key={day.date} style={styles.visualizationRow}>
                    <View style={styles.dayLabelContainer}>
                      <ThemedText style={styles.dayLabelViz}>{dayName}：</ThemedText>
                    </View>
                    <View style={styles.heartsContainer}>
                      {'🤍'.repeat(goodCount)}{'🖤'.repeat(badCount)}
                    </View>
                    <ThemedText style={styles.percentageLabel}>
                      ({goodPercentage}%善心)
                    </ThemedText>
                  </View>
                );
              })}
            </ScrollView>
            
            <View style={styles.monthlyStats}>
              <ThemedText style={styles.monthlyTitle}>📈 月度统计：</ThemedText>
              <ThemedText style={styles.monthlyText}>本月平均善心：75%</ThemedText>
              <ThemedText style={styles.monthlyText}>连续记录天数：30天 🔥</ThemedText>
              <ThemedText style={styles.monthlyText}>最佳表现：周五 82%</ThemedText>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowVisualization(false)}
              >
                <Text style={styles.cancelButtonText}>返回</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton}>
                <Text style={styles.modalButtonText}>本月视图</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: Colors.mindfulness,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.surface,
    marginBottom: 5,
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
  quickButtons: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'center',
    marginBottom: 20,
  },
  mindButton: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 25,
    minWidth: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  goodMindButton: {
    backgroundColor: Colors.success,
  },
  badMindButton: {
    backgroundColor: Colors.error,
  },
  mindButtonText: {
    color: Colors.surface,
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statsLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: 'bold',
  },
  percentageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.success,
    textAlign: 'center',
    marginBottom: 15,
  },
  statsButton: {
    backgroundColor: Colors.mindfulness,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  statsButtonText: {
    color: Colors.surface,
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  weeklyList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  weeklyItem: {
    padding: 10,
    backgroundColor: Colors.background,
    marginBottom: 5,
    borderRadius: 6,
  },
  weeklyText: {
    fontSize: 16,
    color: Colors.text,
  },
  visualizationContainer: {
    maxHeight: 300,
    marginBottom: 20,
  },
  visualizationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
  },
  dayLabelContainer: {
    width: 50,
  },
  dayLabelViz: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: 'bold',
  },
  heartsContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  percentageLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    width: 80,
  },
  monthlyStats: {
    backgroundColor: Colors.background,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  monthlyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  monthlyText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 5,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    backgroundColor: Colors.mindfulness,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.textSecondary,
  },
  modalButtonText: {
    color: Colors.surface,
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontWeight: 'bold',
    fontSize: 16,
  },
});</new_str>
