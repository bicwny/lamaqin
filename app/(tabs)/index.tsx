
import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';

export default function HomeScreen() {
  const [todayProgress, setTodayProgress] = useState({
    completedPractices: 3,
    totalPractices: 6,
    studyMinutes: 45,
    meditationMinutes: 25,
    goodMindCount: 12,
    badMindCount: 2,
    streak: 27
  });

  const [quickStats, setQuickStats] = useState({
    totalMantras: 2847,
    totalStudyHours: 89,
    totalMeditationHours: 156,
    favoriteMantra: '六字大明咒'
  });

  const [currentPractices, setCurrentPractices] = useState([
    { name: '六字大明咒', current: 2847, target: 10000, unit: '次' },
    { name: '禅修', current: 25, target: 30, unit: '分钟' },
    { name: '心经', current: 7, target: 21, unit: '次' }
  ]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '🌙 夜深了，早点休息';
    if (hour < 12) return '🌅 早上好，开始今日修行';
    if (hour < 18) return '☀️ 下午好，精进不懈';
    return '🌆 晚上好，回顾今日收获';
  };

  const getCompletionPercentage = () => {
    return Math.round((todayProgress.completedPractices / todayProgress.totalPractices) * 100);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            🏠 修行主页
          </ThemedText>
          <ThemedText style={styles.greeting}>
            {getGreeting()}
          </ThemedText>
          <ThemedText style={styles.userName}>
            善缘居士 · 修行第{todayProgress.streak}天 🔥
          </ThemedText>
        </ThemedView>

        {/* Today's Progress */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            📊 今日进度
          </ThemedText>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <ThemedText style={styles.progressText}>
                修行完成度: {getCompletionPercentage()}%
              </ThemedText>
              <ThemedText style={styles.progressCount}>
                {todayProgress.completedPractices}/{todayProgress.totalPractices}
              </ThemedText>
            </View>
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${getCompletionPercentage()}%`,
                    backgroundColor: Colors.primary 
                  }
                ]} 
              />
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>📚</Text>
                <ThemedText style={styles.statText}>{todayProgress.studyMinutes}分钟</ThemedText>
                <ThemedText style={styles.statLabel}>学习</ThemedText>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>🧘</Text>
                <ThemedText style={styles.statText}>{todayProgress.meditationMinutes}分钟</ThemedText>
                <ThemedText style={styles.statLabel}>禅修</ThemedText>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>👁</Text>
                <ThemedText style={styles.statText}>{Math.round((todayProgress.goodMindCount / (todayProgress.goodMindCount + todayProgress.badMindCount)) * 100)}%</ThemedText>
                <ThemedText style={styles.statLabel}>善心</ThemedText>
              </View>
            </View>
          </View>
        </ThemedView>

        {/* Current Practices */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            📿 进行中的修行
          </ThemedText>

          {currentPractices.map((practice, index) => {
            const progress = (practice.current / practice.target) * 100;
            return (
              <View key={index} style={styles.practiceCard}>
                <View style={styles.practiceInfo}>
                  <ThemedText style={styles.practiceName}>{practice.name}</ThemedText>
                  <ThemedText style={styles.practiceProgress}>
                    {practice.current.toLocaleString()}/{practice.target.toLocaleString()} {practice.unit}
                  </ThemedText>
                </View>
                <View style={styles.practiceProgressBar}>
                  <View 
                    style={[
                      styles.practiceProgressFill, 
                      { 
                        width: `${Math.min(progress, 100)}%`,
                        backgroundColor: Colors.practice 
                      }
                    ]} 
                  />
                </View>
              </View>
            );
          })}
        </ThemedView>

        {/* Quick Stats */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            🏆 修行统计
          </ThemedText>

          <View style={styles.statsGrid}>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatIcon}>📿</Text>
              <ThemedText style={styles.quickStatNumber}>
                {quickStats.totalMantras.toLocaleString()}
              </ThemedText>
              <ThemedText style={styles.quickStatLabel}>总持咒次数</ThemedText>
            </View>

            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatIcon}>📚</Text>
              <ThemedText style={styles.quickStatNumber}>
                {quickStats.totalStudyHours}
              </ThemedText>
              <ThemedText style={styles.quickStatLabel}>学习小时</ThemedText>
            </View>

            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatIcon}>🧘</Text>
              <ThemedText style={styles.quickStatNumber}>
                {quickStats.totalMeditationHours}
              </ThemedText>
              <ThemedText style={styles.quickStatLabel}>禅修小时</ThemedText>
            </View>

            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatIcon}>⭐</Text>
              <ThemedText style={styles.quickStatNumber}>
                {todayProgress.streak}
              </ThemedText>
              <ThemedText style={styles.quickStatLabel}>连续天数</ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Quick Actions */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            ⚡ 快速操作
          </ThemedText>

          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📿</Text>
              <ThemedText style={styles.actionText}>开始持咒</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>🧘</Text>
              <ThemedText style={styles.actionText}>开始禅修</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>👁</Text>
              <ThemedText style={styles.actionText}>观心记录</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📚</Text>
              <ThemedText style={styles.actionText}>继续学习</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Daily Inspiration */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            💫 今日法语
          </ThemedText>

          <View style={styles.inspirationCard}>
            <ThemedText style={styles.inspirationText}>
              "一切有为法，如梦幻泡影，如露亦如电，应作如是观。"
            </ThemedText>
            <ThemedText style={styles.inspirationSource}>
              —— 《金刚经》
            </ThemedText>
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
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.surface,
    marginBottom: 5,
  },
  greeting: {
    fontSize: 16,
    color: Colors.surface,
    opacity: 0.9,
    marginBottom: 5,
  },
  userName: {
    fontSize: 14,
    color: Colors.surface,
    opacity: 0.8,
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
  progressCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  progressCount: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  statText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  practiceCard: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  practiceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  practiceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  practiceProgress: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  practiceProgressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  practiceProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  quickStatCard: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 10,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickStatIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  actionButton: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    width: '47%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  inspirationCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inspirationText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 10,
  },
  inspirationSource: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
});
