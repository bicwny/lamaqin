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
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import PageTemplate from '@/components/PageTemplate';
import { DesignSystem } from '@/constants/DesignSystem';

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

      // Get all practices - no filtering, allow multiple projects for same practice
      const { data: allPractices, error: practicesError } = await supabase
        .from('practices')
        .select('*')
        .order('name');

      if (practicesError) throw practicesError;

      console.log('📋 Available practices:', allPractices?.length || 0);
      console.log('🔍 Available practice names:', allPractices?.map(p => p.name) || []);
      setPractices(allPractices || []);
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
    <View style={styles.practiceSection}>
      <Text style={styles.sectionTitle}>选择修行项目</Text>
      <View style={styles.practiceList}>
        {practices.map((practice) => (
          <TouchableOpacity
            key={practice.id}
            style={styles.practiceItem}
            onPress={() => handlePracticeSelect(practice)}
          >
            <View style={styles.practiceInfo}>
              <Text style={styles.practiceName}>
                {practice.name}
              </Text>
              <Text style={styles.practiceType}>
                {practice.type === 'count' ? '计数类' : '计时类'} • {practice.unit}
              </Text>
              {practice.description && (
                <Text style={styles.practiceDescription}>{practice.description}</Text>
              )}
            </View>
            <View style={styles.practiceChevron}>
              <Text style={styles.chevronText}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );



  if (loading) {
    return (
      <PageTemplate
        title="添加修法"
        showBackButton={true}
        onBackPress={() => router.back()}
        scrollable={false}
        backgroundColor={DesignSystem.colors.background}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DesignSystem.colors.primary} />
          <Text style={styles.loadingText}>加载修行项目中...</Text>
        </View>
      </PageTemplate>
    );
  }

  if (practices.length === 0) {
    return (
      <PageTemplate
        title="添加修法"
        showBackButton={true}
        onBackPress={() => router.back()}
        scrollable={false}
        backgroundColor={DesignSystem.colors.background}
      >
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>🔄 加载中...</Text>
          <Text style={styles.emptyDescription}>
            正在加载修行项目
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="添加修法"
      showBackButton={true}
      onBackPress={() => router.back()}
      backgroundColor={DesignSystem.colors.background}
      padding={0}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderPracticeSelector()}
      </ScrollView>
    </PageTemplate>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: DesignSystem.colors.text,
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
    color: DesignSystem.colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: DesignSystem.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: DesignSystem.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  practiceSection: {
    backgroundColor: 'white',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DesignSystem.colors.text,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  practiceList: {
    paddingVertical: 10,
  },
  practiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  practiceInfo: {
    flex: 1,
  },
  practiceName: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignSystem.colors.text,
    marginBottom: 4,
  },
  practiceType: {
    fontSize: 14,
    color: DesignSystem.colors.textSecondary,
    marginBottom: 2,
  },
  practiceDescription: {
    fontSize: 12,
    color: DesignSystem.colors.textSecondary,
  },
  practiceChevron: {
    marginLeft: 12,
  },
  chevronText: {
    fontSize: 20,
    color: '#ccc',
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
    color: DesignSystem.colors.text,
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
    backgroundColor: DesignSystem.colors.primary,
    borderColor: DesignSystem.colors.primary,
  },
  periodButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: DesignSystem.colors.text,
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
    backgroundColor: DesignSystem.colors.surface,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignSystem.colors.text,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: DesignSystem.colors.primary,
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