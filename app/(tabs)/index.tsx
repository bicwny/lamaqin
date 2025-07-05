import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthStateDebugger } from '@/components/AuthStateDebugger';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const navigateToProfile = () => {
    router.push('/(tabs)/profile');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '🌙 夜深了，早点休息';
    if (hour < 12) return '🌅 早上好，开始今日修行';
    if (hour < 18) return '☀️ 下午好，精进不懈';
    return '🌆 晚上好，回顾今日收获';
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <ThemedText type="title" style={styles.title}>
                🏠 修行主页
              </ThemedText>
              <ThemedText style={styles.greeting}>
                {getGreeting()}
              </ThemedText>
              <ThemedText style={styles.userName}>
                善缘居士 · 修行第365天 🔥
              </ThemedText>
            </View>
            <TouchableOpacity 
              style={styles.profileIcon}
              onPress={navigateToProfile}
            >
              <Ionicons name="person-circle-outline" size={32} color={Colors.surface} />
            </TouchableOpacity>
          </View>
        </ThemedView>
        <AuthStateDebugger />
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
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  profileIcon: {
    padding: 5,
    marginLeft: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.surface,
    marginBottom: 5,
  },
  greeting: {
    fontSize: 16,
    color: Colors.surface,
    opacity: 0.9,
    marginBottom: 5,
  },
  userName: {
    fontSize: 14,
    color: Colors.surface,
    opacity: 0.8,
  },
});