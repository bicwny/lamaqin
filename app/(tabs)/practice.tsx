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
import { useAuth } from '@/contexts/AuthContext';
import { practiceService, dailyRecordService } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { ConnectionTest } from '@/components/ConnectionTest';
import { PracticeProjectsCheck } from '@/components/PracticeProjectsCheck';
import { MeditationTopicsTest } from '@/components/MeditationTopicsTest';

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

export default function PracticeScreen() {
  const { user } = useAuth();
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
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('weekly');
  const [sessionsPerPeriod, setSessionsPerPeriod] = useState('');

  useEffect(() => {
    loadPracticeData();
  }, [user]);

  const loadPracticeData = async () => {
    if (!user?.id) return;

    try {
      console.log('🔄 Loading practice data for user:', user.id);

      const projects = await practiceService.getUserPracticeProjects(user.id);
      console.log('📋 User practice projects:', projects);
      console.log('📋 Loaded practice projects:', projects.length);
      setPracticeProjects(projects);

      const today = new Date().toISOString().split('T')[0];
      const records = await dailyRecordService.getTodayRecords(user.id, today);
      console.log('📅 Loaded today records:', records.length);

      // Convert records array to object for easier access
      const recordsMap = records.reduce((acc, record) => {
        acc[record.practice_project_id] = record.count;
        return acc;
      }, {});

      setTodayRecords(recordsMap);
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

  const loadMeditationTopics = async (practiceId: string) => {
    try {
      console.log('🧘 Loading meditation topics for practice:', practiceId);
      const { data, error } = await supabase
        .from('meditation_topics')
        .select('topic_number, title, description')
        .eq('practice_id', practiceId)
        .order('topic_number', { ascending: true });

      if (error) throw error;

      console.log('📚 Loaded meditation topics from database:', data?.length || 0);

      // Prioritize database data
      if (data && data.length > 0) {
        setMeditationTopics(data);
        return;
      }

      // Fallback: Check if this is a meditation practice and create default topics
      if (selectedProjectForRecord?.practices.name?.includes('前行') || 
          selectedProjectForRecord?.practices.name?.includes('观修') ||
          selectedProjectForRecord?.practices.name?.includes('禅修')) {

        console.log('🔄 Creating default meditation topics for 前行观修');
        // For meditation practices, create numbered topics
        const defaultTopics = [];
        for (let i = 1; i <= 92; i++) {
          defaultTopics.push({
            topic_number: i,
            title: `第${i}座观修`,
            description: `前行实修法第${i}座的观修内容，深入修持佛法要义`
          });
        }
        setMeditationTopics(defaultTopics);
      } else {
        // For other time-based practices, create a simple numbered list
        console.log('🔄 Creating default topics for other practices');
        const defaultTopics = [];
        for (let i = 1; i <= 30; i++) {
          defaultTopics.push({
            topic_number: i,
            title: `第${i}座修行`,
            description: `${selectedProjectForRecord?.practices.name}第${i}座的修行内容`
          });
        }
        setMeditationTopics(defaultTopics);
      }
    } catch (error) {
      console.error('Error loading meditation topics:', error);
      // Ultimate fallback
      const defaultTopics = [];
      for (let i = 1; i <= 30; i++) {
        defaultTopics.push({
          topic_number: i,
          title: `第${i}座修行`,
          description: `修行第${i}座的相关内容`
        });
      }
      setMeditationTopics(defaultTopics);
    }
  };

  // Meditation recording states
  const [showMeditationModal, setShowMeditationModal] = useState(false);
  const [selectedProjectForRecord, setSelectedProjectForRecord] = useState<PracticeProject | null>(null);
  const [meditationSessions, setMeditationSessions] = useState<{duration: string, method: string, sessionNumber: number}[]>([{duration: '', method: '', sessionNumber: 1}]);
  const [recordingMeditation, setRecordingMeditation] = useState(false);
  const [meditationTopics, setMeditationTopics] = useState<{topic_number: number, title: string, description: string}[]>([]);

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
    setSelectedProjectForRecord(project);

    if (project.practices.type === 'time') {
      // For meditation/time-based practices, show meditation recording modal
      setMeditationSessions([{duration: '', method: '', sessionNumber: 1}]);
      await loadMeditationTopics(project.practice_id);
      setShowMeditationModal(true);
    } else {
      // For count-based practices, show simple input
      Alert.prompt(
        '自定义记录',
        `请输入完成的${project.practices.unit}数量：`,
        [
          { text: '取消', style: 'cancel' },
          { 
            text: '确认', 
            onPress: (value) => {
              const amount = parseInt(value || '0');
              if (amount > 0) {
                handleRecordPractice(project.id, amount);
              }
            }
          }
        ],
        'plain-text',
        '',
        'numeric'
      );
    }
  };

  const addMeditationSession = () => {
    const nextSessionNumber = Math.max(...meditationSessions.map(s => s.sessionNumber), 0) + 1;
    setMeditationSessions([...meditationSessions, {duration: '', method: '', sessionNumber: nextSessionNumber}]);
  };

  const removeMeditationSession = (index: number) => {
    if (meditationSessions.length > 1) {
      const newSessions = meditationSessions.filter((_, i) => i !== index);
      setMeditationSessions(newSessions);
    }
  };

  const updateMeditationSession = (index: number, field: 'duration' | 'method' | 'sessionNumber', value: string | number) => {
    const newSessions = [...meditationSessions];
    if (field === 'sessionNumber') {
      newSessions[index][field] = value as number;
    } else {
      newSessions[index][field] = value as string;
    }
    setMeditationSessions(newSessions);
  };

  const validateMeditationSession = (duration: number): boolean => {
    // Core business rule: minimum 15 minutes to count as valid session
    return duration >= 15;
  };

  const handleSaveMeditationRecord = async () => {
    if (!user?.id || !selectedProjectForRecord) return;

    // Validate sessions
    const validSessions = meditationSessions.filter(session => {
      const duration = parseInt(session.duration);
      return !isNaN(duration) && duration > 0 && session.method.trim();
    });

    if (validSessions.length === 0) {
      Alert.alert('提示', '请至少添加一次有效的观修记录');
      return;
    }

    setRecordingMeditation(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      let validSessionCount = 0;
      let totalMinutes = 0;

      // Save each meditation session to meditation_records table
      for (let i = 0; i < validSessions.length; i++) {
        const session = validSessions[i];
        const duration = parseInt(session.duration);
        totalMinutes += duration;

        // Save to meditation_records with the user-selected session number
        const { error: meditationError } = await supabase
          .from('meditation_records')
          .insert({
            user_id: user.id,
            practice_id: selectedProjectForRecord.practice_id,
            record_date: today,
            session_number: session.sessionNumber,
            duration_minutes: duration,
            method: session.method
          });

        if (meditationError) {
          console.error('Error saving meditation record:', meditationError);
          throw meditationError;
        }

        // Check if this session counts as a valid "座"
        if (validateMeditationSession(duration)) {
          validSessionCount++;
        }
      }

      // Update project progress with valid session count (not total minutes)
      if (validSessionCount > 0) {
        await dailyRecordService.recordPractice(
          user.id, 
          selectedProjectForRecord.id, 
          validSessionCount, 
          today
        );
      }

      // Reload practice data to reflect the changes
      await loadPracticeData();

      Alert.alert(
        '记录成功', 
        `本次观修:\n总时长: ${totalMinutes} 分钟\n有效座数: ${validSessionCount} 座\n\n(单座需≥15分钟才计入有效座数)`
      );

      setShowMeditationModal(false);
      setSelectedProjectForRecord(null);
      setMeditationSessions([{duration: '', method: '', sessionNumber: 1}]);
      setMeditationTopics([]);
    } catch (error) {
      console.error('Error saving meditation:', error);
      Alert.alert('错误', '保存观修记录失败');
    } finally {
      setRecordingMeditation(false);
    }
  };

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
    setFrequency('weekly');

    setShowGoalSettingModal(true);
  };

  const calculateProjectParams = () => {
    if (!selectedPractice) return null;

    const start = new Date(startDate);
    let durationDays: number;

    if (duration === 'custom') {
      durationDays = parseInt(customDuration) || 100;
    } else {
      durationDays = parseInt(duration);
    }

    const endDate = new Date(start);
    endDate.setDate(start.getDate() + durationDays);

    if (selectedPractice.type === 'count') {
      const total = parseInt(totalTarget);
      const dailyTarget = Math.ceil(total / durationDays);

      return {
        target_count: total,
        daily_target: dailyTarget,
        start_date: startDate,
        target_end_date: endDate.toISOString().split('T')[0],
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
        target_end_date: endDate.toISOString().split('T')[0],
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

    if (duration === 'custom' && !customDuration) {
      Alert.alert('提示', '请输入自定义持续时间');
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
              <TextInput
                style={styles.customDurationInput}
                value={customDuration}
                onChangeText={setCustomDuration}
                keyboardType="numeric"
                placeholder="输入天数"
              />
              <Text style={styles.customDurationLabel}>天</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📿 修行记录</Text>
      <ConnectionTest />
      <PracticeProjectsCheck />
      <MeditationTopicsTest />

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

              return (
                <View key={project.id} style={styles.practiceCard}>
                  <View style={styles.practiceHeader}>
                    <Text style={styles.practiceName}>
                      {project.practices.name || '修行项目'}
                    </Text>
                    <Text style={[styles.status, isCompleted && styles.completed]}>
                      {isCompleted ? '✅' : '☐'}
                    </Text>
                  </View>

                  <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>
                      {project.current_count} / {project.target_count} {project.practices.unit}
                    </Text>
                    <Text style={styles.dailyProgress}>
                      今日: {todayCount} / {dailyTarget} {project.practices.unit}
                    </Text>

                    <Text style={styles.targetPeriod}>
                      ({project.target_period === 'daily' ? '每日目标' : '每周目标'}: {dailyTarget} {project.practices.unit})
                    </Text>
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

                    <TouchableOpacity
                      style={[styles.actionButton, styles.customButton]}
                      onPress={() => handleCustomRecord(project)}
                    >
                      <Text style={styles.actionButtonText}>自定义记录</Text>
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

      {/* Meditation Recording Modal */}
      <Modal
        visible={showMeditationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMeditationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                🧘 记录"{selectedProjectForRecord?.practices.name}"观修
              </Text>
              <Text style={styles.modalSubtitle}>
                请记录您的观修座次（单座≥15分钟才计入有效座数）
              </Text>

              {meditationSessions.map((session, index) => (
                <View key={index} style={styles.sessionContainer}>
                  <View style={styles.sessionHeader}>
                    <Text style={styles.sessionTitle}>第 {index + 1} 座</Text>
                    {meditationSessions.length > 1 && (
                      <TouchableOpacity
                        style={styles.removeSessionButton}
                        onPress={() => removeMeditationSession(index)}
                      >
                        <Text style={styles.removeSessionText}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.sessionInputs}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>选择观修内容</Text>
                      {meditationTopics.length > 0 ? (
                        <Picker
                          selectedValue={session.sessionNumber}
                          onValueChange={(value) => {
                            updateMeditationSession(index, 'sessionNumber', value);
                            const selectedTopic = meditationTopics.find(t => t.topic_number === value);
                            if (selectedTopic) {
                              updateMeditationSession(index, 'method', selectedTopic.title);
                            }
                          }}
                          style={styles.topicPicker}
                        >
                          {meditationTopics.map((topic) => (
                            <Picker.Item 
                              key={topic.topic_number} 
                              label={`${topic.topic_number} - ${topic.title}`} 
                              value={topic.topic_number} 
                            />
                          ))}
                        </Picker>
                      ) : (
                        <TextInput
                          style={styles.sessionInput}
                          value={session.sessionNumber.toString()}
                          onChangeText={(value) => updateMeditationSession(index, 'sessionNumber', parseInt(value) || 1)}
                          keyboardType="numeric"
                          placeholder="座数编号"
                        />
                      )}
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>观修时长（分钟）</Text>
                      <TextInput
                        style={styles.sessionInput}
                        value={session.duration}
                        onChangeText={(value) => updateMeditationSession(index, 'duration', value)}
                        keyboardType="numeric"
                        placeholder="如：30"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>观修方法/备注</Text>
                      <TextInput
                        style={styles.sessionInput}
                        value={session.method}
                        onChangeText={(value) => updateMeditationSession(index, 'method', value)}
                        placeholder="观修方法或备注"
                        multiline={true}
                        numberOfLines={2}
                      />
                    </View>

                    {meditationTopics.length > 0 && (
                      <View style={styles.topicDescription}>
                        <Text style={styles.topicDescriptionLabel}>观修要点：</Text>
                        <Text style={styles.topicDescriptionText}>
                          {meditationTopics.find(t => t.topic_number === session.sessionNumber)?.description || ''}
                        </Text>
                      </View>
                    )}
                  </View>

                  {session.duration && parseInt(session.duration) > 0 && (
                    <Text style={[
                      styles.sessionValidation,
                      validateMeditationSession(parseInt(session.duration)) 
                        ? styles.validSession 
                        : styles.invalidSession
                    ]}>
                      {validateMeditationSession(parseInt(session.duration))
                        ? '✅ 有效座（≥15分钟）'
                        : '⚠️ 时长不足15分钟，不计入有效座数'
                      }
                    </Text>
                  )}
                </View>
              ))}

              <TouchableOpacity
                style={styles.addSessionButton}
                onPress={addMeditationSession}
              >
                <Text style={styles.addSessionText}>+ 添加更多座次</Text>
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowMeditationModal(false)}
                >
                  <Text style={styles.cancelButtonText}>取消</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.confirmButton, recordingMeditation && styles.confirmButtonDisabled]}
                  onPress={handleSaveMeditationRecord}
                  disabled={recordingMeditation}
                >
                  {recordingMeditation ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.confirmButtonText}>保存记录</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
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
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
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
  sessionContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  removeSessionButton: {
    backgroundColor: '#dc3545',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeSessionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sessionInputs: {
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  sessionInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#333',
  },
  sessionValidation: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  validSession: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  invalidSession: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  addSessionButton: {
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderStyle: 'dashed',
  },
  addSessionText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '500',
  },
  topicPicker: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    height: 40,
  },
  topicDescription: {
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  topicDescriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  topicDescriptionText: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
  },
});