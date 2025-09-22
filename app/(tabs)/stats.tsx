
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/constants/DesignSystem';
import PageTemplate from '@/components/PageTemplate';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface StatsData {
  // Practice Overview
  totalPractices: number;
  activePractices: number;
  completedPractices: number;
  daysSinceFirstPractice: number;
  
  // This Week Summary
  weeklyRecords: number;
  weeklyMeditationMinutes: number;
  weeklyCountTotal: number;
  currentStreak: number;
  
  // Study Progress
  coursesEnrolled: number;
  lessonsCompleted: number;
  studyStreak: number;
  totalStudyHours: number;
  
  // Lifetime Stats
  totalMeditationSessions: number;
  totalMeditationHours: number;
  totalCounts: number;
  daysActive: number;
}

export default function StatsScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const statsData = await calculateStats(user.id);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async (userId: string): Promise<StatsData> => {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];

    // Practice Overview
    const { data: practices } = await supabase
      .from('user_practice_projects')
      .select('*')
      .eq('user_id', userId);

    const totalPractices = practices?.length || 0;
    const activePractices = practices?.filter(p => p.status === 'active').length || 0;
    const completedPractices = practices?.filter(p => p.status === 'completed').length || 0;

    // Days since first practice
    const firstPractice = practices?.reduce((earliest, p) => {
      const startDate = new Date(p.start_date || p.created_at);
      return !earliest || startDate < earliest ? startDate : earliest;
    }, null as Date | null);
    const daysSinceFirstPractice = firstPractice 
      ? Math.floor((new Date().getTime() - firstPractice.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Weekly stats
    const { data: weeklyDailyRecords } = await supabase
      .from('daily_records')
      .select('count')
      .eq('user_id', userId)
      .gte('record_date', weekStartStr)
      .lte('record_date', today);

    const { data: weeklyMeditation } = await supabase
      .from('meditation_records')
      .select('duration_minutes')
      .eq('user_id', userId)
      .gte('record_date', weekStartStr)
      .lte('record_date', today);

    const weeklyRecords = (weeklyDailyRecords?.length || 0) + (weeklyMeditation?.length || 0);
    const weeklyMeditationMinutes = weeklyMeditation?.reduce((sum, r) => sum + r.duration_minutes, 0) || 0;
    const weeklyCountTotal = weeklyDailyRecords?.reduce((sum, r) => sum + r.count, 0) || 0;

    // Study stats
    const { data: userCourses } = await supabase
      .from('user_courses')
      .select('*')
      .eq('user_id', userId);

    const { data: studyRecords } = await supabase
      .from('study_records')
      .select('*')
      .eq('user_id', userId);

    const coursesEnrolled = userCourses?.length || 0;
    
    // Calculate lessons completed (both types for each lesson)
    const lessonCompletionMap = new Map();
    studyRecords?.forEach(record => {
      if (!lessonCompletionMap.has(record.lesson_id)) {
        lessonCompletionMap.set(record.lesson_id, { 听传承: false, 看法本: false });
      }
      const lessonData = lessonCompletionMap.get(record.lesson_id);
      if (record.study_type === '听传承') lessonData.听传承 = true;
      if (record.study_type === '看法本') lessonData.看法本 = true;
    });
    
    const lessonsCompleted = Array.from(lessonCompletionMap.values())
      .filter(lesson => lesson.听传承 && lesson.看法本).length;

    // Study streak (days with study records)
    const studyDates = [...new Set(studyRecords?.map(r => r.study_date) || [])].sort().reverse();
    let studyStreak = 0;
    let currentDate = new Date();
    for (const dateStr of studyDates) {
      const recordDate = new Date(dateStr);
      const daysDiff = Math.floor((currentDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === studyStreak) {
        studyStreak++;
        currentDate = recordDate;
      } else {
        break;
      }
    }

    // Lifetime stats
    const { data: allMeditation } = await supabase
      .from('meditation_records')
      .select('duration_minutes')
      .eq('user_id', userId);

    const { data: allDailyRecords } = await supabase
      .from('daily_records')
      .select('count, record_date')
      .eq('user_id', userId);

    const totalMeditationSessions = allMeditation?.length || 0;
    const totalMeditationHours = Math.round((allMeditation?.reduce((sum, r) => sum + r.duration_minutes, 0) || 0) / 60 * 10) / 10;
    const totalCounts = allDailyRecords?.reduce((sum, r) => sum + r.count, 0) || 0;
    
    // Days active (unique dates with any records)
    const allActiveDates = new Set([
      ...(allMeditation?.map(r => r.record_date) || []),
      ...(allDailyRecords?.map(r => r.record_date) || []),
      ...(studyRecords?.map(r => r.study_date) || [])
    ]);
    const daysActive = allActiveDates.size;

    // Current streak calculation
    const allDates = Array.from(allActiveDates).sort().reverse();
    let currentStreak = 0;
    let checkDate = new Date();
    for (const dateStr of allDates) {
      const recordDate = new Date(dateStr);
      const daysDiff = Math.floor((checkDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === currentStreak) {
        currentStreak++;
        checkDate = recordDate;
      } else {
        break;
      }
    }

    return {
      totalPractices,
      activePractices,
      completedPractices,
      daysSinceFirstPractice,
      weeklyRecords,
      weeklyMeditationMinutes,
      weeklyCountTotal,
      currentStreak,
      coursesEnrolled,
      lessonsCompleted,
      studyStreak,
      totalStudyHours: studyRecords?.length || 0, // Simple count for now
      totalMeditationSessions,
      totalMeditationHours,
      totalCounts,
      daysActive
    };
  };

  if (loading) {
    return (
      <PageTemplate title="回向" subtitle="查看您的修行进展" scrollable={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DesignSystem.colors.primary} />
          <Text style={styles.loadingText}>正在加载统计数据...</Text>
        </View>
      </PageTemplate>
    );
  }

  if (!stats || (stats.totalPractices === 0 && stats.coursesEnrolled === 0)) {
    return (
      <PageTemplate title="回向" subtitle="查看您的修行进展" scrollable={false} padding={0}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.emptyState}>
            <View style={styles.iconContainer}>
              <Ionicons name="bar-chart-outline" size={80} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>开始你的统计之旅</Text>
            <Text style={styles.emptyDescription}>
              添加你的第一个记录，开始查看详细的进展统计
            </Text>
            <TouchableOpacity style={styles.startButton} onPress={() => {}}>
              <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
              <Text style={styles.startButtonText}>开始记录</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title="回向" subtitle="查看您的修行进展" scrollable={false} padding={0}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* Practice Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 修行概览</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalPractices}</Text>
              <Text style={styles.statLabel}>总修行项目</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.activePractices}</Text>
              <Text style={styles.statLabel}>进行中</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.completedPractices}</Text>
              <Text style={styles.statLabel}>已完成</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.daysSinceFirstPractice}</Text>
              <Text style={styles.statLabel}>修行天数</Text>
            </View>
          </View>
        </View>

        {/* This Week Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 本周总结</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.weeklyRecords}</Text>
              <Text style={styles.statLabel}>本周记录数</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.weeklyMeditationMinutes}</Text>
              <Text style={styles.statLabel}>观修分钟</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.weeklyCountTotal.toLocaleString()}</Text>
              <Text style={styles.statLabel}>持咒计数</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.currentStreak}</Text>
              <Text style={styles.statLabel}>连续天数</Text>
            </View>
          </View>
        </View>

        {/* Study Progress */}
        {stats.coursesEnrolled > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📚 学习进展</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.coursesEnrolled}</Text>
                <Text style={styles.statLabel}>已加入课程</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.lessonsCompleted}</Text>
                <Text style={styles.statLabel}>完成课程</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.studyStreak}</Text>
                <Text style={styles.statLabel}>学习连续天数</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.totalStudyHours}</Text>
                <Text style={styles.statLabel}>学习记录数</Text>
              </View>
            </View>
          </View>
        )}

        {/* Lifetime Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 累计成就</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalMeditationSessions}</Text>
              <Text style={styles.statLabel}>观修总座数</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalMeditationHours}</Text>
              <Text style={styles.statLabel}>观修总小时</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalCounts.toLocaleString()}</Text>
              <Text style={styles.statLabel}>累计计数</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.daysActive}</Text>
              <Text style={styles.statLabel}>活跃天数</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </PageTemplate>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 500,
  },
  iconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 280,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 40,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
