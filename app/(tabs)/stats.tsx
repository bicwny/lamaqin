import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

export default function StatsScreen() {
  const handleStartTracking = () => {
    // TODO: Navigate to practice tab or setup
    console.log('Start tracking pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>统计分析</Text>
          <Text style={styles.subtitle}>查看您的修行进展</Text>
        </View>

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
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 500,
  },
  iconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 280,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 40,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  featureContainer: {
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 20,
  },
  features: {
    alignItems: 'stretch',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    minWidth: 200,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
  },
});