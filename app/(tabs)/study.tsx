import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { studyService } from '@/lib/database';

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
    if (!user) return;

    try {
      const coursesData = await studyService.getCourses();
      const progressData = await studyService.getUserStudyProgress(user.id);

      setCourses(coursesData);
      // Process progress data into organized format
      const organizedProgress = processProgressData(progressData);
      setProgress(organizedProgress);
    } catch (error) {
      console.error('Error loading study data:', error);
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

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📚 闻思学习</Text>
        <Text>加载中...</Text>
      </View>
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
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
});