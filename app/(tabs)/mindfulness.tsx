
import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';

interface MindState {
  id: string;
  date: string;
  morning_state: 'good' | 'neutral' | 'difficult' | null;
  evening_state: 'good' | 'neutral' | 'difficult' | null;
  gratitude_count: number;
  compassion_practice: boolean;
  notes?: string;
}

interface HeartPractice {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly';
  icon: string;
}

export default function MindfulnessScreen() {
  const [todayState, setTodayState] = useState<MindState | null>(null);
  const [weeklyProgress, setWeeklyProgress] = useState<number[]>([]);
  const [heartPractices, setHeartPractices] = useState<HeartPractice[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadMindfulnessData();
  }, []);

  const loadMindfulnessData = async () => {
    try {
      // Mock data - replace with actual database calls
      setTodayState({
        id: '1',
        date: today,
        morning_state: 'good',
        evening_state: null,
        gratitude_count: 3,
        compassion_practice: true,
        notes: ''
      });

      // Weekly progress (7 days, percentage of good states)
      setWeeklyProgress([80, 60, 90, 70, 85, 75, 65]);

      setHeartPractices([
        {
          id: '1',
          name: '感恩修习',
          description: '每日记录三件感恩的事',
          type: 'daily',
          icon: '🙏'
        },
        {
          id: '2',
          name: '慈悲观修',
          description: '愿众生离苦得乐',
          type: 'daily',
          icon: '❤️'
        },
        {
          id: '3',
          name: '菩提心培养',
          description: '发菩提心，利益众生',
          type: 'weekly',
          icon: '💎'
        },
        {
          id: '4',
          name: '四无量心',
          description: '慈悲喜舍四种心境',
          type: 'weekly',
          icon: '🌟'
        }
      ]);

    } catch (error) {
      console.error('Error loading mindfulness data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMorningState = (state: 'good' | 'neutral' | 'difficult') => {
    setTodayState(prev => prev ? { ...prev, morning_state: state } : null);
  };

  const updateEveningState = (state: 'good' | 'neutral' | 'difficult') => {
    setTodayState(prev => prev ? { ...prev, evening_state: state } : null);
  };

  const addGratitude = () => {
    setTodayState(prev => 
      prev ? { ...prev, gratitude_count: prev.gratitude_count + 1 } : null
    );
  };

  const toggleCompassionPractice = () => {
    setTodayState(prev => 
      prev ? { ...prev, compassion_practice: !prev.compassion_practice } : null
    );
  };

  const getStateColor = (state: string | null) => {
    switch (state) {
      case 'good': return Colors.success;
      case 'neutral': return Colors.warning;
      case 'difficult': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const getStateText = (state: string | null) => {
    switch (state) {
      case 'good': return '良好';
      case 'neutral': return '平静';
      case 'difficult': return '困难';
      default: return '未记录';
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading mindfulness data...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            💝 心性修养
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Heart & Mind Cultivation
          </ThemedText>
        </ThemedView>

        {/* Daily Mind State Tracking */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            今日心境记录
          </ThemedText>
          
          <View style={styles.stateCard}>
            <View style={styles.stateRow}>
              <ThemedText style={styles.stateLabel}>晨起状态:</ThemedText>
              <View style={styles.stateButtons}>
                {['good', 'neutral', 'difficult'].map((state) => (
                  <TouchableOpacity
                    key={state}
                    style={[
                      styles.stateButton,
                      { backgroundColor: todayState?.morning_state === state ? getStateColor(state) : Colors.surface }
                    ]}
                    onPress={() => updateMorningState(state as any)}
                  >
                    <Text style={[
                      styles.stateButtonText,
                      { color: todayState?.morning_state === state ? Colors.surface : Colors.text }
                    ]}>
                      {getStateText(state)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.stateRow}>
              <ThemedText style={styles.stateLabel}>睡前状态:</ThemedText>
              <View style={styles.stateButtons}>
                {['good', 'neutral', 'difficult'].map((state) => (
                  <TouchableOpacity
                    key={state}
                    style={[
                      styles.stateButton,
                      { backgroundColor: todayState?.evening_state === state ? getStateColor(state) : Colors.surface }
                    ]}
                    onPress={() => updateEveningState(state as any)}
                  >
                    <Text style={[
                      styles.stateButtonText,
                      { color: todayState?.evening_state === state ? Colors.surface : Colors.text }
                    ]}>
                      {getStateText(state)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ThemedView>

        {/* Daily Practice Summary */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            今日修心
          </ThemedText>
          
          <View style={styles.practiceCard}>
            <View style={styles.practiceRow}>
              <ThemedText style={styles.practiceLabel}>🙏 感恩记录:</ThemedText>
              <View style={styles.countContainer}>
                <ThemedText style={styles.countText}>{todayState?.gratitude_count || 0} 件</ThemedText>
                <TouchableOpacity style={styles.addButton} onPress={addGratitude}>
                  <Text style={styles.addButtonText}>+1</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.practiceRow}>
              <ThemedText style={styles.practiceLabel}>❤️ 慈悲观修:</ThemedText>
              <TouchableOpacity 
                style={[
                  styles.toggleButton,
                  { backgroundColor: todayState?.compassion_practice ? Colors.success : Colors.textSecondary }
                ]}
                onPress={toggleCompassionPractice}
              >
                <Text style={styles.toggleButtonText}>
                  {todayState?.compassion_practice ? '已完成' : '未完成'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ThemedView>

        {/* Weekly Progress Chart */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            本周心境趋势
          </ThemedText>
          
          <View style={styles.chartCard}>
            <View style={styles.chartContainer}>
              {weeklyProgress.map((progress, index) => (
                <View key={index} style={styles.chartBar}>
                  <View 
                    style={[
                      styles.chartFill,
                      { 
                        height: `${progress}%`,
                        backgroundColor: progress >= 70 ? Colors.success : progress >= 50 ? Colors.warning : Colors.error
                      }
                    ]} 
                  />
                  <ThemedText style={styles.chartLabel}>
                    {['一', '二', '三', '四', '五', '六', '日'][index]}
                  </ThemedText>
                </View>
              ))}
            </View>
            <ThemedText style={styles.chartDescription}>
              本周平均心境良好度: {Math.round(weeklyProgress.reduce((a, b) => a + b, 0) / weeklyProgress.length)}%
            </ThemedText>
          </View>
        </ThemedView>

        {/* Heart Cultivation Practices */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            修心法门
          </ThemedText>
          
          <View style={styles.practicesGrid}>
            {heartPractices.map((practice) => (
              <TouchableOpacity key={practice.id} style={styles.practiceItem}>
                <Text style={styles.practiceIcon}>{practice.icon}</Text>
                <ThemedText style={styles.practiceName}>{practice.name}</ThemedText>
                <ThemedText style={styles.practiceDescription}>{practice.description}</ThemedText>
                <View style={[styles.practiceType, { backgroundColor: practice.type === 'daily' ? Colors.mindfulness : Colors.secondary }]}>
                  <Text style={styles.practiceTypeText}>
                    {practice.type === 'daily' ? '每日' : '每周'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.mindfulness,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.surface,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.surface,
    opacity: 0.9,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: Colors.text,
  },
  stateCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stateRow: {
    marginBottom: 15,
  },
  stateLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.text,
  },
  stateButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  stateButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.textSecondary,
  },
  stateButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  practiceCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  practiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  practiceLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.mindfulness,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addButtonText: {
    color: Colors.surface,
    fontWeight: 'bold',
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  toggleButtonText: {
    color: Colors.surface,
    fontWeight: 'bold',
    fontSize: 14,
  },
  chartCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 120,
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  chartFill: {
    width: '80%',
    borderRadius: 2,
    marginBottom: 5,
  },
  chartLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chartDescription: {
    textAlign: 'center',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  practicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  practiceItem: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  practiceIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  practiceName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: Colors.text,
  },
  practiceDescription: {
    fontSize: 12,
    textAlign: 'center',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  practiceType: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  practiceTypeText: {
    fontSize: 10,
    color: Colors.surface,
    fontWeight: 'bold',
  },
});
