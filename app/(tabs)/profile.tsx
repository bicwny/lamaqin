
<old_str>import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';

export default function ProfileScreen() {
  const [userInfo, setUserInfo] = useState({
    name: '修行者',
    email: 'practitioner@example.com',
    practiceYears: 0,
    totalSessions: 0,
    currentStreak: 0
  });

  const [stats, setStats] = useState({
    totalPractices: 0,
    completedCourses: 0,
    studyHours: 0,
    mindfulDays: 0
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    // Mock data - replace with actual user data from Supabase
    setUserInfo({
      name: '修行菩萨',
      email: 'bodhisattva@dharma.org',
      practiceYears: 3,
      totalSessions: 1247,
      currentStreak: 15
    });

    setStats({
      totalPractices: 25,
      completedCourses: 3,
      studyHours: 156,
      mindfulDays: 89
    });
  };

  const handleExportData = () => {
    Alert.alert(
      '导出数据',
      '选择导出格式',
      [
        { text: '取消', style: 'cancel' },
        { text: 'CSV格式', onPress: () => exportToCSV() },
        { text: 'JSON格式', onPress: () => exportToJSON() }
      ]
    );
  };

  const exportToCSV = () => {
    // Implementation for CSV export
    Alert.alert('成功', 'CSV数据已导出到下载文件夹');
  };

  const exportToJSON = () => {
    // Implementation for JSON export
    Alert.alert('成功', 'JSON数据已导出到下载文件夹');
  };

  const handleBackup = () => {
    Alert.alert(
      '数据备份',
      '将数据备份到云端',
      [
        { text: '取消', style: 'cancel' },
        { text: '确认备份', onPress: () => {
          // Implementation for cloud backup
          Alert.alert('成功', '数据已成功备份到云端');
        }}
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            👤 个人中心
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Personal Profile & Settings
          </ThemedText>
        </ThemedView>

        {/* User Profile */}
        <ThemedView style={styles.section}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>👨‍🦲</Text>
            </View>
            <View style={styles.profileInfo}>
              <ThemedText type="subtitle" style={styles.userName}>
                {userInfo.name}
              </ThemedText>
              <ThemedText style={styles.userEmail}>
                {userInfo.email}
              </ThemedText>
              <ThemedText style={styles.practiceYears}>
                修行年限: {userInfo.practiceYears}年
              </ThemedText>
            </View>
          </View>
          
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>编辑资料</Text>
          </TouchableOpacity>
        </ThemedView>

        {/* Quick Stats */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            修行概览
          </ThemedText>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <ThemedText style={styles.statNumber}>{stats.totalPractices}</ThemedText>
              <ThemedText style={styles.statLabel}>修法项目</ThemedText>
            </View>
            
            <View style={styles.statCard}>
              <ThemedText style={styles.statNumber}>{stats.completedCourses}</ThemedText>
              <ThemedText style={styles.statLabel}>完成课程</ThemedText>
            </View>
            
            <View style={styles.statCard}>
              <ThemedText style={styles.statNumber}>{stats.studyHours}h</ThemedText>
              <ThemedText style={styles.statLabel}>学习时长</ThemedText>
            </View>
            
            <View style={styles.statCard}>
              <ThemedText style={styles.statNumber}>{userInfo.currentStreak}</ThemedText>
              <ThemedText style={styles.statLabel}>连续天数</ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Settings */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            功能设置
          </ThemedText>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🎯</Text>
            <View style={styles.settingContent}>
              <ThemedText style={styles.settingTitle}>主题管理</ThemedText>
              <ThemedText style={styles.settingDesc}>管理修行主题和计划</ThemedText>
            </View>
            <Text style={styles.settingAction}>设置</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🔔</Text>
            <View style={styles.settingContent}>
              <ThemedText style={styles.settingTitle}>提醒设置</ThemedText>
              <ThemedText style={styles.settingDesc}>修行提醒和通知</ThemedText>
            </View>
            <Text style={styles.settingAction}>设置</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🌙</Text>
            <View style={styles.settingContent}>
              <ThemedText style={styles.settingTitle}>外观设置</ThemedText>
              <ThemedText style={styles.settingDesc}>主题色彩和界面设置</ThemedText>
            </View>
            <Text style={styles.settingAction}>设置</Text>
          </TouchableOpacity>
        </ThemedView>

        {/* Data Management */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            数据管理
          </ThemedText>
          
          <TouchableOpacity style={styles.dataButton} onPress={handleExportData}>
            <Text style={styles.dataButtonText}>📤 数据导出</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.dataButton} onPress={handleBackup}>
            <Text style={styles.dataButtonText}>🔄 数据备份</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dataButton}>
            <Text style={styles.dataButtonText}>📊 数据统计</Text>
          </TouchableOpacity>
        </ThemedView>

        {/* Practice Sharing */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            修行分享
          </ThemedText>
          
          <View style={styles.shareCard}>
            <ThemedText style={styles.shareTitle}>📄 今日修行总结</ThemedText>
            <ThemedText style={styles.shareContent}>
              自动生成今日修行记录，方便分享到微信群或朋友圈
            </ThemedText>
            <TouchableOpacity style={styles.shareButton}>
              <Text style={styles.shareButtonText}>生成分享</Text>
            </TouchableOpacity>
          </View>
        </ThemedView>
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
    backgroundColor: Colors.profile,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.surface,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.surface,
    opacity: 0.9,
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
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  practiceYears: {
    fontSize: 14,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  statCard: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.profile,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
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
    marginBottom: 5,
  },
  settingDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
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
    marginBottom: 10,
  },
  shareContent: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 15,
    lineHeight: 20,
  },
  shareButton: {
    backgroundColor: Colors.profile,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  shareButtonText: {
    color: Colors.surface,
    fontWeight: 'bold',
    fontSize: 16,
  },
});</old_str>
<new_str>import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert, Modal, Share } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';

interface UserProfile {
  dharmaName: string;
  practiceYears: number;
  location: string;
  className: string;
}

interface TodaySummary {
  practices: string[];
  studyRecords: string[];
  mindfulnessStats: { good: number; bad: number };
  practiceTime: string;
  completionRate: number;
}

export default function ProfileScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    dharmaName: '多吉丹',
    practiceYears: 3,
    location: '纽约',
    className: '入行班'
  });

  const [showShareModal, setShowShareModal] = useState(false);
  const [todaySummary, setTodaySummary] = useState<TodaySummary | null>(null);

  useEffect(() => {
    loadData();
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

  const handleDataExport = () => {
    Alert.alert(
      '数据导出',
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
      '数据备份',
      '将数据备份到云端',
      [
        { text: '取消', style: 'cancel' },
        { text: '确认备份', onPress: () => Alert.alert('成功', '数据已成功备份到云端') }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            👤 个人中心
          </ThemedText>
        </ThemedView>

        {/* User Profile */}
        <ThemedView style={styles.section}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>👨‍🦲</Text>
            </View>
            <View style={styles.profileInfo}>
              <ThemedText type="subtitle" style={styles.userName}>
                {userProfile.dharmaName}
              </ThemedText>
              <ThemedText style={styles.userDetails}>
                修行年限：{userProfile.practiceYears}年 | 常住：{userProfile.location} | 班级：{userProfile.className}
              </ThemedText>
            </View>
          </View>
          
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>编辑资料</Text>
          </TouchableOpacity>
        </ThemedView>

        {/* Function Settings */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            ⚙️ 功能设置：
          </ThemedText>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>🎯</Text>
            <View style={styles.settingContent}>
              <ThemedText style={styles.settingTitle}>主题管理</ThemedText>
            </View>
            <Text style={styles.settingAction}>设置</Text>
          </TouchableOpacity>
        </ThemedView>

        {/* Data Management */}
        <ThemedView style={styles.section}>
          <TouchableOpacity style={styles.dataButton} onPress={handleDataExport}>
            <Text style={styles.dataButtonText}>📤 数据导出</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.dataButton} onPress={handleDataBackup}>
            <Text style={styles.dataButtonText}>🔄 数据备份</Text>
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
      </ScrollView>

      {/* Share Modal */}
      <Modal visible={showShareModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              📄 修行分享
            </ThemedText>
            
            <ThemedText style={styles.modalSubtitle}>
              📅 {new Date().toLocaleDateString('zh-CN')}修行总结
            </ThemedText>
            
            <View style={styles.sharePreview}>
              <ThemedText style={styles.sharePreviewLabel}>自动生成：</ThemedText>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.surface,
    marginBottom: 5,
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
});</new_str>
