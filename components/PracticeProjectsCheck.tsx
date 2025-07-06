import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export function PracticeProjectsCheck() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Checking practice projects for user:', user.email);

      const { data, error } = await supabase
        .from('user_practice_projects')
        .select(`
          *,
          practices (
            id,
            name,
            type,
            unit,
            description
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('📋 User practice projects:', data);
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading practice projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="p-5 bg-gray-100 m-3 rounded-lg">
        <Text className="text-buddhist-slate">加载修行项目中...</Text>
      </View>
    );
  }

  return (
    <View className="p-5 bg-gray-100 m-3 rounded-lg">
      <Text className="text-lg font-bold mb-3 text-buddhist-slate">用户修行项目 ({projects.length})</Text>

      <TouchableOpacity className="bg-primary p-3 rounded-lg items-center mb-4" onPress={loadProjects}>
        <Text className="text-white text-base font-semibold">刷新</Text>
      </TouchableOpacity>

      {projects.map((project, index) => (
        <View key={project.id} className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
          <Text className="text-base font-bold mb-2 text-buddhist-slate">
            {project.practices?.name || '未知修行'}
          </Text>
          <Text className="text-sm text-buddhist-gray mb-1">
            目标: {project.current_count}/{project.target_count} {project.practices?.unit}
          </Text>
          <Text className="text-sm text-buddhist-gray mb-1">
            每日目标: {project.daily_target} {project.practices?.unit}
          </Text>
          <Text className="text-sm text-primary font-semibold">状态: {project.status}</Text>
        </View>
      ))}

      {projects.length === 0 && (
        <Text className="text-base text-buddhist-gray text-center mt-5 italic">暂无修行项目</Text>
      )}
    </View>
  );
}