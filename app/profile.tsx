import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { DesignSystem } from '@/constants/DesignSystem';
import PageTemplate from '@/components/PageTemplate';
import { ThemedText } from '@/components/ThemedText';
import Avatar from '@/components/Avatar';
import { Ionicons } from '@expo/vector-icons';

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

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (fetchError) {
        console.error('❌ Error fetching profile:', fetchError);
        console.error('❌ Error details:', {
          code: fetchError.code,
          message: fetchError.message,
          details: fetchError.details
        });

        // Check if it's a network/timeout error vs data error
        if (fetchError.code === '23503' || fetchError.message?.includes('timeout') || 
            fetchError.message?.includes('network') || fetchError.message?.includes('fetch')) {
          setError('网络连接异常，使用本地数据');
        } else {
          setError('数据加载失败，使用本地数据');
        }

        // Use fallback data from user auth context
        const fallbackProfile = {
          id: user.id,
          email: user.email,
          dharma_name: user.dharma_name || '未设置法名',
          location: null,
          current_class: null,
          practice_years: null,
          bio: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProfile(fallbackProfile);
        return;
      }

      console.log('✅ Profile loaded successfully:', data);
      setProfile(data);
      setError(null);
    } catch (err: any) {
      console.error('❌ Profile loading error:', err);
      console.error('❌ Error type:', err.name, 'Message:', err.message);

      // Determine error type for better user feedback
      let errorMessage = '网络连接异常，使用本地数据';
      if (err.name === 'AbortError') {
        errorMessage = '请求超时，使用本地数据';
      } else if (err.message?.includes('Failed to fetch')) {
        errorMessage = '网络连接失败，使用本地数据';
      }

      setError(errorMessage);

      // Use fallback data from user auth context
      const fallbackProfile = {
        id: user.id,
        email: user.email,
        dharma_name: user.dharma_name || '未设置法名',
        location: null,
        current_class: null,
        practice_years: null,
        bio: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setProfile(fallbackProfile);
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
    try {
      await signOut();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <PageTemplate
        title="个人中心"
        subtitle="正在加载..."
        showBackButton={true}
        onBackPress={() => router.back()}
        scrollable={false}
        backgroundColor={DesignSystem.colors.background}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DesignSystem.colors.primary} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </PageTemplate>
    );
  }

  if (error && !profile) {
    return (
      <PageTemplate
        title="个人中心"
        subtitle="加载失败"
        showBackButton={true}
        onBackPress={() => router.back()}
        scrollable={false}
        backgroundColor={DesignSystem.colors.background}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="个人中心"
      subtitle="管理您的账户信息"
      showBackButton={true}
      onBackPress={() => router.back()}
      scrollable={true}
      backgroundColor={DesignSystem.colors.background}
      padding={0}
    >
          {/* Network Error Banner */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
              <TouchableOpacity onPress={loadProfile} style={styles.retryButtonSmall}>
                <Text style={styles.retryButtonSmallText}>重试</Text>
              </TouchableOpacity>
            </View>
          )}

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
              <Text style={styles.detailLabel}>加入时间</Text>
              <Text style={styles.detailValue}>
                {new Date(profile?.created_at || '').toLocaleDateString('zh-CN')}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
              <Ionicons name="person-outline" size={24} color={DesignSystem.colors.primary} />
              <Text style={styles.actionButtonText}>编辑个人资料</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="settings-outline" size={24} color={DesignSystem.colors.primary} />
              <Text style={styles.actionButtonText}>设置</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="help-circle-outline" size={24} color={DesignSystem.colors.primary} />
              <Text style={styles.actionButtonText}>帮助与支持</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.signOutButton]} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
              <Text style={[styles.actionButtonText, styles.signOutText]}>退出登录</Text>
            </TouchableOpacity>
          </View>
        </PageTemplate>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: DesignSystem.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: DesignSystem.colors.primary,
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
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  dharmaName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  email: {
    fontSize: 14,
    color: DesignSystem.colors.textSecondary,
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: DesignSystem.colors.textSecondary,
  },
  editButton: {
    backgroundColor: DesignSystem.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  profileDetails: {
    backgroundColor: 'white',
    paddingVertical: 10,
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: DesignSystem.colors.textPrimary,
  },
  detailValue: {
    fontSize: 16,
    color: DesignSystem.colors.textSecondary,
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  actionSection: {
    backgroundColor: 'white',
    paddingVertical: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButtonText: {
    fontSize: 16,
    color: DesignSystem.colors.textPrimary,
    marginLeft: 12,
    flex: 1,
  },
  signOutButton: {
    borderBottomWidth: 0,
  },
  signOutText: {
    color: '#FF3B30',
  },
  errorBanner: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorBannerText: {
    fontSize: 14,
    color: '#856404',
    flex: 1,
  },
  retryButtonSmall: {
    backgroundColor: DesignSystem.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  retryButtonSmallText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});