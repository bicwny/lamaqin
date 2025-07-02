import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { practiceService } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';

export function PracticeProjectsCheck() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [practices, setPractices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      checkProjects();
    }
  }, [user]);

  const checkProjects = async () => {
    try {
      console.log('🔍 Checking practice projects for user:', user?.email);

      // Get user's practice projects
      const userProjects = await practiceService.getUserPracticeProjects(user!.id);
      console.log('📋 User practice projects:', userProjects);
      setProjects(userProjects);

      // Get all available practices
      const allPractices = await practiceService.getAllPractices();
      console.log('📋 All available practices:', allPractices);
      setPractices(allPractices);

    } catch (err: any) {
      console.error('❌ Error checking practice projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No user logged in</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.testing}>🔍 Checking practice projects...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Practice Projects Debug</Text>
      <Text style={styles.subtitle}>User: {user.email}</Text>

      <Text style={styles.sectionTitle}>User's Practice Projects ({projects.length}):</Text>
      {projects.length === 0 ? (
        <Text style={styles.error}>❌ No practice projects found for this user</Text>
      ) : (
        projects.map((project, index) => (
          <Text key={index} style={styles.item}>
            ✅ {project.practices?.name || 'Unknown'} - Target: {project.daily_target}
          </Text>
        ))
      )}

      <Text style={styles.sectionTitle}>Available Practices ({practices.length}):</Text>
      {practices.slice(0, 5).map((practice, index) => (
        <Text key={index} style={styles.item}>
          • {practice.name} ({practice.type})
        </Text>
      ))}

      {error && <Text style={styles.error}>Error: {error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 10,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  item: {
    fontSize: 12,
    marginLeft: 10,
    marginBottom: 2,
  },
  testing: {
    color: '#ff9800',
    fontSize: 14,
  },
  error: {
    color: '#f44336',
    fontSize: 14,
  },
});