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
import { DesignSystem } from '@/constants/DesignSystem';
import { ComponentTextStyles, componentHelpers } from '@/utils/componentTokens';
import PageTemplate from '@/components/PageTemplate';

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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...ComponentTextStyles.body,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    marginTop: DesignSystem.spacing.lg,
    color: DesignSystem.colors.textPrimary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignSystem.spacing['4xl'],
  },
  emptyTitle: {
    ...ComponentTextStyles.heading,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.textPrimary,
    marginBottom: DesignSystem.spacing.lg,
    textAlign: 'center',
  },
  emptyDescription: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.textSecondary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing['4xl'],
  },
  backButton: {
    ...componentHelpers.getButtonStyle('primary', 'medium'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    ...componentHelpers.getButtonTextStyle('primary', 'medium'),
  },
  practiceSection: {
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    marginBottom: DesignSystem.spacing.xl,
  },
  sectionTitle: {
    ...ComponentTextStyles.subheading,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.textPrimary,
    marginBottom: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  practiceList: {
    paddingVertical: DesignSystem.spacing.base,
  },
  practiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.borderLight,
  },
  practiceInfo: {
    flex: 1,
  },
  practiceName: {
    ...ComponentTextStyles.body,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.textPrimary,
    marginBottom: DesignSystem.spacing.xs,
  },
  practiceType: {
    ...ComponentTextStyles.label,
    color: DesignSystem.colors.textSecondary,
    marginBottom: DesignSystem.spacing.xs,
  },
  practiceDescription: {
    ...ComponentTextStyles.caption,
    color: DesignSystem.colors.textSecondary,
  },
  practiceChevron: {
    marginLeft: DesignSystem.spacing.md,
  },
  chevronText: {
    fontSize: DesignSystem.typography.fontSize.xl,
    color: DesignSystem.colors.borderLight,
  },
});