
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
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [formData, setFormData] = useState({
    targetCount: '',
    dailyTarget: '',
    targetPeriod: 'daily', // daily or weekly
    targetEndDate: '',
  });
  const [saving, setSaving] = useState(false);

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
    setSelectedPractice(practice);
    
    // Set default values based on practice type
    if (practice.type === 'count') {
      setFormData({
        targetCount: practice.name === '六字大明咒' ? '100000' : '10000',
        dailyTarget: practice.name === '六字大明咒' ? '3000' : '108',
        targetPeriod: 'daily',
        targetEndDate: '',
      });
    } else {
      // For time-based practices
      setFormData({
        targetCount: '92', // Default for meditation practices
        dailyTarget: '2',
        targetPeriod: 'daily',
        targetEndDate: '',
      });
    }
  };

  const handleSave = async () => {
    if (!selectedPractice || !user?.id) {
      Alert.alert('错误', '请选择修行项目');
      return;
    }

    // Validate form data
    if (!formData.targetCount || !formData.dailyTarget) {
      Alert.alert('错误', '请填写完整的目标信息');
      return;
    }

    setSaving(true);
    try {
      console.log('💾 Creating new practice project...');

      // Calculate target end date if not provided
      let targetEndDate = formData.targetEndDate;
      if (!targetEndDate && formData.targetPeriod === 'daily') {
        const days = Math.ceil(parseInt(formData.targetCount) / parseInt(formData.dailyTarget));
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);
        targetEndDate = endDate.toISOString().split('T')[0];
      }

      const { data: newProject, error } = await supabase
        .from('user_practice_projects')
        .insert({
          user_id: user.id,
          practice_id: selectedPractice.id,
          target_count: parseInt(formData.targetCount),
          daily_target: parseInt(formData.dailyTarget),
          target_period: formData.targetPeriod,
          start_date: new Date().toISOString().split('T')[0],
          target_end_date: targetEndDate,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Practice project created successfully:', newProject);
      Alert.alert('成功', '修行项目已添加！', [
        {
          text: '确定',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error creating practice project:', error);
      Alert.alert('错误', '创建修行项目失败，请重试');
    } finally {
      setSaving(false);
    }
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
              selectedPractice?.id === practice.id && styles.selectedPracticeCard
            ]}
            onPress={() => handlePracticeSelect(practice)}
          >
            <Text style={[
              styles.practiceName,
              selectedPractice?.id === practice.id && styles.selectedPracticeName
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

  const renderConfiguration = () => {
    if (!selectedPractice) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>配置目标</Text>
        
        <View style={styles.configForm}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {selectedPractice.type === 'count' ? '总目标数量' : '总目标座数'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.targetCount}
              onChangeText={(text) => setFormData({...formData, targetCount: text})}
              keyboardType="numeric"
              placeholder={selectedPractice.type === 'count' ? '如：100000' : '如：92'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              每日目标 ({selectedPractice.unit})
            </Text>
            <TextInput
              style={styles.input}
              value={formData.dailyTarget}
              onChangeText={(text) => setFormData({...formData, dailyTarget: text})}
              keyboardType="numeric"
              placeholder={selectedPractice.type === 'count' ? '如：3000' : '如：2'}
            />
          </View>

          {selectedPractice.type === 'time' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>目标周期</Text>
              <View style={styles.periodSelector}>
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    formData.targetPeriod === 'daily' && styles.selectedPeriodButton
                  ]}
                  onPress={() => setFormData({...formData, targetPeriod: 'daily'})}
                >
                  <Text style={[
                    styles.periodButtonText,
                    formData.targetPeriod === 'daily' && styles.selectedPeriodButtonText
                  ]}>
                    每日
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    formData.targetPeriod === 'weekly' && styles.selectedPeriodButton
                  ]}
                  onPress={() => setFormData({...formData, targetPeriod: 'weekly'})}
                >
                  <Text style={[
                    styles.periodButtonText,
                    formData.targetPeriod === 'weekly' && styles.selectedPeriodButtonText
                  ]}>
                    每周
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

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
        {renderConfiguration()}
      </ScrollView>

      {selectedPractice && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>取消</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.disabledButton]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>添加修法</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
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
    maxHeight: 300,
  },
  practiceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPracticeCard: {
    borderColor: Colors.primary,
  },
  practiceName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  selectedPracticeName: {
    color: Colors.primary,
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
