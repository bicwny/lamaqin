import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
      <View style={styles.container}>
        <Text>加载修行项目中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>用户修行项目 ({projects.length})</Text>

      <TouchableOpacity style={styles.refreshButton} onPress={loadProjects}>
        <Text style={styles.refreshButtonText}>刷新</Text>
      </TouchableOpacity>

      {projects.map((project, index) => (
        <View key={project.id} style={styles.projectItem}>
          <Text style={styles.projectName}>
            {project.practices?.name || '未知修行'}
          </Text>
          <Text style={styles.projectDetails}>
            目标: {project.current_count}/{project.target_count} {project.practices?.unit}
          </Text>
          <Text style={styles.projectDetails}>
            每日目标: {project.daily_target} {project.practices?.unit}
          </Text>
          <Text style={styles.projectStatus}>状态: {project.status}</Text>
        </View>
      ))}

      {projects.length === 0 && (
        <Text style={styles.emptyText}>暂无修行项目</Text>
      )}
    </View>
  );
}