
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

  // Mock data for demo purposes
  const mockCourses = [
    {
      id: '1',
      name: '菩提道次第广论',
      total_lessons: 180,
      teacher: '日常法师',
      description: '系统学习佛法修行次第',
      created_at: '2024-01-01'
    },
    {
      id: '2',
      name: '广论研讨班',
      total_lessons: 52,
      teacher: '福智法师',
      description: '深入研讨菩提道次第',
      created_at: '2024-01-01'
    },
    {
      id: '3',
      name: '备览',
      total_lessons: 24,
      teacher: '日常法师',
      description: '佛法学修要点总览',
      created_at: '2024-01-01'
    }
  ];

  const displayCourses = courses.length > 0 ? courses : mockCourses;

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

        {/* Study Progress Summary */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            学习进度
          </ThemedText>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>进行中课程:</ThemedText>
              <ThemedText style={styles.summaryValue}>2</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>已完成课程:</ThemedText>
              <ThemedText style={styles.summaryValue}>1</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>总听课时长:</ThemedText>
              <ThemedText style={styles.summaryValue}>156 小时</ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Available Courses */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            课程列表
          </ThemedText>
          
          {displayCourses.map((course) => (
            <View key={course.id} style={styles.courseCard}>
              <View style={styles.courseHeader}>
                <ThemedText type="defaultSemiBold" style={styles.courseName}>
                  {course.name}
                </ThemedText>
                <View style={styles.lessonTag}>
                  <Text style={styles.lessonText}>{course.total_lessons}课</Text>
                </View>
              </View>
              
              {course.teacher && (
                <ThemedText style={styles.teacherText}>
                  授课法师: {course.teacher}
                </ThemedText>
              )}
              
              {course.description && (
                <ThemedText style={styles.descriptionText}>
                  {course.description}
                </ThemedText>
              )}

              {/* Progress Bar */}
              <View style={styles.progressSection}>
                <ThemedText style={styles.progressLabel}>
                  进度: 45 / {course.total_lessons} 课
                </ThemedText>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${(45 / course.total_lessons) * 100}%`,
                        backgroundColor: Colors.study 
                      }
                    ]} 
                  />
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>继续学习</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
                  <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>课程详情</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ThemedView>

        {/* Quick Actions */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            快速功能
          </ThemedText>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📖</Text>
              <ThemedText style={styles.actionLabel}>今日复习</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📝</Text>
              <ThemedText style={styles.actionLabel}>笔记回顾</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>🎯</Text>
              <ThemedText style={styles.actionLabel}>学习计划</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📊</Text>
              <ThemedText style={styles.actionLabel}>学习统计</ThemedText>
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
  summaryCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  courseCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: Colors.study,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  courseName: {
    fontSize: 18,
    color: Colors.text,
    flex: 1,
  },
  lessonTag: {
    backgroundColor: Colors.study,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  lessonText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  teacherText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 15,
  },
  progressSection: {
    marginBottom: 15,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    backgroundColor: Colors.study,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.study,
  },
  actionButtonText: {
    color: Colors.surface,
    fontWeight: 'bold',
    fontSize: 14,
  },
  secondaryButtonText: {
    color: Colors.study,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  actionCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.text,
  },
});
