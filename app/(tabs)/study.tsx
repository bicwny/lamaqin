
import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { getCourses } from '@/lib/database';
import { Course } from '@/types/database';

export default function StudyScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const coursesData = await getCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            📚 闻思学习
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Buddhist Study & Courses
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            今日学习
          </ThemedText>
          <View style={styles.quickStudyCard}>
            <ThemedText style={styles.cardText}>
              今天还没有学习记录
            </ThemedText>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.buttonText}>开始学习</Text>
            </TouchableOpacity>
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            我的课程
          </ThemedText>
          {loading ? (
            <ThemedText>Loading courses...</ThemedText>
          ) : (
            courses.map((course) => (
              <View key={course.id} style={styles.courseCard}>
                <ThemedText type="defaultSemiBold" style={styles.courseName}>
                  {course.name}
                </ThemedText>
                <ThemedText style={styles.courseTeacher}>
                  {course.teacher}
                </ThemedText>
                <ThemedText style={styles.courseProgress}>
                  课程进度: 0 / {course.total_lessons}
                </ThemedText>
              </View>
            ))
          )}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            快速操作
          </ThemedText>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.gridButton}>
              <Text style={styles.gridButtonText}>继续学习</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridButton}>
              <Text style={styles.gridButtonText}>浏览课程</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridButton}>
              <Text style={styles.gridButtonText}>今日听课</Text>
            </TouchableOpacity>
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
    backgroundColor: Colors.study,
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
  quickStudyCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: Colors.study,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.surface,
    fontWeight: 'bold',
    fontSize: 16,
  },
  courseCard: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.study,
  },
  courseName: {
    fontSize: 18,
    color: Colors.text,
    marginBottom: 5,
  },
  courseTeacher: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  courseProgress: {
    fontSize: 14,
    color: Colors.study,
    fontWeight: 'bold',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridButton: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 10,
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.study,
  },
  gridButtonText: {
    color: Colors.study,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
