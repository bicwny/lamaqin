import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getUserCourses, getUserTopicProgress } from '@/lib/database';

interface Course {
  id: string;
  title: string;
  description: string;
  total_topics: number;
}

interface TopicProgress {
  id: string;
  topic_number: number;
  completed: boolean;
  completion_date: string | null;
}

export default function StudyScreen() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudyData();
  }, [user?.id]);

  const loadStudyData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [coursesData, progressData] = await Promise.all([
        getUserCourses(user.id),
        getUserTopicProgress(user.id)
      ]);

      setCourses(coursesData || []);
      setTopicProgress(progressData || []);
      console.log('📚 Loaded topic stats:', progressData?.length || 0);
    } catch (error) {
      console.error('❌ Error loading study data:', error);
      Alert.alert('错误', '加载学习数据失败');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (totalTopics: number) => {
    const completedTopics = topicProgress.filter(p => p.completed).length;
    return totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600">加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-study rounded-b-3xl mx-4 mt-4 px-6 py-8">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white text-2xl font-bold">闻思修行</Text>
              <Text className="text-white/80 text-base mt-1">深入经藏，智慧如海</Text>
            </View>
            <View className="bg-white/20 rounded-full p-3">
              <Text className="text-white text-xl">📚</Text>
            </View>
          </View>
        </View>

        {/* Study Stats */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">学习统计</Text>
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-sm text-gray-600">已完成主题</Text>
                <Text className="text-2xl font-bold text-study">
                  {topicProgress.filter(p => p.completed).length}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-600">总体进度</Text>
                <Text className="text-2xl font-bold text-study">
                  {courses.length > 0 ? calculateProgress(courses[0]?.total_topics || 0).toFixed(1) : '0'}%
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-600">课程数</Text>
                <Text className="text-2xl font-bold text-study">{courses.length}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Courses */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">我的课程</Text>

          {courses.length === 0 ? (
            <View className="bg-white rounded-xl p-6 shadow-sm items-center">
              <Text className="text-4xl mb-4">📖</Text>
              <Text className="text-gray-800 font-medium mb-2">暂无课程</Text>
              <Text className="text-gray-600 text-center mb-4">
                开始您的闻思之旅，选择适合的课程深入学习佛法
              </Text>
              <TouchableOpacity className="bg-study rounded-lg px-6 py-3">
                <Text className="text-white font-medium">浏览课程</Text>
              </TouchableOpacity>
            </View>
          ) : (
            courses.map((course) => {
              const progressPercent = calculateProgress(course.total_topics);
              const completedTopics = topicProgress.filter(p => p.completed).length;

              return (
                <TouchableOpacity
                  key={course.id}
                  className="bg-white rounded-xl p-4 mb-3 shadow-sm"
                  onPress={() => {
                    // Navigate to course detail
                    console.log('Navigate to course:', course.id);
                  }}
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-gray-800 mb-1">
                        {course.title}
                      </Text>
                      <Text className="text-gray-600 text-sm mb-2">
                        {course.description}
                      </Text>
                    </View>
                    <View className="bg-study/10 rounded-full p-2 ml-3">
                      <Text className="text-study text-sm font-medium">
                        {completedTopics}/{course.total_topics}
                      </Text>
                    </View>
                  </View>

                  <View className="mb-2">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-xs text-gray-500">学习进度</Text>
                      <Text className="text-xs text-study font-medium">
                        {progressPercent.toFixed(1)}%
                      </Text>
                    </View>
                    <View className="bg-gray-100 rounded-full h-2">
                      <View 
                        className="bg-study rounded-full h-2" 
                        style={{ width: `${progressPercent}%` }} 
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Daily Quote */}
        <View className="px-4 mt-6 mb-8">
          <View className="bg-buddhist-golden/10 rounded-xl p-4 border-l-4 border-buddhist-golden">
            <Text className="text-sm font-medium text-buddhist-golden mb-1">今日法语</Text>
            <Text className="text-gray-700 italic">
              "诸恶莫作，众善奉行，自净其意，是诸佛教。"
            </Text>
            <Text className="text-xs text-gray-500 mt-2">— 《法句经》</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}