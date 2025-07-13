
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { mindfulnessService } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import { useTimezone } from '@/hooks/useTimezone';
import { Colors } from '@/constants/Colors';
import PageHeader from '@/components/PageHeader';
import { getCurrentDateInTimezone } from '@/lib/timezone';

interface MindfulnessRecord {
  id: string;
  record_time: string;
  mind_type: 'good' | 'bad';
  description?: string;
}

export default function MindfulnessScreen() {
  const { user } = useAuth();
  const [todayRecords, setTodayRecords] = useState<MindfulnessRecord[]>([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const { timezoneInfo, handleDailyResetCheck } = useTimezone();

  useEffect(() => {
    loadTodayRecords();
    
    // Set up daily reset check
    if (user && timezoneInfo) {
      handleDailyResetCheck(() => {
        console.log('🌅 Daily reset triggered for mindfulness - clearing today\'s records display');
        setTodayRecords([]); // Reset display to show 0/0
        loadTodayRecords(); // Reload from database (should be empty for new day)
      });
    }
  }, [user, timezoneInfo]);

  const loadTodayRecords = async () => {
    if (!user || !timezoneInfo) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Loading mindfulness records for user:', user.id);

      // Use timezone-aware date
      const today = getCurrentDateInTimezone(timezoneInfo.timezone);
      const records = await mindfulnessService.getTodayRecords(user.id, today);

      console.log('💝 Loaded mindfulness records:', records.length);
      setTodayRecords(records);
    } catch (error) {
      console.error('❌ Error loading mindfulness records:', error);
      setTodayRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const recordMindfulness = async (mindType: 'good' | 'bad') => {
    if (!user || !timezoneInfo) return;

    try {
      // Use timezone-aware date and time
      const today = getCurrentDateInTimezone(timezoneInfo.timezone);
      const now = new Date();
      const currentTime = now.toTimeString().split(' ')[0];

      await mindfulnessService.recordMindfulness({
        user_id: user.id,
        record_date: today,
        record_time: currentTime,
        mind_type: mindType,
        description: description.trim() || undefined
      });

      Alert.alert('成功', '心性记录已保存');
      setDescription('');
      loadTodayRecords(); // Refresh data

    } catch (error) {
      console.error('Error recording mindfulness:', error);
      Alert.alert('错误', '保存失败，请重试');
    }
  };

  const getTodayStats = () => {
    const good = todayRecords.filter(r => r.mind_type === 'good').length;
    const bad = todayRecords.filter(r => r.mind_type === 'bad').length;
    const total = good + bad;
    const goodPercent = total > 0 ? Math.round((good / total) * 100) : 0;

    return { good, bad, total, goodPercent };
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM
  };

  const stats = getTodayStats();

  if (loading || !timezoneInfo) {
    return (
      <View style={styles.container}>
        <PageHeader 
          title="心性观察" 
          subtitle="观察内心善恶念头"
        />
        <View style={styles.loadingContainer}>
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PageHeader 
        title="心性观察" 
        subtitle="观察内心善恶念头"
      />
      <ScrollView style={styles.scrollView}>

      {timezoneInfo && (
        <Text style={styles.timezoneDisplay}>
          {timezoneInfo.displayName} • 每日午夜12点重置
        </Text>
      )}

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>今日统计</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.good}</Text>
            <Text style={styles.statLabel}>善心</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.goodPercent}%</Text>
            <Text style={styles.statLabel}>善心比例</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.bad}</Text>
            <Text style={styles.statLabel}>恶心</Text>
          </View>
        </View>

        {stats.total > 0 && (
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.goodFill, 
                { width: `${stats.goodPercent}%` }
              ]} 
            />
          </View>
        )}
      </View>

      <View style={styles.recordCard}>
        <Text style={styles.recordTitle}>记录当前心性</Text>

        <TextInput
          style={styles.descriptionInput}
          placeholder="描述当前的心境或想法（可选）"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.recordButton, styles.goodButton]}
            onPress={() => recordMindfulness('good')}
          >
            <Text style={styles.buttonText}>善心</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.recordButton, styles.badButton]}
            onPress={() => recordMindfulness('bad')}
          >
            <Text style={styles.buttonText}>恶心</Text>
          </TouchableOpacity>
        </View>
      </View>


    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 6,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#FFE5E5',
    borderRadius: 6,
    overflow: 'hidden',
  },
  goodFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  recordTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
    marginBottom: 16,
    textAlign: 'center',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    textAlignVertical: 'top',
    backgroundColor: '#fafafa',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  recordButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  goodButton: {
    backgroundColor: '#10B981',
  },
  badButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  timezoneDisplay: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 12,
  },
});
