
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import PageHeader from '@/components/PageHeader';
import Avatar from '@/components/Avatar';
import { Colors } from '@/constants/Colors';

interface UserProfile {
  id: string;
  email: string;
  dharma_name?: string;
  location?: string;
  current_class?: string;
  practice_years?: number;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    if (!user?.id) {
      console.log('❌ No user ID available');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Loading profile for user:', user.id);
      
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('❌ Error fetching profile:', fetchError);
        setError('加载个人资料失败');
        return;
      }

      console.log('✅ Profile loaded successfully:', data);
      setProfile(data);
      setError(null);
    } catch (err) {
      console.error('❌ Profile loading error:', err);
      setError('加载个人资料时发生错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const handleSignOut = async () => {
    Alert.alert(
      '确认退出',
      '您确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '退出', 
          style: 'destructive',
          onPress: () => signOut()
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.container}>
          <PageHeader 
            title="个人中心"
            subtitle="管理您的账户信息"
          />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.container}>
          <PageHeader 
            title="个人中心"
            subtitle="管理您的账户信息"
          />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
              <Text style={styles.retryButtonText}>重试</Text>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.container}>
        <PageHeader 
          title="个人中心"
          subtitle="管理您的账户信息"
        />
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <Avatar 
              dharmaName={profile?.dharma_name} 
              size={80} 
            />
            <View style={styles.profileInfo}>
              <ThemedText style={styles.dharmaName}>
                {profile?.dharma_name || '未设置法名'}
              </ThemedText>
              <ThemedText style={styles.email}>
                {profile?.email}
              </ThemedText>
              {profile?.location && (
                <ThemedText style={styles.location}>
                  📍 {profile.location}
                </ThemedText>
              )}
            </View>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Text style={styles.editButtonText}>编辑</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Details */}
          <View style={styles.profileDetails}>
            {profile?.current_class && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>当前班级</Text>
                <Text style={styles.detailValue}>{profile.current_class}</Text>
              </View>
            )}
            
            {profile?.practice_years && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>修行年限</Text>
                <Text style={styles.detailValue}>{profile.practice_years} 年</Text>
              </View>
            )}

            {profile?.bio && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>个人简介</Text>
                <Text style={styles.detailValue}>{profile.bio}</Text>
              </View>
            )}

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>注册时间</Text>
              <Text style={styles.detailValue}>
                {profile?.created_at ? formatDate(profile.created_at) : '未知'}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <Text style={styles.signOutButtonText}>退出登录</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
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
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  dharmaName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#888',
  },
  editButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  profileDetails: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailItem: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
  actionButtons: {
    marginTop: 20,
  },
  signOutButton: {
    backgroundColor: '#e74c3c',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
