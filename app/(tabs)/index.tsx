import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import PageTemplate from '@/components/PageTemplate';
import { ConnectionTest } from '@/components/ConnectionTest';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface StudyRecord {
  id: string;
  course_name: string;
  progress_percentage: number;
  total_lessons: number;
  completed_lessons: number;
  last_studied_at: string;
}

interface PracticeProject {
  id: string;
  practice_name: string;
  current_count: number;
  target_count: number;
  progress_percentage: number;
  last_practiced_at: string;
}

export default function HomeScreen() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [studyData, setStudyData] = useState<StudyRecord[]>([]);
  const [practiceData, setPracticeData] = useState<PracticeProject[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoadingData(true);
      // Mock data for now - replace with actual API calls
      setStudyData([]);
      setPracticeData([]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLoginPress = () => {
    router.push('/auth/unified');
  };

  const handleQuickAction = (action: string, itemId?: string) => {
    switch (action) {
      case 'listen':
        // Handle listen action
        break;
      case 'read':
        // Handle read action
        break;
      case 'online':
        // Handle online action
        break;
      case 'practice':
        if (itemId) {
          router.push(`/practice-detail/${itemId}`);
        }
        break;
    }
  };

  const handleViewMore = (section: string) => {
    switch (section) {
      case 'study':
        router.push('/(tabs)/study');
        break;
      case 'practice':
        router.push('/(tabs)/practice');
        break;
    }
  };

  if (isLoading) {
    return (
      <PageTemplate title="佛学修行" scrollable={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>正在加载...</Text>
        </View>
      </PageTemplate>
    );
  }

  if (!user) {
    return (
      <PageTemplate title="佛学修行" scrollable={false}>
        <View style={styles.container}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>欢迎来到佛学修行平台</Text>
            <Text style={styles.welcomeSubtitle}>
              记录您的修行历程，跟踪学习进度
            </Text>

            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLoginPress}
            >
              <Text style={styles.loginButtonText}>开始修行之旅</Text>
            </TouchableOpacity>
          </View>

          <ConnectionTest />
        </View>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title="修行首页" scrollable={false}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Study Progress Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>学习进度</Text>
            <TouchableOpacity onPress={() => handleViewMore('study')}>
              <Text style={styles.viewMoreText}>查看更多</Text>
            </TouchableOpacity>
          </View>

          {loadingData ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : studyData.length > 0 ? (
            studyData.slice(0, 2).map((study) => (
              <View key={study.id} style={styles.studyCard}>
                <View style={styles.studyCardHeader}>
                  <View style={styles.studyCardTitleContainer}>
                    <Text style={styles.courseName}>{study.course_name}</Text>
                    <Text style={styles.continueStudyText}>继续学习</Text>
                  </View>
                </View>

                <Text style={styles.progressText}>
                  进度: {study.completed_lessons}/{study.total_lessons} 课 ({study.progress_percentage}%)
                </Text>

                <View style={styles.quickActionButtons}>
                  <TouchableOpacity 
                    style={[styles.quickActionButton, styles.listenButton]}
                    onPress={() => handleQuickAction('listen', study.id)}
                  >
                    <Text style={styles.quickActionButtonText}>听课</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.quickActionButton, styles.readButton]}
                    onPress={() => handleQuickAction('read', study.id)}
                  >
                    <Text style={styles.quickActionButtonText}>阅读</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.quickActionButton, styles.onlineButton]}
                    onPress={() => handleQuickAction('online', study.id)}
                  >
                    <Text style={styles.quickActionButtonText}>在线</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noStudyText}>暂无学习记录</Text>
          )}
        </View>

        {/* Practice Progress Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>修行进度</Text>
            <TouchableOpacity onPress={() => handleViewMore('practice')}>
              <Text style={styles.viewMoreText}>查看更多</Text>
            </TouchableOpacity>
          </View>

          {loadingData ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : practiceData.length > 0 ? (
            <View style={styles.practiceGrid}>
              {practiceData.slice(0, 4).map((practice) => (
                <TouchableOpacity
                  key={practice.id}
                  style={styles.practiceCardColumn}
                  onPress={() => handleQuickAction('practice', practice.id)}
                >
                  <View style={styles.practiceHeader}>
                    <Text style={styles.practiceNameColumn}>{practice.practice_name}</Text>
                  </View>

                  <View style={styles.countPercentageRow}>
                    <Text style={styles.practiceCountColumn}>
                      {practice.current_count}/{practice.target_count}
                    </Text>
                    <Text style={styles.progressPercent}>
                      {practice.progress_percentage}%
                    </Text>
                  </View>

                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBg}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { width: `${practice.progress_percentage}%` }
                        ]} 
                      />
                    </View>
                  </View>

                  <Text style={styles.weeklyProgressColumn}>本周进度良好</Text>
                  <Text style={styles.todayDetailsColumn}>今日已完成</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.practiceCard}>
              <Text style={styles.noPracticeText}>暂无修行项目</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </PageTemplate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  welcomeSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  viewMoreText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  studyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  studyCardHeader: {
    marginBottom: 8,
  },
  studyCardTitleContainer: {
    flex: 1,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  continueStudyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  quickActionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  listenButton: {
    backgroundColor: '#E3F2FD',
  },
  readButton: {
    backgroundColor: '#F3E5F5',
  },
  onlineButton: {
    backgroundColor: '#E8F5E8',
  },
  quickActionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  noStudyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 16,
    padding: 20,
  },
  practiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  practiceCardColumn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  practiceHeader: {
    marginBottom: 8,
  },
  practiceNameColumn: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  countPercentageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  practiceCountColumn: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressBarFill: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  practiceActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 'auto',
  },
  actionButtonSpacer: {
    width: 12,
  },
  weeklyProgressColumn: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  todayDetailsColumn: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  practiceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  noPracticeText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 16,
  },
});