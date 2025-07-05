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

  const [userProfile, setUserProfile] = useState<UserProfile>({
    dharmaName: '多吉丹',
    practiceYears: 3,
    location: '纽约',
    className: '入行班',
    email: user.email, // user is guaranteed to exist due to early return
    registrationDate: '2025-01-01'
  });

  const [showShareModal, setShowShareModal] = useState(false);
  const [todaySummary, setTodaySummary] = useState<TodaySummary | null>(null);

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

  const handleEditProfile = () => {
    Alert.alert('功能开发中', '个人资料编辑功能正在开发中');
  };

  const handleNotificationSettings = () => {
    Alert.alert('通知设置', '🔔 通知设置功能正在开发中');
  };

  const handlePracticeGoals = () => {
    Alert.alert('修行目标', '🎯 修行目标设置功能正在开发中');
  };

  const handleThemeManagement = () => {
    Alert.alert('主题管理', '🎯 主题管理功能正在开发中');
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

  const handleChangePassword = () => {
    Alert.alert('修改密码', '🔐 密码修改功能正在开发中');
  };

  const handleChangeEmail = () => {
    console.log('Change email pressed');
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

          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>编辑资料</Text>
          </TouchableOpacity>
        </ThemedView>

        {/* Application Settings */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            ⚙️ 应用设置
          </ThemedText>

          <TouchableOpacity style={styles.settingItem} onPress={handleNotificationSettings}>
            <Text style={styles.settingIcon}>🔔</Text>
            <View style={styles.settingContent}>
              <ThemedText style={styles.settingTitle}>通知设置</ThemedText>
            </View>
            <Text style={styles.settingAction}>></Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handlePracticeGoals}>
            <Text style={styles.settingIcon}>🎯</Text>
            <View style={styles.settingContent}>
              <ThemedText style={styles.settingTitle}>修行目标</ThemedText>
            </View>
            <Text style={styles.settingAction}>></Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🌙</Text>
            <View style={styles.settingContent}>
              <ThemedText style={styles.settingTitle}>夜间模式</ThemedText>
            </View>
            <Text style={styles.settingAction}>关闭</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🌍</Text>
            <View style={styles.settingContent}>
              <ThemedText style={styles.settingTitle}>语言选择</ThemedText>
            </View>
            <Text style={styles.settingAction}>简体中文</Text>
          </TouchableOpacity>
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

        {/* Account Security */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            🔐 账户安全
          </ThemedText>

          <TouchableOpacity style={styles.dataButton} onPress={handleChangePassword}>
            <Text style={styles.dataButtonText}>🔒 修改密码</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dataButton} onPress={handleChangeEmail}>
            <Text style={styles.dataButtonText}>📧 更换邮箱</Text>
          </TouchableOpacity>
        </ThemedView>

        {/* Feature Management */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            🛠️ 功能管理
          </ThemedText>

          <TouchableOpacity style={styles.settingItem} onPress={handleThemeManagement}>
            <Text style={styles.settingIcon}>🎯</Text>
            <View style={styles.settingContent}>
              <ThemedText style={styles.settingTitle}>主题管理</ThemedText>
            </View>
            <Text style={styles.settingAction}>></Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>📚</Text>
            <View style={styles.settingContent}>
              <ThemedText style={styles.settingTitle}>课程管理</ThemedText>
            </View>
            <Text style={styles.settingAction}>></Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>⏰</Text>
            <View style={styles.settingContent}>
              <ThemedText style={styles.settingTitle}>提醒设置</ThemedText>
            </View>
            <Text style={styles.settingAction}>></Text>
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

        {/* Help & Support */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            ❓ 帮助支持
          </ThemedText>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>📖</Text>
            <View style={styles.settingContent}>
              <ThemedText style={styles.settingTitle}>使用指南</ThemedText>
            </View>
            <Text style={styles.settingAction}>></Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>💬</Text>
            <View style={styles.settingContent}>
              <ThemedText style={styles.settingTitle}>意见反馈</ThemedText>
            </View>
            <Text style={styles.settingAction}>></Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>ℹ️</Text>
            <View style={styles.settingContent}>
              <ThemedText style={styles.settingTitle}>关于应用</ThemedText>
            </View>
            <Text style={styles.settingAction}>></Text>
          </TouchableOpacity>
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
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.profile,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.surface,
    flex: 1,
    textAlign: 'center',
  },
  spacer: {
    width: 34, // Same width as back button to center the title
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: Colors.text,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    fontSize: 48,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    color: Colors.text,
    marginBottom: 8,
  },
  userDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  registrationDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  editButton: {
    backgroundColor: Colors.profile,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: Colors.surface,
    fontWeight: 'bold',
    fontSize: 16,
  },
  settingItem: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  settingAction: {
    fontSize: 14,
    color: Colors.profile,
    fontWeight: 'bold',
  },
  dataButton: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.profile,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dataButtonText: {
    fontSize: 16,
    color: Colors.profile,
    fontWeight: 'bold',
  },
  shareCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
  },
  shareButton: {
    backgroundColor: Colors.profile,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  shareButtonText: {
    color: Colors.surface,
    fontWeight: 'bold',
    fontSize: 16,
  },
  signOutButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signOutButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  signOutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  sharePreview: {
    marginBottom: 20,
  },
  sharePreviewLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  shareTextContainer: {
    backgroundColor: Colors.background,
    padding: 15,
    borderRadius: 8,
    maxHeight: 200,
  },
  shareText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    backgroundColor: Colors.profile,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.textSecondary,
  },
  modalButtonText: {
    color: Colors.surface,
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutModalContent: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  logoutModalIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  logoutModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  logoutModalMessage: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  logoutConfirmButton: {
    backgroundColor: '#FF6B6B',
  },
  logoutConfirmButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});