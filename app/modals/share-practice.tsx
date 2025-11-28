import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem, createStyles } from '@/constants/DesignSystem';
import { toastService } from '@/lib/toast';
import * as Clipboard from 'expo-clipboard';
import { useTimezone } from '@/hooks/useTimezone';
import { getCurrentDateInTimezone } from '@/lib/timezone';
import ModalTemplate from '@/components/ModalTemplate';

interface PracticeSummary {
  name: string;
  count?: number;
  sessions?: number;
  unit?: string;
}

export default function SharePracticeModal() {
  const { user } = useAuth();
  const { shareDate } = useLocalSearchParams<{ shareDate?: string }>();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<string>('');
  const [dharmaName, setDharmaName] = useState<string>('');
  const [dateTitle, setDateTitle] = useState<string>('');
  const { timezoneInfo, loading: timezoneLoading } = useTimezone();

  useEffect(() => {
    // Wait for both user AND timezone to be ready
    if (user && !timezoneLoading && timezoneInfo) {
      loadPracticeSummary();
    }
  }, [user, timezoneInfo, timezoneLoading]);

  const loadPracticeSummary = async () => {
    if (!user || !timezoneInfo) return;

    try {
      setLoading(true);

      // Use provided date or timezone-aware today's date
      const targetDate = shareDate || getCurrentDateInTimezone(timezoneInfo.timezone);

      console.log('📅 Share modal - User timezone:', timezoneInfo.timezone);
      console.log('📅 Share modal - Target date:', targetDate);

      // Get user's dharma name
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('dharma_name')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;
      
      const userDharmaName = userData?.dharma_name || '修行者';
      setDharmaName(userDharmaName);

      // Set date title - parse the target date
      const date = new Date(targetDate + 'T12:00:00'); // Use noon to avoid timezone edge cases
      const month = date.getMonth() + 1;
      const day = date.getDate();
      setDateTitle(`${month}/${day}修行总结`);

      const practiceList: PracticeSummary[] = [];

      // Query daily_records directly - this includes records from all projects (active or not)
      const { data: dailyRecords, error: dailyError } = await supabase
        .from('daily_records')
        .select(`
          count,
          user_practice_projects!inner (
            practices (
              name,
              unit,
              type
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('record_date', targetDate);

      if (dailyError) throw dailyError;

      // Aggregate count-based practices by name
      const countPractices: { [name: string]: { count: number; unit: string } } = {};
      for (const record of dailyRecords || []) {
        const practice = (record.user_practice_projects as any)?.practices;
        if (practice && practice.type === 'count') {
          const name = practice.name;
          if (!countPractices[name]) {
            countPractices[name] = { count: 0, unit: practice.unit };
          }
          countPractices[name].count += record.count;
        }
      }

      // Add count practices to the list
      for (const [name, data] of Object.entries(countPractices)) {
        if (data.count > 0) {
          practiceList.push({
            name,
            count: data.count,
            unit: data.unit
          });
        }
      }

      // Query meditation_records directly - this includes records from all projects (active or not)
      const { data: meditationRecords, error: meditationError } = await supabase
        .from('meditation_records')
        .select(`
          id,
          practices (
            name,
            type
          )
        `)
        .eq('user_id', user.id)
        .eq('record_date', targetDate);

      if (meditationError) throw meditationError;

      // Aggregate time-based practices by name
      const timePractices: { [name: string]: number } = {};
      for (const record of meditationRecords || []) {
        const practice = record.practices as any;
        if (practice && practice.type === 'time') {
          const name = practice.name;
          if (!timePractices[name]) {
            timePractices[name] = 0;
          }
          timePractices[name] += 1;
        }
      }

      // Add time practices to the list
      for (const [name, sessions] of Object.entries(timePractices)) {
        if (sessions > 0) {
          practiceList.push({
            name,
            sessions
          });
        }
      }

      // Format the summary
      const formattedSummary = formatPracticeSummary(userDharmaName, practiceList);
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

  const formatPracticeSummary = (dharmaName: string, practices: PracticeSummary[]): string => {
    // Build practice list
    const practiceStrings = practices.map(practice => {
      if (practice.count !== undefined) {
        // Count-based practice - just name + number
        return `${practice.name}${practice.count}`;
      } else if (practice.sessions !== undefined) {
        // Time-based practice - just name + number (no "座")
        return `${practice.name}${practice.sessions}`;
      }
      return '';
    }).filter(s => s.length > 0);

    if (practiceStrings.length === 0) {
      return `${dharmaName}：今日暂无修行记录`;
    }

    return `${dharmaName}：${practiceStrings.join('，')}`;
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
    <ModalTemplate
      title="分享修行"
      onClose={handleClose}
      scrollable={true}
      backgroundColor={DesignSystem.colors.backgroundSecondary}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DesignSystem.colors.primary} />
          <Text style={styles.loadingText}>正在生成总结...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>{dateTitle}</Text>
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

          <View style={styles.dedicationContainer}>
            <Text style={styles.dedicationText}>
              所南德义檀嘉热巴涅    此福已得一切智{'\n'}
              托内尼波札南潘协将    摧伏一切过患敌{'\n'}
              杰嘎纳齐瓦隆彻巴耶    生老病死犹波涛{'\n'}
              哲波措利卓瓦卓瓦效    愿度有海诸有情
            </Text>
            
            <Text style={styles.dedicationText}>
              文殊师利勇猛智  普贤慧行亦复然{'\n'}
              我今回向诸善根  随彼一切常修学{'\n'}
              三世诸佛所称叹  如是最胜诸大愿{'\n'}
              我今回向诸善根  为得普贤殊胜行{'\n'}
              生生世世不离师  恒时享用盛法乐{'\n'}
              圆满地道功德已  唯愿速得金刚持
            </Text>
          </View>
        </View>
      )}
    </ModalTemplate>
  );
}

const styles = StyleSheet.create({
  content: {
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
  dedicationContainer: {
    marginTop: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.lg,
    paddingHorizontal: DesignSystem.spacing.md,
  },
  dedicationText: {
    ...createStyles.body('sm') as any,
    color: DesignSystem.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: DesignSystem.spacing.md,
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
