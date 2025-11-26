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

          {/* Profile Details - Only show if there are details to display */}
          {(profile?.current_class || profile?.practice_years || profile?.bio) && (
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
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
              <Ionicons name="person-outline" size={24} color={DesignSystem.colors.primary} />
              <Text style={styles.actionButtonText}>编辑个人资料</Text>
              <Ionicons name="chevron-forward" size={20} color={DesignSystem.colors.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.signOutButton]} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={24} color={DesignSystem.colors.error} />
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
    marginTop: DesignSystem.spacing.lg,
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignSystem.spacing.xl,
  },
  errorText: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.error,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.xl,
  },
  retryButton: {
    ...DesignSystem.components.button.primary,
  },
  retryButtonText: {
    color: DesignSystem.colors.textInverse,
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    ...DesignSystem.components.card.standard,
    marginTop: DesignSystem.spacing.lg,
    // Card padding is appropriate here since it's a single content block
  },
  profileInfo: {
    flex: 1,
    marginLeft: DesignSystem.spacing.lg,
  },
  dharmaName: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    marginBottom: DesignSystem.spacing.xs,
    color: DesignSystem.colors.textPrimary,
  },
  email: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.textSecondary,
    marginBottom: DesignSystem.spacing.xs,
  },
  location: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.textSecondary,
  },
  profileDetails: {
    ...DesignSystem.components.card.standard,
    padding: 0, // Remove card padding for list-style rows
    paddingVertical: DesignSystem.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingVertical: DesignSystem.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.borderLight,
  },
  detailLabel: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.textPrimary,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  detailValue: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.textSecondary,
    flex: 1,
    textAlign: 'right',
    marginLeft: DesignSystem.spacing.lg,
  },
  actionSection: {
    ...DesignSystem.components.card.standard,
    padding: 0, // Remove card padding for list-style rows
    paddingVertical: DesignSystem.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingVertical: DesignSystem.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.borderLight,
  },
  actionButtonText: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.textPrimary,
    marginLeft: DesignSystem.spacing.md,
    flex: 1,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  signOutButton: {
    borderBottomWidth: 0,
  },
  signOutText: {
    color: DesignSystem.colors.error,
  },
  errorBanner: {
    backgroundColor: DesignSystem.colors.warning + '20',
    borderColor: DesignSystem.colors.warning,
    borderWidth: 1,
    borderRadius: DesignSystem.borderRadius.md,
    padding: DesignSystem.spacing.md,
    marginHorizontal: DesignSystem.spacing.lg,
    marginVertical: DesignSystem.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorBannerText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.textPrimary,
    flex: 1,
  },
  retryButtonSmall: {
    backgroundColor: DesignSystem.colors.primary,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.xxs,
    borderRadius: DesignSystem.borderRadius.sm,
    marginLeft: DesignSystem.spacing.sm,
  },
  retryButtonSmallText: {
    color: DesignSystem.colors.textInverse,
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
});