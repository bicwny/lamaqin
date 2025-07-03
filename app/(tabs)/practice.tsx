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
import { useAuth } from '@/contexts/AuthContext';
import { practiceService, dailyRecordService } from '@/lib/database';
import { Colors } from '@/constants/Colors';

interface PracticeProject {
  id: string;
  practice_id: string;
  target_count: number;
  current_count: number;
  daily_target: number;
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
  const [customAmount, setCustomAmount] = useState('');

  // New states for individual practice selection
  const [showPracticeListModal, setShowPracticeListModal] = useState(false);
  const [showGoalSettingModal, setShowGoalSettingModal] = useState(false);
  const [availablePractices, setAvailablePractices] = useState<Practice[]>([]);
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [targetAmount, setTargetAmount] = useState('');
  const [addingPractice, setAddingPractice] = useState(false);

  useEffect(() => {
    loadPracticeData();
  }, [user]);

  const loadPracticeData = async () => {
    if (!user?.id) return;

    try {
      console.log('🔄 Loading practice data for user:', user.id);

      const projects = await practiceService.getUserPracticeProjects(user.id);
      console.log('📋 Loaded practice projects:', projects.length);
      setPracticeProjects(projects);

      const today = new Date().toISOString().split('T')[0];
      const records = await dailyRecordService.getTodayRecords(user.id, today);
      console.log('📅 Loaded today records:', records.length);
      setTodayRecords(records);
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

  const handleRecordPractice = async (projectId: string, amount: number) => {
    if (!user?.id) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      await dailyRecordService.recordPractice(user.id, projectId, amount, today);

      // Reload data to reflect changes
      await loadPracticeData();

      Alert.alert('成功', `已记录 ${amount} 次修行`);
    } catch (error) {
      console.error('Error recording practice:', error);
      Alert.alert('错误', '记录修行失败');
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
    setShowGoalSettingModal(true);
  };

  const handleAddIndividualPractice = async () => {
    if (!user?.id || !selectedPractice || !targetAmount) {
      Alert.alert('提示', '请填写完整信息');
      return;
    }

    const target = parseInt(targetAmount);
    if (isNaN(target) || target <= 0) {
      Alert.alert('提示', '请输入有效的目标数量');
      return;
    }

    setAddingPractice(true);
    try {
      await practiceService.createUserPracticeProject(
        user.id,
        selectedPractice.id,
        target,
        Math.ceil(target / 365) // Default daily target (1 year completion)
      );

      Alert.alert('成功', `已添加${selectedPractice.name}到修行计划`);

      // Reset state and reload data
      setSelectedPractice(null);
      setTargetAmount('');
      setShowGoalSettingModal(false);
      await loadPracticeData();
    } catch (error) {
      console.error('Error adding practice:', error);
      Alert.alert('错误', '添加修行失败');
    } finally {
      setAddingPractice(false);
    }
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
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
              const progressPercent =
                Math.min(
                  (todayCount / project.practices.daily_target) * 100,
                  100
                );
              const isCompleted = todayCount >= project.practices.daily_target;

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
                      {project.current_count} / {project.target_count}{' '}
                      {project.practices.unit}
                    </Text>
                    <Text style={styles.dailyProgress}>
                      今日: {todayCount} / {project.practices.daily_target}{' '}
                      {project.practices.unit}
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
                        handleRecordPractice(
                          project.id,
                          project.practices.daily_target - todayCount
                        )
                      }
                      disabled={isCompleted}
                    >
                      <Text style={styles.actionButtonText}>
                        {isCompleted ? '已完成' : '完成'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.customButton]}
                      onPress={() => {}}
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
                    <Text style={styles.practiceItemName}>{practice.name}</Text>
                    <Text style={styles.practiceItemUnit}>({practice.unit})</Text>
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
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>🎯 设置"{selectedPractice?.name}"的目标</Text>
              <Text style={styles.modalSubtitle}>请输入您的修行总目标数量：</Text>

              <View style={styles.goalInputContainer}>
                <Text style={styles.goalLabel}>目标数量：</Text>
                <TextInput
                  style={styles.goalInput}
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  keyboardType="numeric"
                  placeholder="请输入目标数量"
                />
                <Text style={styles.goalUnit}>{selectedPractice?.unit}</Text>
              </View>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  practiceItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  practiceItemUnit: {
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
  goalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginRight: 8,
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
});