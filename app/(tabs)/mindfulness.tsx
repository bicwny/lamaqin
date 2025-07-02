import React, { useState, useEffect } from 'react';
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
  const [todayStats, setTodayStats] = useState<DayStats>({ good: 12, bad: 2, date: new Date().toISOString().split('T')[0] });
  const [weeklyData, setWeeklyData] = useState<DayStats[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Mock weekly data
    const mockWeekly = [
      { good: 12, bad: 2, date: '2025-01-27' }, // 今天
      { good: 15, bad: 3, date: '2025-01-26' }, // 周六
      { good: 18, bad: 2, date: '2025-01-25' }, // 周五
      { good: 11, bad: 4, date: '2025-01-24' }, // 周四
      { good: 13, bad: 3, date: '2025-01-23' }, // 周三
      { good: 16, bad: 1, date: '2025-01-22' }, // 周二
      { good: 14, bad: 5, date: '2025-01-21' }, // 周一
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
});