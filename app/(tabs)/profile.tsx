import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert, Modal, Share } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface UserProfile {
  dharmaName: string;
  practiceYears: number;
  location: string;
  className: string;
  email: string;
  registrationDate: string;
}

interface TodaySummary {
  practices: string[];
  studyRecords: string[];
  mindfulnessStats: { good: number; bad: number };
  practiceTime: string;
  completionRate: number;
}

export default function ProfileScreen() {
  const { user, signOut, clearAllCache, loading } = useAuth();
  const router = useRouter();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    dharmaName: '多吉丹',
    practiceYears: 3,
    location: '纽约',
    className: '入行班',
    email: user?.email || '', // Use optional chaining for safety
    registrationDate: '2025-01-01'
  });
  const [showShareModal, setShowShareModal] = useState(false);
  const [todaySummary, setTodaySummary] = useState<TodaySummary | null>(null);

  // Update userProfile email when user changes
  useEffect(() => {
    if (user?.email) {
      setUserProfile(prev => ({ ...prev, email: user.email }));
    }
  }, [user?.email]);

  // Only redirect if explicitly logged out (not during loading)
  useEffect(() => {
    console.log('🔵 Profile useEffect triggered:', {
      user: user?.email || null,
      loading,
      isSigningOut,
      timestamp: new Date().toISOString()
    });

    if (!loading && !user && !isSigningOut) {
      console.log('🔵 Profile: No user found after loading completed, redirecting to login');
      console.log('🔵 Profile: Redirect conditions met - loading:', loading, 'user:', user, 'isSigningOut:', isSigningOut);
      router.replace('/auth/login');
    } else {
      console.log('🔵 Profile: NOT redirecting because:', {
        loading: loading ? 'still loading' : 'loading complete',
        user: user ? 'user exists' : 'no user',
        isSigningOut: isSigningOut ? 'signing out' : 'not signing out'
      });
    }
  }, [user, loading, router, isSigningOut]);

  // Load data effect - moved before conditional return
  useEffect(() => {
    let isMounted = true;

    const loadDataSafely = async () => {
      if (isMounted) {
        await loadData();
      }
    };

    loadDataSafely();

    return () => {
      isMounted = false;
    };
  }, []);

  const goBackToIndex = () => {
    router.push('/(tabs)/study');
  };

  const handleSignOut = () => {
    console.log('🔵 Profile: handleSignOut function called');
    console.log('🔵 Profile: About to show logout modal');
    setShowLogoutModal(true);
    console.log('🔵 Profile: Logout modal state set to true');
  };

  const confirmLogout = async () => {
    console.log('🔵 Profile: User confirmed logout');
    setShowLogoutModal(false);
    setIsSigningOut(true);
    try {
      console.log('🔴 Profile: Starting logout process...');
      await signOut();
      console.log('🔴 Profile: SignOut function completed');

      // Add a longer delay to ensure navigation
      setTimeout(() => {
        console.log('🔴 Profile: Setting isSigningOut to false');
        setIsSigningOut(false);
      }, 500);
    } catch (error) {
      console.error('🔴 Profile: Logout failed:', error);
      Alert.alert('退出失败', '退出登录时发生错误，请重试。');
      setIsSigningOut(false);
    }
  };

  const cancelLogout = () => {
    console.log('🔵 Profile: User cancelled logout');
    setShowLogoutModal(false);
  };

  // Don't render anything if still loading or no user (will redirect via useEffect)
  if (loading || (!user && !isSigningOut)) {
    return null;
  }

  const loadData = async () => {
    // Mock today's summary data
    setTodaySummary({
      practices: [
        '顶礼547',
        '百字明1386',
        '金刚萨埵心咒13334',
        '前行实修法第24座1座',
        '八关斋戒1次',
        '上师瑜伽45分钟',
        '心经3遍',
        '供灯7盏'
      ],
      studyRecords: [
        '《入行》第16课1次'
      ],
      mindfulnessStats: { good: 8, bad: 3 },
      practiceTime: '4小时30分钟',
      completionRate: 100
    });
  };

  const generateShareText = () => {
    if (!todaySummary) return '';

    const today = new Date().toLocaleDateString('zh-CN');
    const practicesText = todaySummary.practices.join('，');
    const studyText = todaySummary.studyRecords.join('，');
    const mindfulness = `观心记录善${todaySummary.mindfulnessStats.good}恶${todaySummary.mindfulnessStats.bad}`;

    return `📅 ${today}修行总结

${userProfile.dharmaName}：${practicesText}，${studyText}，${mindfulness}

🙏 感恩三宝加持，愿以此功德回向法界有情！`;
  };

  const handleShare = async () => {
    const shareText = generateShareText();

    try {
      await Share.share({
        message: shareText,
      });
    } catch (error) {
      Alert.alert('分享失败', '请稍后重试');
    }

    setShowShareModal(false);
  };

  const handleDataExport = () => {
    Alert.alert(
      '📤 数据导出',
      '选择导出格式',
      [
        { text: '取消', style: 'cancel' },
        { text: 'CSV格式', onPress: () => Alert.alert('成功', 'CSV数据已导出') },
        { text: 'JSON格式', onPress: () => Alert.alert('成功', 'JSON数据已导出') }
      ]
    );
  };

  const handleDataBackup = () => {
    Alert.alert(
      '🔄 数据备份',
      '将数据备份到云端',
      [
        { text: '取消', style: 'cancel' },
        { text: '确认备份', onPress: () => Alert.alert('成功', '数据已成功备份到云端') }
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      '清除所有缓存',
      '这将清除所有缓存数据、登录信息和存储。您需要重新登录。确定继续吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '确定清除', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🧹 Cache clear initiated from profile');
              await clearAllCache();
            } catch (error) {
              console.error('Cache clear error:', error);
              Alert.alert('清除失败', '请稍后重试');
            }
          }
        }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={goBackToIndex}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.surface} />
            </TouchableOpacity>
            <ThemedText type="title" style={styles.title}>
              👤 个人中心
            </ThemedText>
            <View style={styles.spacer} />
          </View>
        </ThemedView>

        {/* User Profile */}
        <ThemedView style={styles.section}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>👨‍🦲</Text>
            </View>
            <View style={styles.profileInfo}>
              <ThemedText type="subtitle" style={styles.userName}>
                {userProfile.dharmaName} 🌟
              </ThemedText>
              <ThemedText style={styles.userDetails}>
                修行年限：{userProfile.practiceYears}年 | 常住：{userProfile.location} | 班级：{userProfile.className}
              </ThemedText>
              <ThemedText style={styles.userEmail}>
                邮箱：{userProfile.email}
              </ThemedText>
              <ThemedText style={styles.registrationDate}>
                注册时间：{userProfile.registrationDate}
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Data Management */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            📊 数据管理
          </ThemedText>

          <TouchableOpacity style={styles.dataButton} onPress={handleDataExport}>
            <Text style={styles.dataButtonText}>📤 导出数据</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dataButton} onPress={handleDataBackup}>
            <Text style={styles.dataButtonText}>🔄 备份恢复</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dataButton} onPress={handleClearCache}>
            <Text style={styles.dataButtonText}>🗑️ 清除缓存</Text>
          </TouchableOpacity>
        </ThemedView>

        {/* Practice Sharing */}
        <ThemedView style={styles.section}>
          <View style={styles.shareCard}>
            <ThemedText style={styles.shareTitle}>📄 修行分享</ThemedText>
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={() => setShowShareModal(true)}
            >
              <Text style={styles.shareButtonText}>生成分享</Text>
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Sign Out */}
        <ThemedView style={styles.section}>
          <TouchableOpacity 
            style={[styles.signOutButton, isSigningOut && styles.signOutButtonDisabled]} 
            onPress={() => {
              console.log('🔵 Profile: TouchableOpacity onPress triggered');
              handleSignOut();
            }}
            disabled={isSigningOut}
            activeOpacity={0.7}
          >
            <Text style={styles.signOutText}>
              {isSigningOut ? '正在退出...' : '退出登录'}
            </Text>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>

      {/* Share Modal */}
      <Modal visible={showShareModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              📄 修行分享生成
            </ThemedText>

            <ThemedText style={styles.modalSubtitle}>
              📅 {new Date().toLocaleDateString('zh-CN')}修行总结
            </ThemedText>

            <View style={styles.sharePreview}>
              <ThemedText style={styles.sharePreviewLabel}>🔄 自动生成格式：</ThemedText>
              <ScrollView style={styles.shareTextContainer}>
                <Text style={styles.shareText}>{generateShareText()}</Text>
              </ScrollView>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowShareModal(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={handleShare}
              >
                <Text style={styles.modalButtonText}>复制分享</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.logoutModalContent]}>
            <Text style={styles.logoutModalIcon}>⚠️</Text>
            <ThemedText type="subtitle" style={styles.logoutModalTitle}>
              确认退出
            </ThemedText>
            <ThemedText style={styles.logoutModalMessage}>
              您确定要退出登录吗？{'\n\n'}退出后将无法自动同步修行数据，建议先进行数据备份。
            </ThemedText>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelLogout}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.logoutConfirmButton]}
                onPress={confirmLogout}
              >
                <Text style={styles.logoutConfirmButtonText}>确认退出</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  spacer: {
    width: 40,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    fontSize: 48,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  userDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  registrationDate: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  dataButton: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  dataButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  shareCard: {
    alignItems: 'center',
  },
  shareTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  shareButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signOutButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  signOutText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 28,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  sharePreview: {
    width: '100%',
    marginBottom: 24,
  },
  sharePreviewLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  shareTextContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    maxHeight: 200,
  },
  shareText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 16,
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    minWidth: 90,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ecf0f1',
  },
  cancelButtonText: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: Colors.primary,
  },
  logoutModalContent: {
    alignItems: 'center',
  },
  logoutModalIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  logoutModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  logoutModalMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 28,
    textAlign: 'center',
    lineHeight: 24,
  },
  logoutConfirmButton: {
    backgroundColor: '#e74c3c',
  },
  logoutConfirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  menuItemActive: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  menuItemTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});