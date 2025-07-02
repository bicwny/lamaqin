
import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';

interface StatsData {
  study: {
    totalCourses: number;
    completedLessons: number;
    currentStreak: number;
    weeklyProgress: number[];
  };
  practice: {
    totalSessions: number;
    weeklyCount: number;
    averageDaily: number;
    topPractices: Array<{ name: string; count: number; unit: string }>;
  };
  mindfulness: {
    goodDaysPercent: number;
    gratitudeTotal: number;
    compassionStreak: number;
    weeklyMood: number[];
  };
  overall: {
    totalDays: number;
    activeStreak: number;
    completionRate: number;
    monthlyTrend: 'improving' | 'stable' | 'declining';
  };
}

export default function StatsScreen() {
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatsData();
  }, [selectedPeriod]);

  const loadStatsData = async () => {
    try {
      // Mock data - replace with actual database queries
      setStatsData({
        study: {
          totalCourses: 5,
          completedLessons: 24,
          currentStreak: 7,
          weeklyProgress: [2, 3, 1, 4, 2, 3, 5]
        },
        practice: {
          totalSessions: 156,
          weeklyCount: 18,
          averageDaily: 2.6,
          topPractices: [
            { name: '六字大明咒', count: 8640, unit: '次' },
            { name: '禅修', count: 420, unit: '分钟' },
            { name: '念佛', count: 3240, unit: '次' },
            { name: '读经', count: 180, unit: '分钟' }
          ]
        },
        mindfulness: {
          goodDaysPercent: 78,
          gratitudeTotal: 156,
          compassionStreak: 12,
          weeklyMood: [80, 60, 90, 70, 85, 75, 65]
        },
        overall: {
          totalDays: 45,
          activeStreak: 12,
          completionRate: 85,
          monthlyTrend: 'improving'
        }
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return Colors.success;
      case 'stable': return Colors.warning;
      case 'declining': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'improving': return '上升';
      case 'stable': return '稳定';
      case 'declining': return '下降';
      default: return '未知';
    }
  };

  if (loading || !statsData) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading statistics...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            📊 修行统计
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Progress Analytics & Insights
          </ThemedText>
        </ThemedView>

        {/* Period Selection */}
        <ThemedView style={styles.section}>
          <View style={styles.periodSelector}>
            {(['week', 'month', 'year'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  { backgroundColor: selectedPeriod === period ? Colors.stats : Colors.surface }
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[
                  styles.periodButtonText,
                  { color: selectedPeriod === period ? Colors.surface : Colors.text }
                ]}>
                  {period === 'week' ? '本周' : period === 'month' ? '本月' : '本年'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>

        {/* Overall Summary */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            总体概览
          </ThemedText>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <ThemedText style={styles.summaryNumber}>{statsData.overall.totalDays}</ThemedText>
              <ThemedText style={styles.summaryLabel}>修行天数</ThemedText>
            </View>
            
            <View style={styles.summaryCard}>
              <ThemedText style={styles.summaryNumber}>{statsData.overall.activeStreak}</ThemedText>
              <ThemedText style={styles.summaryLabel}>连续天数</ThemedText>
            </View>
            
            <View style={styles.summaryCard}>
              <ThemedText style={styles.summaryNumber}>{statsData.overall.completionRate}%</ThemedText>
              <ThemedText style={styles.summaryLabel}>完成率</ThemedText>
            </View>
            
            <View style={styles.summaryCard}>
              <View style={styles.trendContainer}>
                <ThemedText style={[styles.summaryNumber, { color: getTrendColor(statsData.overall.monthlyTrend) }]}>
                  {getTrendText(statsData.overall.monthlyTrend)}
                </ThemedText>
              </View>
              <ThemedText style={styles.summaryLabel}>月度趋势</ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Study Stats */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            📚 学习统计
          </ThemedText>
          
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <ThemedText style={styles.statsLabel}>课程总数:</ThemedText>
              <ThemedText style={styles.statsValue}>{statsData.study.totalCourses} 门</ThemedText>
            </View>
            
            <View style={styles.statsRow}>
              <ThemedText style={styles.statsLabel}>已听课时:</ThemedText>
              <ThemedText style={styles.statsValue}>{statsData.study.completedLessons} 节</ThemedText>
            </View>
            
            <View style={styles.statsRow}>
              <ThemedText style={styles.statsLabel}>学习连击:</ThemedText>
              <ThemedText style={[styles.statsValue, { color: Colors.success }]}>
                {statsData.study.currentStreak} 天
              </ThemedText>
            </View>

            <View style={styles.chartContainer}>
              <ThemedText style={styles.chartTitle}>本周学习进度</ThemedText>
              <View style={styles.chartBars}>
                {statsData.study.weeklyProgress.map((progress, index) => (
                  <View key={index} style={styles.chartBar}>
                    <View 
                      style={[
                        styles.chartFill,
                        { 
                          height: `${(progress / 5) * 100}%`,
                          backgroundColor: Colors.study
                        }
                      ]} 
                    />
                    <ThemedText style={styles.chartLabel}>
                      {['一', '二', '三', '四', '五', '六', '日'][index]}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ThemedView>

        {/* Practice Stats */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            📿 修行统计
          </ThemedText>
          
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <ThemedText style={styles.statsLabel}>总修行次数:</ThemedText>
              <ThemedText style={styles.statsValue}>{statsData.practice.totalSessions} 次</ThemedText>
            </View>
            
            <View style={styles.statsRow}>
              <ThemedText style={styles.statsLabel}>本周修行:</ThemedText>
              <ThemedText style={styles.statsValue}>{statsData.practice.weeklyCount} 次</ThemedText>
            </View>
            
            <View style={styles.statsRow}>
              <ThemedText style={styles.statsLabel}>日均修行:</ThemedText>
              <ThemedText style={styles.statsValue}>{statsData.practice.averageDaily} 次</ThemedText>
            </View>

            <ThemedText style={styles.chartTitle}>主要修行项目</ThemedText>
            {statsData.practice.topPractices.map((practice, index) => (
              <View key={index} style={styles.practiceItem}>
                <View style={styles.practiceInfo}>
                  <ThemedText style={styles.practiceName}>{practice.name}</ThemedText>
                  <ThemedText style={styles.practiceCount}>
                    {practice.count.toLocaleString()} {practice.unit}
                  </ThemedText>
                </View>
                <View style={styles.practiceRank}>
                  <Text style={styles.practiceRankText}>#{index + 1}</Text>
                </View>
              </View>
            ))}
          </View>
        </ThemedView>

        {/* Mindfulness Stats */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            💝 心性统计
          </ThemedText>
          
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <ThemedText style={styles.statsLabel}>心境良好率:</ThemedText>
              <ThemedText style={[styles.statsValue, { color: Colors.success }]}>
                {statsData.mindfulness.goodDaysPercent}%
              </ThemedText>
            </View>
            
            <View style={styles.statsRow}>
              <ThemedText style={styles.statsLabel}>感恩总数:</ThemedText>
              <ThemedText style={styles.statsValue}>{statsData.mindfulness.gratitudeTotal} 件</ThemedText>
            </View>
            
            <View style={styles.statsRow}>
              <ThemedText style={styles.statsLabel}>慈悲连击:</ThemedText>
              <ThemedText style={[styles.statsValue, { color: Colors.mindfulness }]}>
                {statsData.mindfulness.compassionStreak} 天
              </ThemedText>
            </View>

            <View style={styles.chartContainer}>
              <ThemedText style={styles.chartTitle}>本周心境趋势</ThemedText>
              <View style={styles.chartBars}>
                {statsData.mindfulness.weeklyMood.map((mood, index) => (
                  <View key={index} style={styles.chartBar}>
                    <View 
                      style={[
                        styles.chartFill,
                        { 
                          height: `${mood}%`,
                          backgroundColor: mood >= 70 ? Colors.success : mood >= 50 ? Colors.warning : Colors.error
                        }
                      ]} 
                    />
                    <ThemedText style={styles.chartLabel}>
                      {['一', '二', '三', '四', '五', '六', '日'][index]}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
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
    backgroundColor: Colors.stats,
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  periodButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.stats,
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  trendContainer: {
    alignItems: 'center',
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
    color: Colors.textSecondary,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  chartContainer: {
    marginTop: 15,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.text,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 80,
    alignItems: 'flex-end',
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  chartFill: {
    width: '80%',
    borderRadius: 2,
    marginBottom: 5,
  },
  chartLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  practiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  practiceInfo: {
    flex: 1,
  },
  practiceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  practiceCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  practiceRank: {
    backgroundColor: Colors.practice,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  practiceRankText: {
    color: Colors.surface,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
