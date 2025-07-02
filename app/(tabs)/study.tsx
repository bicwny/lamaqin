import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { studyService } from '@/lib/database';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Course {
  id: string;
  name: string;
  total_lessons: number;
  teacher?: string;
}

interface StudyProgress {
  courseId: string;
  currentLesson: number;
  listenCount: Record<number, number>;
}

export default function StudyScreen() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<StudyProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudyData();
  }, [user]);

  const loadStudyData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Loading study data for user:', user.id);
      
      const coursesData = await studyService.getCourses();
      const progressData = await studyService.getUserStudyProgress(user.id);

      console.log('📚 Loaded courses:', coursesData.length);
      console.log('📖 Loaded progress records:', progressData.length);

      setCourses(coursesData);
      // Process progress data into organized format
      const organizedProgress = processProgressData(progressData);
      setProgress(organizedProgress);
    } catch (error) {
      console.error('❌ Error loading study data:', error);
      // Show empty state instead of any fallback
      setCourses([]);
      setProgress([]);
    } finally {
      setLoading(false);
    }
  };

  const processProgressData = (studyRecords: any[]) => {
    const progressMap: Record<string, StudyProgress> = {};

    studyRecords.forEach(record => {
      const courseId = record.course_id;
      if (!progressMap[courseId]) {
        progressMap[courseId] = {
          courseId,
          currentLesson: 1,
          listenCount: {}
        };
      }

      const lessonNum = record.lesson?.lesson_number || 1;
      progressMap[courseId].listenCount[lessonNum] = 
        (progressMap[courseId].listenCount[lessonNum] || 0) + 1;

      if (lessonNum >= progressMap[courseId].currentLesson) {
        progressMap[courseId].currentLesson = lessonNum;
      }
    });

    return Object.values(progressMap);
  };

  const recordStudy = async (courseId: string, lessonNumber: number) => {
    if (!user) return;

    try {
      // Find the lesson ID (simplified for now)
      const today = new Date().toISOString().split('T')[0];

      await studyService.recordStudy({
        user_id: user.id,
        course_id: courseId,
        lesson_id: `lesson-${courseId}-${lessonNumber}`, // Simplified
        study_date: today,
        study_count_for_lesson: 1
      });

      Alert.alert('成功', '闻思记录已保存');
      loadStudyData(); // Refresh data
    } catch (error) {
      console.error('Error recording study:', error);
      Alert.alert('错误', '保存失败，请重试');
    }
  };

  const getCourseProgress = (courseId: string) => {
    return progress.find(p => p.courseId === courseId);
  };

  const handleBrowseCourses = () => {
    // TODO: Navigate to course list
    console.log('Browse courses pressed');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📚 闻思学习</Text>
        <Text>加载中...</Text>
      </View>
    );
  }

  if (courses.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>📚 闻思学习</Text>
            <Text style={styles.subtitle}>系统学习佛法课程</Text>
          </View>

          <View style={styles.emptyState}>
            <View style={styles.iconContainer}>
              <Ionicons name="book-outline" size={80} color="#9CA3AF" />
            </View>

            <Text style={styles.emptyTitle}>开始闻思学习</Text>
            <Text style={styles.emptyDescription}>
              选择课程开始系统学习，追踪学习进度
            </Text>

            <TouchableOpacity style={styles.browseButton} onPress={handleBrowseCourses}>
              <Ionicons name="library-outline" size={24} color="#FFFFFF" />
              <Text style={styles.browseButtonText}>浏览课程</Text>
            </TouchableOpacity>

            <View style={styles.courseContainer}>
              <Text style={styles.courseTitle}>推荐课程：</Text>
              <View style={styles.courses}>
                <View style={styles.courseItem}>
                  <Text style={styles.courseName}>《入菩萨行论》</Text>
                  <Text style={styles.courseInfo}>索达吉堪布 • 201课</Text>
                </View>
                <View style={styles.courseItem}>
                  <Text style={styles.courseName}>《大圆满前行》</Text>
                  <Text style={styles.courseInfo}>索达吉堪布 • 92课</Text>
                </View>
                <View style={styles.courseItem}>
                  <Text style={styles.courseName}>《净土教言》</Text>
                  <Text style={styles.courseInfo}>索达吉堪布 • 45课</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📚 闻思学习</Text>

      {courses.map(course => {
        const courseProgress = getCourseProgress(course.id);
        const currentLesson = courseProgress?.currentLesson || 1;
        const listenCount = courseProgress?.listenCount[currentLesson] || 0;

        return (
          <View key={course.id} style={styles.courseCard}>
            <Text style={styles.courseName}>{course.name}</Text>
            {course.teacher && (
              <Text style={styles.teacher}>授课: {course.teacher}</Text>
            )}

            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                当前课程: 第 {currentLesson} 课 / 共 {course.total_lessons} 课
              </Text>
              <Text style={styles.listenCount}>
                今日听闻次数: {listenCount}
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.studyButton}
                onPress={() => recordStudy(course.id, currentLesson)}
              >
                <Text style={styles.buttonText}>记录闻思 +1</Text>
              </TouchableOpacity>

              {currentLesson < course.total_lessons && (
                <TouchableOpacity 
                  style={styles.nextButton}
                  onPress={() => recordStudy(course.id, currentLesson + 1)}
                >
                  <Text style={styles.buttonText}>下一课</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(currentLesson / course.total_lessons) * 100}%` }
                ]} 
              />
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  courseCard: {
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
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  teacher: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  progressInfo: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 16,
    marginBottom: 4,
  },
  listenCount: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  studyButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
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
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 40,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  courseContainer: {
    alignItems: 'center',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 16,
  },
  courses: {
    alignItems: 'stretch',
  },
  courseItem: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    minWidth: 250,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  courseInfo: {
    fontSize: 14,
    color: '#6B7280',
  },
});