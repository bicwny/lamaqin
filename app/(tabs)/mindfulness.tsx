` tags.

```xml
<replit_final_file>
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { mindfulnessService } from '@/lib/database';

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

  useEffect(() => {
    loadTodayRecords();
  }, [user]);

  const loadTodayRecords = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const records = await mindfulnessService.getTodayRecords(user.id, today);
      setTodayRecords(records);
    } catch (error) {
      console.error('Error loading mindfulness records:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordMindfulness = async (mindType: 'good' | 'bad') => {
    if (!user) return;

    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
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

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>💝 心性观察</Text>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>💝 心性观察</Text>

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>今日统计</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.good}</Text>
            <Text style={styles.statLabel}>善心</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.bad}</Text>
            <Text style={styles.statLabel}>恶心</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.goodPercent}%</Text>
            <Text style={styles.statLabel}>善心比例</Text>
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
            <Text style={styles.buttonText}>😊 善心</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.recordButton, styles.badButton]}
            onPress={() => recordMindfulness('bad')}
          >
            <Text style={styles.buttonText}>😔 恶心</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.historyCard}>
        <Text style={styles.historyTitle}>今日记录</Text>

        {todayRecords.length === 0 ? (
          <Text style={styles.emptyText}>今天还没有记录</Text>
        ) : (
          todayRecords
            .sort((a, b) => b.record_time.localeCompare(a.record_time))
            .map((record, index) => (
              <View key={index} style={styles.recordItem}>
                <View style={styles.recordHeader}>
                  <Text style={styles.recordTime}>
                    {formatTime(record.record_time)}
                  </Text>
                  <Text style={[
                    styles.recordType,
                    record.mind_type === 'good' ? styles.goodType : styles.badType
                  ]}>
                    {record.mind_type === 'good' ? '😊 善心' : '😔 恶心'}
                  </Text>
                </View>
                {record.description && (
                  <Text style={styles.recordDescription}>
                    {record.description}
                  </Text>
                )}
              </View>
            ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#FFE5E5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  goodFill: {
    height: '100%',
    backgroundColor: '#34C759',
  },
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  recordButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  goodButton: {
    backgroundColor: '#34C759',
  },
  badButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  recordItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 8,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordTime: {
    fontSize: 14,
    color: '#666',
  },
  recordType: {
    fontSize: 14,
    fontWeight: '500',
  },
  goodType: {
    color: '#34C759',
  },
  badType: {
    color: '#FF3B30',
  },
  recordDescription: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
    fontStyle: 'italic',
  },
});