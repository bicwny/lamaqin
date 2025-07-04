import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { practiceService, dailyRecordService } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';


interface PracticeProject {
  id: string;
  practice_id: string;
  target_count: number;
  current_count: number;
  daily_target: number;
  target_period?: 'daily' | 'weekly';
  practices: {
    id: string;
    name: string;
    type: 'count' | 'time';
    unit: string;
    description?: string;
  };
}

interface Practice {
  id: string;
  name: string;
  type: 'count' | 'time';
  unit: string;
  description?: string;
}

interface MeditationSession {
  duration: string;
  method: string;
  sessionNumber: number;
  reflection?: string; // 🆕 观后感字段
}

export default function PracticeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [practiceProjects, setPracticeProjects] = useState<PracticeProject[]>([]);
  const [todayRecords, setTodayRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Practice selection states
  const [showPracticeListModal, setShowPracticeListModal] = useState(false);
  const [showGoalSettingModal, setShowGoalSettingModal] = useState(false);
  const [availablePractices, setAvailablePractices] = useState<Practice[]>([]);
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [addingPractice, setAddingPractice] = useState(false);

  // Goal setting form states
  const [totalTarget, setTotalTarget] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('100');
  const [customDuration, setCustomDuration] = useState('');
  const [endDate, setEndDate] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('weekly');
  const [sessionsPerPeriod, setSessionsPerPeriod] = useState('');

  // Count recording states
  const [showCountModal, setShowCountModal] = useState(false);
  const [selectedProjectForCount, setSelectedProjectForCount] = useState<PracticeProject | null>(null);
  const [customCount, setCustomCount] = useState('');
  const [recordingCount, setRecordingCount] = useState(false);

  useEffect(() => {
    loadPracticeData();
  }, [user]);

  // Refresh data when the page gains focus (user returns from meditation record page)
  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        console.log('🔄 Practice page gained focus, refreshing data...');
        loadPracticeData();
      }
    }, [user?.id])
  );

  const getCurrentPeriodMeditationDetails = async (projectId: string, practiceId: string, targetPeriod: 'daily' | 'weekly') => {
    if (!user?.id) return [];

    try {
      console.log('🔍 Getting meditation details for:', { projectId, practiceId, targetPeriod, userId: user.id });

      const today = new Date();
      let startDate: string;
      let endDate: string;

      if (targetPeriod === 'weekly') {
        // Get current week (Monday to Sunday)
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Handle Sunday (0)
        const monday = new Date(today);
        monday.setDate(today.getDate() + mondayOffset);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        startDate = monday.toISOString().split('T')[0];
        endDate = sunday.toISOString().split('T')[0];

        console.log('📅 Weekly period:', { startDate, endDate });
      } else {
        // Daily: just today
        startDate = today.toISOString().split('T')[0];
        endDate = startDate;

        console.log('📅 Daily period:', { startDate, endDate });
      }

      // Get all meditation records for current period (no duration limit)
      const { data, error } = await supabase
        .from('meditation_records')
        .select('duration_minutes, session_number, method, record_date, created_at')
        .eq('user_id', user.id)
        .eq('practice_id', practiceId)
        .gte('record_date', startDate)
        .lte('record_date', endDate)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error querying meditation records:', error);
        throw error;
      }

      console.log('📊 Found meditation records:', data?.length || 0);
      console.log('📋 Records details:', data);

      return data || [];
    } catch (error) {
      console.error('❌ Error getting meditation details:', error);
      return [];
    }
  };

  const loadPracticeData = async () => {
    if (!user?.id) return;

    try {
      console.log('🔄 Loading practice data for user:', user.id);

      const projects = await practiceService.getUserPracticeProjects(user.id);
      console.log('📋 User practice projects:', projects);
      console.log('📋 Loaded practice projects:', projects.length);
      setPracticeProjects(projects);

      const today = new Date().toISOString().split('T')[0];
      
      // For count-based practices, get daily records
      const records = await dailyRecordService.getTodayRecords(user.id, today);
      console.log('📅 Loaded today daily records:', records.length);

      // Convert records array to object for easier access
      const recordsMap = records.reduce((acc, record) => {
        acc[record.practice_project_id] = record.count;
        return acc;
      }, {});

      // For time-based practices, get meditation session counts
      for (const project of projects) {
        if (project.practices.type === 'time') {
          try {
            let startDate = today;
            let endDate = today;

            // For weekly practices, get current week data
            if (project.target_period === 'weekly') {
              const todayDate = new Date();
              const dayOfWeek = todayDate.getDay();
              const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Handle Sunday (0)
              const monday = new Date(todayDate);
              monday.setDate(todayDate.getDate() + mondayOffset);

              const sunday = new Date(monday);
              sunday.setDate(monday.getDate() + 6);

              startDate = monday.toISOString().split('T')[0];
              endDate = sunday.toISOString().split('T')[0];
            }

            // Count meditation sessions for the period
            const { data: sessionCount } = await supabase
              .from('meditation_records')
              .select('id', { count: 'exact' })
              .eq('user_id', user.id)
              .eq('practice_id', project.practice_id)
              .gte('record_date', startDate)
              .lte('record_date', endDate);

            recordsMap[project.id] = sessionCount || 0;
            console.log(`📊 ${project.practices.name} sessions (${project.target_period}):`, sessionCount);
          } catch (error) {
            console.error(`❌ Error loading sessions for ${project.practices.name}:`, error);
            recordsMap[project.id] = 0;
          }
        }
      }

      setTodayRecords(recordsMap);
      console.log('📊 Final records map:', recordsMap);
    } catch (error) {
      console.error('Error loading practice data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailablePractices = async () => {
    try {
      console.log('🔄 Loading available practices...');
      const practices = await practiceService.getAllPractices();
      console.log('📿 Loaded practices:', practices.length);
      setAvailablePractices(practices);
    } catch (error) {
      console.error('Error loading practices:', error);
      Alert.alert('错误', '加载修法列表失败');
    }
  };

  // Meditation topics loading moved to full-screen page

  // Meditation recording states (removed - now handled by full-screen page)

  const handleRecordPractice = async (projectId: string, amount: number) => {
    if (!user?.id) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      await dailyRecordService.recordPractice(user.id, projectId, amount, today);
      await loadPracticeData();
      Alert.alert('成功', `已记录 ${amount} 次修行`);
    } catch (error) {
      console.error('Error recording practice:', error);
      Alert.alert('错误', '记录修行失败');
    }
  };

  const handleCustomRecord = async (project: PracticeProject) => {
    console.log('🔄 handleCustomRecord called with project:', project.id, project.practices.name);

    if (project.practices.type === 'time') {
      // For meditation/time-based practices, navigate to full-screen page
      router.push({
        pathname: '/modals/meditation-record',
        params: {
          practiceId: project.practice_id,
          practiceProjectId: project.id,
          practiceName: project.practices.name
        }
      });
    } else {
      // For count-based practices, show the custom count modal
      setSelectedProjectForCount(project); // Set the correct state for count
      setShowCountModal(true);
      setCustomCount(''); // Reset the custom count
    }
  };

  // Meditation session management moved to full-screen page

  const handleSelectIndividualPractice = async () => {
    await loadAvailablePractices();
    setShowAddModal(false);
    setShowPracticeListModal(true);
  };

  const handlePracticeSelected = (practice: Practice) => {
    setSelectedPractice(practice);
    setShowPracticeListModal(false);

    // Reset form states
    setTotalTarget('');
    setSessionsPerPeriod('');
    setDuration('100');
    setCustomDuration('');
    setEndDate('');
    setFrequency('weekly');

    setShowGoalSettingModal(true);
  };

  const calculateProjectParams = () => {
    if (!selectedPractice) return null;

    const start = new Date(startDate);
    let targetEndDate: string;
    let durationDays: number;

    if (duration === 'custom') {
      if (endDate) {
        // Use user-provided end date
        targetEndDate = endDate;
        const end = new Date(endDate);
        durationDays = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
      } else {
        // Fallback to custom duration in days
        durationDays = parseInt(customDuration) || 100;
        const end = new Date(start);
        end.setDate(start.getDate() + durationDays);
        targetEndDate = end.toISOString().split('T')[0];
      }
    } else {
      durationDays = parseInt(duration);
      const end = new Date(start);
      end.setDate(start.getDate() + durationDays);
      targetEndDate = end.toISOString().split('T')[0];
    }

    if (selectedPractice.type === 'count') {
      const total = parseInt(totalTarget);
      const dailyTarget = Math.ceil(total / durationDays);

      return {
        target_count: total,
        daily_target: dailyTarget,
        start_date: startDate,
        target_end_date: targetEndDate,
        target_period: 'daily'
      };
    } else {
      // time type
      const sessions = parseInt(sessionsPerPeriod);
      let totalPeriods: number;

      if (frequency === 'daily') {
        totalPeriods = durationDays;
      } else {
        totalPeriods = Math.ceil(durationDays / 7);
      }

      const totalTargetSessions = sessions * totalPeriods;

      return {
        target_count: totalTargetSessions,
        daily_target: sessions,
        start_date: startDate,
        target_end_date: targetEndDate,
        target_period: frequency
      };
    }
  };

  const handleAddIndividualPractice = async () => {
    if (!user?.id || !selectedPractice) {
      Alert.alert('提示', '请选择修法');
      return;
    }

    // Validate based on practice type
    if (selectedPractice.type === 'count') {
      if (!totalTarget) {
        Alert.alert('提示', '请输入目标数量');
        return;
      }
      const target = parseInt(totalTarget);
      if (isNaN(target) || target <= 0) {
        Alert.alert('提示', '请输入有效的目标数量');
        return;
      }
    } else {
      if (!sessionsPerPeriod) {
        Alert.alert('提示', '请输入每期座数');
        return;
      }
      const sessions = parseInt(sessionsPerPeriod);
      if (isNaN(sessions) || sessions <= 0) {
        Alert.alert('提示', '请输入有效的座数');
        return;
      }
    }

    if (duration === 'custom' && !endDate && !customDuration) {
      Alert.alert('提示', '请输入结束日期或自定义持续时间');
      return;
    }

    const projectParams = calculateProjectParams();
    if (!projectParams) {
      Alert.alert('错误', '计算参数失败');
      return;
    }

    setAddingPractice(true);
    try {
      await practiceService.createUserPracticeProject(
        user.id,
        selectedPractice.id,
        projectParams.target_count,
        projectParams.daily_target,
        projectParams.start_date,
        projectParams.target_end_date,
        projectParams.target_period
      );

      Alert.alert('成功', `已添加${selectedPractice.name}到修行计划`);

      // Reset state and reload data
      setSelectedPractice(null);
      setTotalTarget('');
      setSessionsPerPeriod('');
      setShowGoalSettingModal(false);
      await loadPracticeData();
    } catch (error) {
      console.error('Error adding practice:', error);
      Alert.alert('错误', '添加修行失败');
    } finally {
      setAddingPractice(false);
    }
  };

  const renderGoalSettingForm = () => {
    if (!selectedPractice) return null;

    return (
      <View>
        <Text style={styles.modalTitle}>
          🎯 设置"{selectedPractice.name}"的目标
        </Text>

        {selectedPractice.type === 'count' ? (
          // Count type form
          <View>
            <Text style={styles.modalSubtitle}>您的修行总目标是多少？</Text>
            <View style={styles.goalInputContainer}>
              <TextInput
                style={styles.goalInput}
                value={totalTarget}
                onChangeText={setTotalTarget}
                keyboardType="numeric"
                placeholder="请输入总数"
              />
              <Text style={styles.goalUnit}>{selectedPractice.unit}</Text>
            </View>
          </View>
        ) : (
          // Time type form
          <View>
            <Text style={styles.modalSubtitle}>您的修行频率是？</Text>
            <View style={styles.frequencyContainer}>
              <Picker
                selectedValue={frequency}
                onValueChange={setFrequency}
                style={styles.frequencyPicker}
              >
                <Picker.Item label="每天" value="daily" />
                <Picker.Item label="每周" value="weekly" />
              </Picker>
              <Text style={styles.frequencyLabel}>完成</Text>
              <TextInput
                style={styles.sessionsInput}
                value={sessionsPerPeriod}
                onChangeText={setSessionsPerPeriod}
                keyboardType="numeric"
                placeholder="座数"
              />
              <Text style={styles.frequencyLabel}>座</Text>
            </View>
          </View>
        )}

        {/* Duration section for both types */}
        <View style={styles.durationSection}>
          <Text style={styles.durationLabel}>您计划在多长时间内完成？</Text>

          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>开始时间：</Text>
            <Text style={styles.dateValue}>{startDate}</Text>
          </View>

          <View style={styles.durationContainer}>
            <Text style={styles.durationLabel}>持续时间：</Text>
            <Picker
              selectedValue={duration}
              onValueChange={setDuration}
              style={styles.durationPicker}
            >
              <Picker.Item label="30天" value="30" />
              <Picker.Item label="60天" value="60" />
              <Picker.Item label="100天" value="100" />
              <Picker.Item label="365天" value="365" />
              <Picker.Item label="自定义" value="custom" />
            </Picker>
          </View>

          {duration === 'custom' && (
            <View style={styles.customDurationContainer}>
              <Text style={styles.customDurationLabel}>选择结束方式：</Text>

              <View style={styles.endDateOption}>
                <Text style={styles.endDateLabel}>结束日期：</Text>
                <TextInput
                  style={styles.endDateInput}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="2025-07-03"
                />
              </View>

              <Text style={styles.orText}>或</Text>

              <View style={styles.durationOption}>
                <TextInput
                  style={styles.customDurationInput}
                  value={customDuration}
                  onChangeText={setCustomDuration}
                  keyboardType="numeric"
                  placeholder="输入天数"
                />
                <Text style={styles.customDurationLabel}>天</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
  };

  const handleCustomCountRecorded = async () => {
    if (!user?.id || !selectedProjectForCount) return;

    const amount = parseInt(customCount || '0');
    if (amount > 0) {
      setShowCountModal(false);
      await handleRecordPractice(selectedProjectForCount.id, amount);
    } else {
      Alert.alert('提示', '请输入有效的数量');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📿 修行记录</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      ) : practiceProjects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📿</Text>
          <Text style={styles.emptyTitle}>开始您的修行之旅</Text>
          <Text style={styles.emptySubtitle}>
            在这里追踪您的每日功课和{'\n'}修行主题的完成进度。
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleOpenAddModal}
          >
            <Text style={styles.addButtonText}>添加修法</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Today's Practice Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>今日功课：</Text>

            {practiceProjects.map(project => {
              const todayCount = todayRecords[project.id] || 0;
              const dailyTarget = project.daily_target;
              const progressPercent = Math.min((todayCount / dailyTarget) * 100, 100);
              const isCompleted = todayCount >= dailyTarget;

              // Calculate display values based on practice type and target_period
              const getDisplayInfo = () => {
                if (project.practices.type === 'count') {
                  // Count type: show current/target count
                  return {
                    primaryText: `${project.current_count}/${project.target_count}`,
                    secondaryText: `(每日目标: ${dailyTarget}${project.practices.unit})`,
                    progressText: `今日: ${todayCount} / ${dailyTarget} ${project.practices.unit}`
                  };
                } else {
                  // Time type: calculate total duration and current period progress
                  if (project.target_period === 'weekly') {
                    // For weekly meditation practices
                    const currentWeekSessions = todayCount; // This represents valid sessions count for the week

                    return {
                      primaryText: `${project.practices.name}`,
                      secondaryText: `(本周目标：${dailyTarget}座)`,
                      progressText: `本周进度: ${currentWeekSessions} / ${dailyTarget} 座`
                    };
                  } else {
                    // Daily meditation practices
                    const currentDaySessions = todayCount; // This represents valid sessions count for today

                    return {
                      primaryText: `${project.practices.name}`,
                      secondaryText: `(每日目标：${dailyTarget}座)`,
                      progressText: `今日进度: ${currentDaySessions} / ${dailyTarget} 座`
                    };
                  }
                }
              };

              const displayInfo = getDisplayInfo();

              return (
                <View key={project.id} style={styles.practiceCard}>
                  <View style={styles.practiceHeader}>
                    <Text style={styles.practiceName}>
                      {project.practices.type === 'time' ? 
                        displayInfo.primaryText : 
                        (project.practices.name || '修行项目')
                      }
                    </Text>
                    <Text style={[styles.status, isCompleted && styles.completed]}>
                      {isCompleted ? '✅' : '☐'}
                    </Text>
                  </View>

                  <View style={styles.progressInfo}>
                    {project.practices.type === 'count' ? (
                      <>
                        <Text style={styles.progressText}>
                          {displayInfo.primaryText}
                        </Text>
                        <Text style={styles.dailyProgress}>
                          {displayInfo.progressText}
                        </Text>
                        <Text style={styles.targetPeriod}>
                          {displayInfo.secondaryText}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.dailyProgress}>
                          {displayInfo.progressText}
                        </Text>
                        <Text style={styles.targetPeriod}>
                          {displayInfo.secondaryText}
                        </Text>
                      </>
                    )}
                  </View>

                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${progressPercent}%` },
                        isCompleted && styles.completedFill,
                      ]}
                    />
                  </View>

                  <View style={styles.actionButtons}>
                    {project.practices.type === 'count' ? (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.completeButton]}
                        onPress={() =>
                          handleRecordPractice(project.id, dailyTarget - todayCount)
                        }
                        disabled={isCompleted}
                      >
                        <Text style={styles.actionButtonText}>
                          {isCompleted ? '已完成' : '完成'}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.timeBasedActions}>
                        <Text style={styles.timeBasedHint}>点击下方按钮记录观修</Text>
                        {/* Show current period meditation details */}
                        <TouchableOpacity
                          style={styles.sessionDetailsButton}
                          onPress={() => {
                            console.log('🔍 查看详情按钮被点击');
                            console.log('📋 Project info:', {
                              id: project.id,
                              practice_id: project.practice_id,
                              target_period: project.target_period,
                              name: project.practices.name
                            });

                            // Navigate to meditation history page
                            router.push({
                              pathname: '/meditation-history' as const,
                              params: {
                                projectId: project.id,
                                practiceId: project.practice_id,
                                practiceName: project.practices?.name || '观修'
                              }
                            });
                          }}
                        >
                          <Text style={styles.sessionDetailsText}>查看详情</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    <TouchableOpacity 
                      style={[styles.actionButton, styles.customButton]}
                      onPress={() => handleCustomRecord(project)}
                    >
                      <Text style={styles.actionButtonText}>
                        {project.practices.type === 'time' ? '记录观修' : '自定义记录'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Add more practice button for existing users */}
          <TouchableOpacity
            style={styles.addMoreButton}
            onPress={handleOpenAddModal}
          >
            <Text style={styles.addMoreButtonText}>➕ 添加更多修法</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Add Practice Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>➕ 添加修法</Text>
            <Text style={styles.modalSubtitle}>选择添加方式：</Text>

            <TouchableOpacity style={styles.addOption}>
              <Text style={styles.addOptionIcon}>🎯</Text>
              <View style={styles.addOptionContent}>
                <Text style={styles.addOptionTitle}>加入主题</Text>
                <Text style={styles.addOptionDesc}>选择预设的修行主题</Text>
              </View>
              <TouchableOpacity style={styles.addOptionButton}>
                <Text style={styles.addOptionButtonText}>浏览主题</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity style={styles.addOption}>
              <Text style={styles.addOptionIcon}>📿</Text>
              <View style={styles.addOptionContent}>
                <Text style={styles.addOptionTitle}>单项修法</Text>
                <Text style={styles.addOptionDesc}>添加单独的修行项目</Text>
              </View>
              <TouchableOpacity 
                style={styles.addOptionButton}
                onPress={handleSelectIndividualPractice}
              >
                <Text style={styles.addOptionButtonText}>选择修法</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Practice List Modal */}
      <Modal
        visible={showPracticeListModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPracticeListModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📿 选择修法</Text>
            <Text style={styles.modalSubtitle}>请选择您要添加的修法项目：</Text>

            <ScrollView style={styles.practiceList}>
              {availablePractices.map((practice) => (
                <TouchableOpacity
                  key={practice.id}
                  style={styles.practiceItem}
                  onPress={() => handlePracticeSelected(practice)}
                >
                  <View style={styles.practiceItemContent}>
                    <Text style={styles.practiceItemName}>{practice.name}</Text>
                    <Text style={styles.practiceItemDetails}>
                      {practice.type === 'count' ? '计数类' : '计时类'} • {practice.unit}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowPracticeListModal(false)}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Goal Setting Modal */}
      <Modal
        visible={showGoalSettingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGoalSettingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              {renderGoalSettingForm()}

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowGoalSettingModal(false)}
                >
                  <Text style={styles.cancelButtonText}>取消</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.confirmButton, addingPractice && styles.confirmButtonDisabled]}
                  onPress={handleAddIndividualPractice}
                  disabled={addingPractice}
                >
                  {addingPractice ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.confirmButtonText}>确认添加项目</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Meditation Recording Modal removed - now using full-screen page */}

      {/* Custom Count Modal */}
      <Modal
        visible={showCountModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>自定义记录</Text>
            <Text style={styles.modalSubtitle}>
              请输入完成的{selectedProjectForCount?.practices.unit}数量：
            </Text>
            <TextInput
              style={styles.customCountInput}
              value={customCount}
              onChangeText={setCustomCount}
              keyboardType="numeric"
              placeholder="请输入数量"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCountModal(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, recordingCount && styles.confirmButtonDisabled]}
                onPress={handleCustomCountRecorded}
                disabled={recordingCount}
              >
                {recordingCount ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>确认</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  practiceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  practiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  practiceName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 20,
  },
  completed: {
    color: '#34C759',
  },
  progressInfo: {
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    marginBottom: 4,
  },
  dailyProgress: {
    fontSize: 14,
    color: '#666',
  },
  targetPeriod: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5E7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  completedFill: {
    backgroundColor: '#34C759',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#34C759',
  },
  customButton: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  addMoreButton: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addMoreButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: '#666',
  },
  addOption: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  addOptionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  addOptionContent: {
    flex: 1,
  },
  addOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addOptionDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  addOptionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  addOptionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  practiceList: {
    maxHeight: 300,
    marginVertical: 20,
  },
  practiceItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  practiceItemContent: {
    flex: 1,
  },
  practiceItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  practiceItemDetails: {
    fontSize: 14,
    color: '#666',
  },
  goalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  goalInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  goalUnit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  frequencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  frequencyPicker: {
    flex: 1,
    height: 40,
  },
  frequencyLabel: {
    fontSize: 16,
    color: '#333',
    marginHorizontal: 8,
  },
  sessionsInput: {
    width: 60,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlign: 'center',
  },
  durationSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  dateValue: {
    fontSize: 16,
    color: '#666',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  durationPicker: {
    flex: 1,
    height: 40,
  },
  customDurationContainer: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  customDurationInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  customDurationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  endDateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  endDateLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
    minWidth: 80,
  },
  endDateInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  orText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginVertical: 8,
    fontStyle: 'italic',
  },
  durationOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Meditation modal styles removed - now using full-screen page
  timeBasedActions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeBasedHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  sessionDetailsButton: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e8ff',
  },
  sessionDetailsText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  customCountInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
});