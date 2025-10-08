import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { DesignSystem, createStyles } from '@/constants/DesignSystem';
import { toastService } from '@/lib/toast';
import * as Clipboard from 'expo-clipboard';
import { useTimezone } from '@/hooks/useTimezone';
import { getCurrentDateInTimezone } from '@/lib/timezone';

interface PracticeSummary {
  name: string;
  count?: number;
  sessions?: number;
  unit?: string;
}

export default function SharePracticeModal() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<string>('');
  const { timezoneInfo } = useTimezone();

  useEffect(() => {
    if (user) {
      loadPracticeSummary();
    }
  }, [user]);

  const loadPracticeSummary = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Use timezone-aware date
      const today = timezoneInfo 
        ? getCurrentDateInTimezone(timezoneInfo.timezone)
        : new Date().toISOString().split('T')[0];

      // Get all active practice projects
      const { data: projects, error: projectsError } = await supabase
        .from('user_practice_projects')
        .select(`
          *,
          practices(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: true });

      if (projectsError) throw projectsError;

      const practiceList: PracticeSummary[] = [];

      // Collect count-based practices
      for (const project of projects || []) {
        if (project.practices.type === 'count') {
          const { data: todayRecords, error: recordsError } = await supabase
            .from('daily_records')
            .select('count')
            .eq('user_id', user.id)
            .eq('practice_project_id', project.id)
            .eq('record_date', today);

          if (recordsError) throw recordsError;

          const todayCount = todayRecords?.reduce((sum, record) => sum + record.count, 0) || 0;
          
          if (todayCount > 0) {
            practiceList.push({
              name: project.practices.name,
              count: todayCount,
              unit: project.practices.unit
            });
          }
        }
      }

      // Collect time-based practices (weekly)
      const dayOfWeek = new Date(today + 'T00:00:00').getDay();
      const todayDate = new Date(today + 'T00:00:00');
      const diff = todayDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(todayDate.setDate(diff));
      const weekStart = monday.toISOString().split('T')[0];

      for (const project of projects || []) {
        if (project.practices.type === 'time') {
          const { data: todayRecords, error: recordsError } = await supabase
            .from('meditation_records')
            .select('*')
            .eq('user_id', user.id)
            .eq('practice_id', project.practice_id)
            .eq('record_date', today);

          if (recordsError) throw recordsError;

          const todaySessions = todayRecords?.length || 0;

          if (todaySessions > 0) {
            practiceList.push({
              name: project.practices.name,
              sessions: todaySessions
            });
          }
        }
      }

      // Format the summary
      const formattedSummary = formatPracticeSummary(today, practiceList);
      setSummary(formattedSummary);
    } catch (error) {
      console.error('❌ Error loading practice summary:', error);
      toastService.error({
        title: '加载失败',
        message: '无法加载今日修行总结'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPracticeSummary = (dateStr: string, practices: PracticeSummary[]): string => {
    // Format date as M/D (e.g., 10/7)
    const date = new Date(dateStr + 'T00:00:00');
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Build practice list
    const practiceStrings = practices.map(practice => {
      if (practice.count !== undefined) {
        // Count-based practice
        return `${practice.name}${practice.count}`;
      } else if (practice.sessions !== undefined) {
        // Time-based practice
        return `${practice.name} ${practice.sessions}座`;
      }
      return '';
    }).filter(s => s.length > 0);

    if (practiceStrings.length === 0) {
      return `${month}/${day}:\n当法：今日暂无修行记录`;
    }

    return `${month}/${day}:\n当法：${practiceStrings.join('，')}`;
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(summary);
      toastService.success({
        title: '已复制',
        message: '修行总结已复制到剪贴板'
      });
    } catch (error) {
      console.error('❌ Error copying to clipboard:', error);
      toastService.error({
        title: '复制失败',
        message: '无法复制到剪贴板'
      });
    }
  };

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
          >
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>分享修行</Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={DesignSystem.colors.primary} />
            <Text style={styles.loadingText}>正在生成总结...</Text>
          </View>
        ) : (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>今日修行总结</Text>
            <Text style={styles.hint}>点击下方按钮复制，然后粘贴到WhatsApp分享</Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>{summary}</Text>
            </View>

            <TouchableOpacity 
              style={styles.copyButton}
              onPress={handleCopy}
            >
              <Ionicons name="copy-outline" size={20} color="#fff" style={styles.copyIcon} />
              <Text style={styles.copyButtonText}>复制到剪贴板</Text>
            </TouchableOpacity>

            <Text style={styles.footerHint}>
              💡 复制后，打开WhatsApp粘贴即可分享
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
  },
  headerTitle: {
    ...createStyles.heading('lg') as any,
  },
  closeButton: {
    paddingVertical: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: DesignSystem.spacing.lg,
  },
  sectionTitle: {
    ...createStyles.dharmaTitle('xl') as any,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  hint: {
    ...createStyles.body('sm') as any,
    color: DesignSystem.colors.textTertiary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.xl,
  },
  summaryCard: {
    backgroundColor: DesignSystem.colors.background,
    borderRadius: DesignSystem.borderRadius.md,
    padding: DesignSystem.spacing.xl,
    marginBottom: DesignSystem.spacing.xl,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border,
  },
  summaryText: {
    ...createStyles.body('lg') as any,
    lineHeight: 28,
    color: DesignSystem.colors.textPrimary,
  },
  copyButton: {
    backgroundColor: DesignSystem.colors.primary,
    borderRadius: DesignSystem.borderRadius.md,
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing.lg,
  },
  copyIcon: {
    marginRight: DesignSystem.spacing.sm,
  },
  copyButtonText: {
    ...createStyles.buttonText('primary') as any,
    color: '#fff',
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold as any,
  },
  footerHint: {
    ...createStyles.caption() as any,
    textAlign: 'center',
    color: DesignSystem.colors.textTertiary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignSystem.spacing['4xl'],
    minHeight: 200,
  },
  loadingText: {
    marginTop: DesignSystem.spacing.md,
    ...createStyles.body('base') as any,
    fontWeight: DesignSystem.typography.fontWeight.medium as any,
  },
});
