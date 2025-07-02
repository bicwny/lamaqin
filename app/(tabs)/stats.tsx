import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { practiceService, mindfulnessService, meditationService, studyService } from '@/lib/database';

interface StatsData {
  practiceStats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
  };
  studyStats: {
    totalCourses: number;
    currentProgress: Array<{ courseName: string; progress: number }>;
  };
  mindfulnessStats: {
    weeklyGoodPercent: number;
    totalRecords: number;
  };
  meditationStats: {
    completedSessions: number;
    totalSessions: number;
  };
}

export default function StatsScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      // Load practice stats
      const practiceProjects = await practiceService.getUserPracticeProjects(user.id);
      const practiceStats = {
        totalProjects: practiceProjects.length,
        activeProjects: practiceProjects.filter(p => p.status === 'active').length,
        completedProjects: practiceProjects.filter(p => p.status === 'completed').length,
      };

      // Load study stats
      const courses = await studyService.getCourses();
      const studyProgress = await studyService.getUserStudyProgress(user.id);
      const studyStats = {
        totalCourses: courses.length,
        currentProgress: courses.map(course => ({
          courseName: course.name,
          progress: calculateCourseProgress(course, studyProgress)
        }))
      };

      // Load mindfulness stats (last 7 days)
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const mindfulnessRecords = await mindfulnessService.getWeeklyStats(user.id, startDate, endDate);
      const goodRecords = mindfulnessRecords.filter(r => r.mind_type === 'good').length;
      const totalRecords = mindfulnessRecords.length;
      const mindfulnessStats = {
        weeklyGoodPercent: totalRecords > 0 ? Math.round((goodRecords / totalRecords) * 100) : 0,
        totalRecords
      };

      // Load meditation stats
      const meditationStats = await meditationService.getMeditationProgress(user.id);

      setStats({
        practiceStats,
        studyStats,
        mindfulnessStats,
        meditationStats
      });

    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCourseProgress = (course: any, studyRecords: any[]) => {
    const courseRecords = studyRecords.filter(r => r.course_id === course.id);
    if (courseRecords.length === 0) return 0;

    const maxLesson = Math.max(...courseRecords.map(r => r.lesson?.lesson_number || 1));
    return Math.round((maxLesson / course.total_lessons) * 100);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📊 修行统计</Text>
        <Text>加载中...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📊 修行统计</Text>
        <Text>暂无数据</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 修行统计</Text>

      {/* Practice Statistics */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>📿 修行功课统计</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.practiceStats.totalProjects}</Text>
            <Text style={styles.statLabel}>总修行项目</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.practiceStats.activeProjects}</Text>
            <Text style={styles.statLabel}>进行中</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.practiceStats.completedProjects}</Text>
            <Text style={styles.statLabel}>已完成</Text>
          </View>
        </View>
      </View>

      {/* Study Statistics */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>📚 闻思学习统计</Text>
        <Text style={styles.subTitle}>课程进度</Text>
        {stats.studyStats.currentProgress.map((course, index) => (
          <View key={index} style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.courseName}>{course.courseName}</Text>
              <Text style={styles.progressPercent}>{course.progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${course.progress}%` }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>

      {/* Mindfulness Statistics */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>💝 心性观察统计</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.mindfulnessStats.weeklyGoodPercent}%</Text>
            <Text style={styles.statLabel}>近7天善心比例</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.mindfulnessStats.totalRecords}</Text>
            <Text style={styles.statLabel}>近7天记录数</Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <View 
            style={[
              styles.goodnessFill, 
              { width: `${stats.mindfulnessStats.weeklyGoodPercent}%` }
            ]} 
          />
        </View>
      </View>

      {/* Meditation Statistics */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>🧘 前行观修统计</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.meditationStats.completedSessions}</Text>
            <Text style={styles.statLabel}>已完成座次</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.meditationStats.totalSessions}</Text>
            <Text style={styles.statLabel}>总座次</Text>
          </View>
        </View>

        <View style={styles.progressItem}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>前行进度</Text>
            <Text style={styles.progressPercent}>
              {Math.round((stats.meditationStats.completedSessions / stats.meditationStats.totalSessions) * 100)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.meditationFill, 
                { width: `${(stats.meditationStats.completedSessions / stats.meditationStats.totalSessions) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Achievement Summary */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>🏆 修行成就</Text>
        <View style={styles.achievementList}>
          {stats.practiceStats.completedProjects > 0 && (
            <Text style={styles.achievement}>
              ✅ 已完成 {stats.practiceStats.completedProjects} 个修行项目
            </Text>
          )}
          {stats.meditationStats.completedSessions > 0 && (
            <Text style={styles.achievement}>
              🧘 已完成 {stats.meditationStats.completedSessions} 座前行观修
            </Text>
          )}
          {stats.mindfulnessStats.weeklyGoodPercent >= 70 && (
            <Text style={styles.achievement}>
              💝 近期心性状态良好 ({stats.mindfulnessStats.weeklyGoodPercent}% 善心)
            </Text>
          )}
        </View>
      </View>
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
  statsCard: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  progressItem: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  courseName: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E5E7',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  goodnessFill: {
    height: '100%',
    backgroundColor: '#34C759',
  },
  meditationFill: {
    height: '100%',
    backgroundColor: '#AF52DE',
  },
  achievementList: {
    gap: 8,
  },
  achievement: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
  },
});