import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import PageTemplate from '@/components/PageTemplate';

export default function StatsScreen() {
  return (
    <PageTemplate
      title="📊 统计分析" 
      subtitle="查看您的修行进展"
      scrollable={false}
      backgroundColor={Colors.background}
    >
      <View style={styles.comingSoonContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="bar-chart-outline" size={80} color="#9CA3AF" />
        </View>
        <Text style={styles.comingSoonTitle}>即将推出</Text>
        <Text style={styles.comingSoonDescription}>
          统计分析功能正在开发中，敬请期待
        </Text>
      </View>
    </PageTemplate>
  );
}

const styles = StyleSheet.create({
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  comingSoonDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});