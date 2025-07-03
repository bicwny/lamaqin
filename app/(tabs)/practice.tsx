
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { practiceService, dailyRecordService } from '@/lib/database';

interface Practice {
  id: string;
  name: string;
  type: 'count' | 'time';
  unit: '次' | '分钟';
}

interface UserPracticeProject {
  id: string;
  practice_id: string;
  target_count: number;
  current_count: number;
  daily_target: number;
  status: 'not_started' | 'active' | 'completed';
  practice?: Practice;
}

interface DailyRecord {
  practice_project_id: string;
  count: number;
}

export default function PracticeScreen() {
  const { user } = useAuth();
  const [practiceProjects, setPracticeProjects] = useState<UserPracticeProject[]>([]);
  const [todayRecords, setTodayRecords] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<UserPracticeProject | null>(null);
  const [recordCount, setRecordCount] = useState('');

  useEffect(() => {
    loadPracticeData();
  }, [user]);

  const loadPracticeData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Loading practice data for user:', user.id);
      
      const projects = await practiceService.getUserPracticeProjects(user.id);
      const today = new Date().toISOString().split('T')[0];
      const records = await dailyRecordService.getTodayRecords(user.id, today);

      console.log('📋 Loaded practice projects:', projects.length);
      console.log('📅 Loaded today records:', records.length);

      setPracticeProjects(projects);

      // Organize today's records by practice project
      const recordsMap: Record<string, number> = {};
      records.forEach(record => {
        recordsMap[record.practice_project_id] = 
          (recordsMap[record.practice_project_id] || 0) + record.count;
      });
      setTodayRecords(recordsMap);

    } catch (error) {
      console.error('❌ Error loading practice data:', error);
      setPracticeProjects([]);
      setTodayRecords({});
    } finally {
      setLoading(false);
    }
  };

  const recordPractice = async (projectId: string, count: number) => {
    if (!user || count <= 0) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      await dailyRecordService.recordPractice({
        user_id: user.id,
        practice_project_id: projectId,
        record_date: today,
        count: count,
        notes: ''
      });

      Alert.alert('成功', '修行记录已保存');
      loadPracticeData(); // Refresh data
      setShowRecordModal(false);
      setRecordCount('');
      setSelectedProject(null);

    } catch (error) {
      console.error('Error recording practice:', error);
      Alert.alert('错误', '保存失败，请重试');
    }
  };

  const openRecordModal = (project: UserPracticeProject) => {
    setSelectedProject(project);
    setShowRecordModal(true);
  };

  const quickAdd = (projectId: string, amount: number) => {
    recordPractice(projectId, amount);
  };

  const confirmRecord = () => {
    if (selectedProject && recordCount) {
      const count = parseInt(recordCount);
      if (count > 0) {
        recordPractice(selectedProject.id, count);
      }
    }
  };

  // Empty State Component
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📿</Text>
      <Text style={styles.emptyTitle}>开始您的修行之旅</Text>
      <Text style={styles.emptySubtitle}>
        在这里追踪您的每日功课和{'\n'}修行主题的完成进度。
      </Text>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addButtonText}>添加修法</Text>
      </TouchableOpacity>
    </View>
  );

  // Add Practice Modal Component
  const AddPracticeModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>➕ 添加修法</Text>
          <Text style={styles.modalSubtitle}>选择添加方式：</Text>
          
          <TouchableOpacity style={styles.optionCard}>
            <Text style={styles.optionIcon}>🎯</Text>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>加入主题</Text>
              <Text style={styles.optionDesc}>选择预设的修行主题</Text>
              <TouchableOpacity style={styles.optionButton}>
                <Text style={styles.optionButtonText}>浏览主题</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard}>
            <Text style={styles.optionIcon}>📿</Text>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>单项修法</Text>
              <Text style={styles.optionDesc}>添加单独的修行项目</Text>
              <TouchableOpacity style={styles.optionButton}>
                <Text style={styles.optionButtonText}>选择修法</Text>
              </TouchableOpacity>
            </View>
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
  );

  // Record Practice Modal Component
  const RecordPracticeModal = () => (
    <Modal
      visible={showRecordModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowRecordModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {selectedProject?.practice?.type === 'count' ? '🙏' : '🧘'} {selectedProject?.practice?.name} - 自定义记录
          </Text>
          
          <View style={styles.currentProgress}>
            <Text style={styles.progressLabel}>当前进度：</Text>
            <Text style={styles.progressValue}>
              {selectedProject?.current_count || 0}{selectedProject?.practice?.unit}
            </Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>
              输入完成{selectedProject?.practice?.type === 'count' ? '数量' : '时长'}：
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.recordInput}
                value={recordCount}
                onChangeText={setRecordCount}
                keyboardType="numeric"
                placeholder="0"
              />
              <Text style={styles.unitText}>{selectedProject?.practice?.unit}</Text>
            </View>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={confirmRecord}
            >
              <Text style={styles.confirmButtonText}>确认</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setShowRecordModal(false);
                setRecordCount('');
                setSelectedProject(null);
              }}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📿 修行记录</Text>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📿 修行记录</Text>

      {practiceProjects.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Today's Practice Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>今日功课：</Text>
            
            {practiceProjects.map(project => {
              const todayCount = todayRecords[project.id] || 0;
              const progressPercent = Math.min((todayCount / project.daily_target) * 100, 100);
              const isCompleted = todayCount >= project.daily_target;

              return (
                <View key={project.id} style={styles.practiceCard}>
                  <View style={styles.practiceHeader}>
                    <Text style={styles.practiceName}>
                      {project.practice?.name || '修行项目'}
                    </Text>
                    <Text style={[styles.status, isCompleted && styles.completed]}>
                      {isCompleted ? '✅' : '☐'}
                    </Text>
                  </View>

                  <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>
                      {project.current_count} / {project.target_count} {project.practice?.unit}
                    </Text>
                    <Text style={styles.dailyProgress}>
                      今日: {todayCount} / {project.daily_target} {project.practice?.unit}
                    </Text>
                  </View>

                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${progressPercent}%` },
                        isCompleted && styles.completedFill
                      ]} 
                    />
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.completeButton]}
                      onPress={() => quickAdd(project.id, project.daily_target - todayCount)}
                      disabled={isCompleted}
                    >
                      <Text style={styles.actionButtonText}>
                        {isCompleted ? '已完成' : '完成'}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.customButton]}
                      onPress={() => openRecordModal(project)}
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
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addMoreButtonText}>➕ 添加更多修法</Text>
          </TouchableOpacity>
        </>
      )}

      <AddPracticeModal />
      <RecordPracticeModal />
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
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 40,
  },
  
  // Empty State Styles
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
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Section Styles
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  // Practice Card Styles
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
    backgroundColor: '#007AFF',
  },
  completedFill: {
    backgroundColor: '#34C759',
  },

  // Action Buttons
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
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Quick Buttons
  quickButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  quickButtonText: {
    color: '#007AFF',
    fontWeight: '500',
  },

  // Add More Button
  addMoreButton: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addMoreButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Modal Styles
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

  // Option Card Styles
  optionCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  optionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  optionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Record Modal Styles
  currentProgress: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 16,
    color: '#666',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  unitText: {
    fontSize: 16,
    color: '#666',
  },

  // Modal Buttons
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
