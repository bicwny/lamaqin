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
import ConsolidatedDesignSystem from '@/constants/ConsolidatedDesignSystem';
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
        backgroundColor={ConsolidatedDesignSystem.colors["surface-primary"]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ConsolidatedDesignSystem.colors.primary} />
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
        backgroundColor={ConsolidatedDesignSystem.colors["surface-primary"]}
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
      backgroundColor={ConsolidatedDesignSystem.colors["surface-primary"]}
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
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.medium,
    marginTop: ConsolidatedDesignSystem.spacing.lg,
    color: ConsolidatedDesignSystem.colors["text-primary"],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: ConsolidatedDesignSystem.spacing['4xl'],
  },
  emptyTitle: {
    ...ComponentTextStyles.heading,
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold,
    color: ConsolidatedDesignSystem.colors["text-primary"],
    marginBottom: ConsolidatedDesignSystem.spacing.lg,
    textAlign: 'center',
  },
  emptyDescription: {
    ...ComponentTextStyles.body,
    color: ConsolidatedDesignSystem.colors["text-secondary"],
    textAlign: 'center',
    marginBottom: ConsolidatedDesignSystem.spacing['4xl'],
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
    backgroundColor: ConsolidatedDesignSystem.colors["surface-secondary"],
    marginBottom: ConsolidatedDesignSystem.spacing.xl,
  },
  sectionTitle: {
    ...ComponentTextStyles.subheading,
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold,
    color: ConsolidatedDesignSystem.colors["text-primary"],
    marginBottom: ConsolidatedDesignSystem.spacing.md,
    paddingHorizontal: ConsolidatedDesignSystem.spacing.lg,
  },
  practiceList: {
    paddingVertical: ConsolidatedDesignSystem.spacing.base,
  },
  practiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ConsolidatedDesignSystem.spacing.lg,
    paddingVertical: ConsolidatedDesignSystem.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: ConsolidatedDesignSystem.colors["border-default"],
  },
  practiceInfo: {
    flex: 1,
  },
  practiceName: {
    ...ComponentTextStyles.body,
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold,
    color: ConsolidatedDesignSystem.colors["text-primary"],
    marginBottom: ConsolidatedDesignSystem.spacing.xs,
  },
  practiceType: {
    ...ComponentTextStyles.label,
    color: ConsolidatedDesignSystem.colors["text-secondary"],
    marginBottom: ConsolidatedDesignSystem.spacing.xs,
  },
  practiceDescription: {
    ...ComponentTextStyles.caption,
    color: ConsolidatedDesignSystem.colors["text-secondary"],
  },
  practiceChevron: {
    marginLeft: ConsolidatedDesignSystem.spacing.md,
  },
  chevronText: {
    fontSize: ConsolidatedDesignSystem.typography.fontSize.xl,
    color: ConsolidatedDesignSystem.colors["border-default"],
  },
});