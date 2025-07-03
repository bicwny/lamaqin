
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, FlatList } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { studyService } from '@/lib/database';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Course {
  id: string;
  name: string;
  total_lessons: number;
  teacher?: string;
  description?: string;
}

interface UserCourse {
  id: string;
  user_id: string;
  course_id: string;
  status: 'active' | 'completed' | 'paused';
  joined_date: string;
  course: Course;
}

interface StudyProgress {
  courseId: string;
  currentLesson: number;
  listenCount: Record<number, number>;
  totalLessonsStudied: number;
  progressPercentage: number;
}

export default function StudyScreen() {
  const { user } = useAuth();
  const [userCourses, setUserCourses] = useState<UserCourse[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<StudyProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [joiningCourse, setJoiningCourse] = useState<string | null>(null);

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
      
      // Load user's courses
      const userCoursesData = await getUserCourses(user.id);
      setUserCourses(userCoursesData);
      
      // Load all available courses
      const allCoursesData = await studyService.getCourses();
      setAllCourses(allCoursesData);
      
      // Load progress data
      const progressData = await studyService.getUserStudyProgress(user.id);
      const organizedProgress = processProgressData(progressData, userCoursesData);
      setProgress(organizedProgress);

      console.log('📚 Loaded user courses:', userCoursesData.length);
      console.log('📖 Loaded progress records:', progressData.length);
    } catch (error) {
      console.error('❌ Error loading study data:', error);
      setUserCourses([]);
      setAllCourses([]);
      setProgress([]);
    } finally {
      setLoading(false);
    }
  };

  const getUserCourses = async (userId: string): Promise<UserCourse[]> => {
    try {
      // 使用真正的user_courses表
      const userCourses = await studyService.getUserCourses(userId);
      return userCourses;
    } catch (error) {
      console.error('❌ Error getting user courses:', error);
      // 如果user_courses表还没有数据，返回空数组
      return [];
    }
  };

  const processProgressData = (studyRecords: any[], userCourses: UserCourse[]) => {
    const progressMap: Record<string, StudyProgress> = {};

    // Initialize progress for all user courses
    userCourses.forEach(userCourse => {
      const courseId = userCourse.course_id;
      progressMap[courseId] = {
        courseId,
        currentLesson: 1,
        listenCount: {},
        totalLessonsStudied: 0,
        progressPercentage: 0
      };
    });

    // Process study records
    studyRecords.forEach(record => {
      const courseId = record.course_id;
      if (progressMap[courseId]) {
        const lessonNum = record.lesson?.lesson_number || 1;
        
        // Track listen count for each lesson
        progressMap[courseId].listenCount[lessonNum] = 
          (progressMap[courseId].listenCount[lessonNum] || 0) + 1;

        // Update current lesson (latest lesson studied)
        if (lessonNum > progressMap[courseId].currentLesson) {
          progressMap[courseId].currentLesson = lessonNum;
        }
      }
    });

    // Calculate progress statistics
    Object.values(progressMap).forEach(progress => {
      const userCourse = userCourses.find(uc => uc.course_id === progress.courseId);
      if (userCourse) {
        progress.totalLessonsStudied = Object.keys(progress.listenCount).length;
        progress.progressPercentage = (progress.totalLessonsStudied / userCourse.course.total_lessons) * 100;
      }
    });

    return Object.values(progressMap);
  };

  const recordStudy = async (courseId: string, lessonNumber: number) => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      await studyService.recordStudy({
        user_id: user.id,
        course_id: courseId,
        lesson_number: lessonNumber,
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

  const joinCourse = async (courseId: string) => {
    if (!user) return;

    try {
      console.log('🔄 加入课程:', courseId);
      setJoiningCourse(courseId); // 设置加载状态
      
      // 真正的加入课程逻辑
      const userCourse = await studyService.joinCourse(user.id, courseId);
      
      // 即时更新本地状态
      setUserCourses(prev => [...prev, userCourse]);
      
      // 初始化进度数据
      const newProgress: StudyProgress = {
        courseId: courseId,
        currentLesson: 1,
        listenCount: {},
        totalLessonsStudied: 0,
        progressPercentage: 0
      };
      setProgress(prev => [...prev, newProgress]);
      
      Alert.alert('成功', '课程已加入，开始学习吧！');
      setShowCourseModal(false);
      
      console.log('✅ 课程加入成功');
    } catch (error) {
      console.error('❌ Error joining course:', error);
      Alert.alert('错误', '加入课程失败，请重试');
    } finally {
      setJoiningCourse(null); // 清除加载状态
    }
  };

  const getCourseProgress = (courseId: string) => {
    return progress.find(p => p.courseId === courseId);
  };

  const handleManageCourses = () => {
    setShowCourseModal(true);
  };

  const handleContinueStudy = (courseId: string) => {
    const courseProgress = getCourseProgress(courseId);
    const currentLesson = courseProgress?.currentLesson || 1;
    recordStudy(courseId, currentLesson);
  };

  const availableCourses = allCourses.filter(course => 
    !userCourses.some(uc => uc.course_id === course.id)
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.title}>📚 闻思学习</Text>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Zero State: No courses added yet
  if (userCourses.length === 0) {
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

            <Text style={styles.emptyTitle}>还没有课程，开始学习吧</Text>
            <Text style={styles.emptyDescription}>
              选择您感兴趣的课程，开始系统的闻思学习
            </Text>

            <TouchableOpacity style={styles.browseButton} onPress={handleManageCourses}>
              <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
              <Text style={styles.browseButtonText}>管理课程</Text>
            </TouchableOpacity>

            <View style={styles.courseContainer}>
              <Text style={styles.courseTitle}>推荐课程：</Text>
              <View style={styles.courses}>
                {allCourses.slice(0, 3).map(course => (
                  <View key={course.id} style={styles.courseItem}>
                    <Text style={styles.courseName}>{course.name}</Text>
                    <Text style={styles.courseInfo}>
                      {course.teacher} • {course.total_lessons}课
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Course Management Modal */}
        <Modal
          visible={showCourseModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>可加入课程</Text>
              <TouchableOpacity onPress={() => setShowCourseModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={availableCourses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.courseModalItem}>
                  <View style={styles.courseModalInfo}>
                    <Text style={styles.courseModalName}>{item.name}</Text>
                    <Text style={styles.courseModalDetails}>
                      {item.teacher} • {item.total_lessons}课
                    </Text>
                    {item.description && (
                      <Text style={styles.courseModalDescription}>
                        {item.description}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.joinButton,
                      joiningCourse === item.id && styles.joinButtonLoading
                    ]}
                    onPress={() => joinCourse(item.id)}
                    disabled={joiningCourse === item.id}
                  >
                    {joiningCourse === item.id ? (
                      <Text style={styles.joinButtonText}>加入中...</Text>
                    ) : (
                      <Text style={styles.joinButtonText}>加入学习</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            />
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    );
  }

  // Active State: User has courses
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>📚 闻思学习</Text>
          <TouchableOpacity onPress={handleManageCourses}>
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {userCourses.map(userCourse => {
          const courseProgress = getCourseProgress(userCourse.course_id);
          const currentLesson = courseProgress?.currentLesson || 1;
          const listenCount = courseProgress?.listenCount[currentLesson] || 0;
          const progressPercentage = courseProgress?.progressPercentage || 0;

          return (
            <View key={userCourse.id} style={styles.courseCard}>
              <Text style={styles.courseName}>{userCourse.course.name}</Text>
              {userCourse.course.teacher && (
                <Text style={styles.teacher}>授课: {userCourse.course.teacher}</Text>
              )}

              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>
                  当前课程: 第 {currentLesson} 课 / 共 {userCourse.course.total_lessons} 课
                </Text>
                <Text style={styles.progressText}>
                  完成进度: {progressPercentage.toFixed(1)}%
                </Text>
                <Text style={styles.listenCount}>
                  本课听闻次数: {listenCount}
                </Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={styles.studyButton}
                  onPress={() => handleContinueStudy(userCourse.course_id)}
                >
                  <Text style={styles.buttonText}>记录闻思 +1</Text>
                </TouchableOpacity>

                {currentLesson < userCourse.course.total_lessons && (
                  <TouchableOpacity 
                    style={styles.nextButton}
                    onPress={() => recordStudy(userCourse.course_id, currentLesson + 1)}
                  >
                    <Text style={styles.buttonText}>下一课</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${progressPercentage}%` }
                  ]} 
                />
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Course Management Modal */}
      <Modal
        visible={showCourseModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>可加入课程</Text>
            <TouchableOpacity onPress={() => setShowCourseModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={availableCourses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.courseModalItem}>
                <View style={styles.courseModalInfo}>
                  <Text style={styles.courseModalName}>{item.name}</Text>
                  <Text style={styles.courseModalDetails}>
                    {item.teacher} • {item.total_lessons}课
                  </Text>
                  {item.description && (
                    <Text style={styles.courseModalDescription}>
                      {item.description}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => joinCourse(item.id)}
                >
                  <Text style={styles.joinButtonText}>加入学习</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
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
  courseInfo: {
    fontSize: 14,
    color: '#6B7280',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  courseModalItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  courseModalInfo: {
    flex: 1,
    marginRight: 16,
  },
  courseModalName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  courseModalDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  courseModalDescription: {
    fontSize: 12,
    color: '#888',
    lineHeight: 16,
  },
  joinButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonLoading: {
    backgroundColor: '#9CA3AF',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
