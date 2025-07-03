
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { meditationTopicsService, MeditationTopic } from '@/lib/meditation-topics';

export function MeditationTopicsTest() {
  const [topics, setTopics] = useState<MeditationTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      console.log('🔍 Loading meditation topics...');
      const allTopics = await meditationTopicsService.getAllTopics();
      console.log('📋 Found topics:', allTopics.length);
      setTopics(allTopics);
    } catch (err: any) {
      console.error('❌ Error loading meditation topics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>🔍 Loading meditation topics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>❌ Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        ✅ Meditation Topics ({topics.length}/92)
      </Text>
      
      {topics.length > 0 && (
        <ScrollView style={styles.topicsList}>
          {topics.slice(0, 10).map((topic) => (
            <View key={topic.id} style={styles.topicItem}>
              <Text style={styles.topicNumber}>{topic.topic_number}</Text>
              <Text style={styles.topicTitle}>{topic.title}</Text>
            </View>
          ))}
          {topics.length > 10 && (
            <Text style={styles.moreText}>
              ... and {topics.length - 10} more topics
            </Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    margin: 10,
    borderRadius: 8,
  },
  loading: {
    color: '#666',
    fontSize: 14,
  },
  error: {
    color: '#ff4444',
    fontSize: 14,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 10,
  },
  topicsList: {
    maxHeight: 200,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  topicNumber: {
    width: 30,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginRight: 10,
  },
  topicTitle: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  moreText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
    textAlign: 'center',
  },
});
