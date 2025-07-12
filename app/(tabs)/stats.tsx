import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import PageHeader from '@/components/PageHeader';

export default function StatsScreen() {
  const handleStartTracking = () => {
    // TODO: Navigate to practice tab or setup
    console.log('Start tracking pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader 
        title="📊 统计分析" 
        subtitle="查看您的修行进展"
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

        <View style={styles.emptyState}>
          <View style={styles.iconContainer}>
            <Ionicons name="bar-chart-outline" size={80} color="#9CA3AF" />
          </View>

          <Text style={styles.emptyTitle}>还没有统计数据</Text>
          <Text style={styles.emptyDescription}>
            开始记录修行和学习，就能看到详细的进展统计了
          </Text>

          <TouchableOpacity style={styles.startButton} onPress={handleStartTracking}>
            <Ionicons name="play" size={24} color="#FFFFFF" />
            <Text style={styles.startButtonText}>开始记录</Text>
          </TouchableOpacity>

          <View style={styles.featureContainer}>
            <Text style={styles.featureTitle}>即将看到的统计：</Text>
            <View style={styles.features}>
              <View style={styles.featureItem}>
                <Ionicons name="trending-up" size={20} color="#059669" />
                <Text style={styles.featureText}>修行进度趋势</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="calendar" size={20} color="#3B82F6" />
                <Text style={styles.featureText}>每日完成情况</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="trophy" size={20} color="#F59E0B" />
                <Text style={styles.featureText}>里程碑成就</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="time" size={20} color="#8B5CF6" />
                <Text style={styles.featureText}>学习时长统计</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});