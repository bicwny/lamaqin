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
            {project.total_target 
              ? `目标: ${project.current_count}/${project.total_target} ${project.practices?.unit}`
              : `已完成: ${project.current_count} ${project.practices?.unit}`
            }
          </Text>
          <Text style={styles.projectDetails}>
            {project.target_period === 'weekly' 
              ? `每周目标: ${project.weekly_target || '-'} 座`
              : `每日目标: ${project.daily_target || '-'} ${project.practices?.unit}`
            }
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

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    margin: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  projectItem: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  projectName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  projectDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  projectStatus: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});