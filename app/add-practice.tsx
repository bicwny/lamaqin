import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';

interface Practice {
  id: string;
  name: string;
  type: string;
  unit: string;
  description: string;
}

export default function AddPracticeScreen() {
  const { user } = useAuth();
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    loadPractices();
  }, []);

  const loadPractices = async () => {
    try {
      console.log('🔄 Loading available practices...');

      // Get all practices that user doesn't already have
      const { data: allPractices, error: practicesError } = await supabase
        .from('practices')
        .select('*')
        .order('name');

      if (practicesError) throw practicesError;

      // Get user's existing practice projects
      const { data: userProjects, error: projectsError } = await supabase
        .from('user_practice_projects')
        .select('practice_id')
        .eq('user_id', user?.id);

      if (projectsError) throw projectsError;

      // Filter out practices user already has
      const existingPracticeIds = new Set(userProjects?.map(p => p.practice_id) || []);
      const availablePractices = allPractices?.filter(p => !existingPracticeIds.has(p.id)) || [];

      console.log('📋 Available practices:', availablePractices.length);
      console.log('🔍 Available practice names:', availablePractices.map(p => p.name));
      console.log('🚫 Existing practice IDs:', Array.from(existingPracticeIds));
      setPractices(availablePractices);
    } catch (error) {
      console.error('Error loading practices:', error);
      Alert.alert('错误', '加载修行项目失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePracticeSelect = (practice: Practice) => {
    // Navigate to configuration page with practice details
    router.push({
      pathname: '/practice-config',
      params: {
        practiceId: practice.id,
        practiceName: practice.name,
        practiceType: practice.type,
        practiceUnit: practice.unit,
      },
    });
  };

  const renderPracticeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>选择修行项目</Text>
      <ScrollView style={styles.practiceList} showsVerticalScrollIndicator={false}>
        {practices.map((practice) => (
          <TouchableOpacity
            key={practice.id}
            style={[
              styles.practiceCard,
            ]}
            onPress={() => handlePracticeSelect(practice)}
          >
            <Text style={[
              styles.practiceName,
            ]}>
              {practice.name}
            </Text>
            <Text style={styles.practiceType}>
              {practice.type === 'count' ? '计数类' : '计时类'} • {practice.unit}
            </Text>
            {practice.description && (
              <Text style={styles.practiceDescription}>{practice.description}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: '添加修法', headerShown: true }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>加载修行项目中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (practices.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: '添加修法', headerShown: true }} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>😊 您已添加所有修行项目</Text>
          <Text style={styles.emptyDescription}>
            目前没有新的修行项目可以添加
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: '添加修法', headerShown: true }} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderPracticeSelector()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  practiceList: {
    flex: 1,
  },
  practiceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  practiceName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  practiceType: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  practiceDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  configForm: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  selectedPeriodButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  selectedPeriodButtonText: {
    color: 'white',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    backgroundColor: 'white',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});