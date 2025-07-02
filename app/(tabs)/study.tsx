
import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Course {
  id: string;
  title: string;
  teacher: string;
  currentLesson: number;
  totalLessons: number;
  progress: number;
}

interface DailyStudyStatus {
  hasStudied: boolean;
  date: string;
}

const mockCourses: Course[] = [
  {
    id: '1',
    title: '佛子行',
    teacher: '索达吉堪布',
    currentLesson: 0,
    totalLessons: 48,
    progress: 0,
  },
  {
    id: '2',
    title: '修心七要',
    teacher: '索达吉堪布',
    currentLesson: 0,
    totalLessons: 36,
    progress: 0,
  },
  {
    id: '3',
    title: '修心七要-圆照',
    teacher: '圆照堪布',
    currentLesson: 0,
    totalLessons: 36,
    progress: 0,
  },
  {
    id: '4',
    title: '入菩萨行论',
    teacher: '索达吉堪布',
    currentLesson: 0,
    totalLessons: 201,
    progress: 0,
  },
  {
    id: '5',
    title: '前行广释',
    teacher: '索达吉堪布',
    currentLesson: 0,
    totalLessons: 156,
    progress: 0,
  },
];

export default function StudyScreen() {
  const colorScheme = useColorScheme();
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [dailyStatus, setDailyStatus] = useState<DailyStudyStatus>({
    hasStudied: false,
    date: new Date().toDateString(),
  });

  const handleStartStudy = () => {
    if (!dailyStatus.hasStudied) {
      setDailyStatus({
        hasStudied: true,
        date: new Date().toDateString(),
      });
      Alert.alert('开始学习', '开始今日的学习吧！', [{ text: '确定' }]);
    } else {
      Alert.alert('今日已学习', '您今天已经完成学习了！', [{ text: '确定' }]);
    }
  };

  const handleCoursePress = (course: Course) => {
    Alert.alert(
      course.title,
      `教师: ${course.teacher}\n课程进度: ${course.currentLesson}/${course.totalLessons}`,
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '开始学习', 
          onPress: () => {
            // Update course progress
            setCourses(prev => prev.map(c => 
              c.id === course.id 
                ? { ...c, currentLesson: Math.min(c.currentLesson + 1, c.totalLessons) }
                : c
            ));
          }
        },
      ]
    );
  };

  const CourseCard = ({ course }: { course: Course }) => (
    <TouchableOpacity
      style={[styles.courseCard, { borderColor: Colors[colorScheme ?? 'light'].border }]}
      onPress={() => handleCoursePress(course)}
    >
      <View style={styles.courseHeader}>
        <Text style={styles.courseTitle}>《{course.title}》</Text>
        <Text style={styles.courseTeacher}>{course.teacher}</Text>
      </View>
      <Text style={styles.courseProgress}>
        课程进度: <Text style={styles.progressNumbers}>{course.currentLesson} / {course.totalLessons}</Text>
      </Text>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>闻思</ThemedText>
        </View>

        {/* Daily Study Status Card */}
        <View style={[styles.dailyCard, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}>
          <Text style={styles.dailyStatusText}>
            {dailyStatus.hasStudied ? '今天已完成学习' : '今天还没有学习记录'}
          </Text>
          <TouchableOpacity
            style={[
              styles.startButton,
              { backgroundColor: dailyStatus.hasStudied ? '#6B7280' : '#3B82F6' }
            ]}
            onPress={handleStartStudy}
          >
            <Text style={styles.startButtonText}>
              {dailyStatus.hasStudied ? '已完成' : '开始学习'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Course List */}
        <View style={styles.courseList}>
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  dailyCard: {
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dailyStatusText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#374151',
    textAlign: 'center',
  },
  startButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  courseList: {
    paddingHorizontal: 15,
    paddingBottom: 100,
  },
  courseCard: {
    backgroundColor: 'white',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  courseHeader: {
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  courseTeacher: {
    fontSize: 14,
    color: '#6B7280',
  },
  courseProgress: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressNumbers: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});
</styles>
