import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import PageHeader from '@/components/PageHeader';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.container}>
        <PageHeader 
          title="修行追踪"
          subtitle={`欢迎回来，${user?.dharma_name || user?.email || '修行者'}`}
          showBackButton={false}
        />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeEmoji}>🙏</Text>
            <ThemedText style={styles.welcomeTitle}>
              开始您的修行之旅
            </ThemedText>
            <ThemedText style={styles.welcomeText}>
              在这里记录您的修行进展，管理学习课程，追踪冥想时间
            </ThemedText>
          </View>

          <View style={styles.quickActions}>
            <ThemedText style={styles.sectionTitle}>快速开始</ThemedText>

            <View style={styles.actionCard}>
              <Text style={styles.actionEmoji}>📿</Text>
              <View style={styles.actionContent}>
                <ThemedText style={styles.actionTitle}>开始修行</ThemedText>
                <ThemedText style={styles.actionDescription}>
                  记录您的修行项目和时间
                </ThemedText>
              </View>
            </View>

            <View style={styles.actionCard}>
              <Text style={styles.actionEmoji}>📚</Text>
              <View style={styles.actionContent}>
                <ThemedText style={styles.actionTitle}>学习课程</ThemedText>
                <ThemedText style={styles.actionDescription}>
                  浏览和学习佛法课程
                </ThemedText>
              </View>
            </View>

            <View style={styles.actionCard}>
              <Text style={styles.actionEmoji}>🧘</Text>
              <View style={styles.actionContent}>
                <ThemedText style={styles.actionTitle}>冥想练习</ThemedText>
                <ThemedText style={styles.actionDescription}>
                  开始正念冥想练习
                </ThemedText>
              </View>
            </View>

            <View style={styles.actionCard}>
              <Text style={styles.actionEmoji}>📊</Text>
              <View style={styles.actionContent}>
                <ThemedText style={styles.actionTitle}>查看统计</ThemedText>
                <ThemedText style={styles.actionDescription}>
                  了解您的修行进展
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              愿您的修行之路充满智慧与慈悲 🌸
            </ThemedText>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingVertical: 20,
  },
  welcomeEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: Colors.primary,
  },
  welcomeText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: Colors.textSecondary,
    paddingHorizontal: 20,
  },
  quickActions: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: Colors.text,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: Colors.text,
  },
  actionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});