
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { practiceService, dailyRecordService } from '@/lib/database';

export default function PracticeScreen() {
  const { user } = useAuth();
  const [practiceProjects, setPracticeProjects] = useState([]);
  const [todayRecords, setTodayRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [recordAmount, setRecordAmount] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user?.id) {
      loadPracticeData();
    }
  }, [user]);

  const loadPracticeData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const [projects, records] = await Promise.all([
        practiceService.getUserPracticeProjects(user.id),
        dailyRecordService.getTodayRecords(user.id, today)
      ]);
      
      setPracticeProjects(projects);
      setTodayRecords(records);
      console.log('📿 Loaded practice projects:', projects);
      console.log('📅 Loaded today records:', records);
    } catch (error) {
      console.error('❌ Error loading practice data:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordPractice = async () => {
    if (!selectedProject || !recordAmount.trim()) {
      Alert.alert('提示', '请输入有效的数量');
      return;
    }

    const amount = parseInt(recordAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('提示', '请输入有效的数量');
      return;
    }

    try {
      await dailyRecordService.recordPractice(
        user.id,
        selectedProject.id,
        amount,
        today
      );

      setRecordAmount('');
      setShowRecordModal(false);
      setSelectedProject(null);
      loadPracticeData();
      Alert.alert('成功', '修行记录已添加');
    } catch (error) {
      console.error('❌ Error recording practice:', error);
      Alert.alert('错误', '记录失败');
    }
  };

  const getTodayProgress = (projectId, dailyTarget) => {
    const todayRecord = todayRecords.find(r => r.practice_project_id === projectId);
    const current = todayRecord?.count || 0;
    return { current, target: dailyTarget, percentage: Math.min((current / dailyTarget) * 100, 100) };
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return '#4CAF50';
    if (percentage >= 50) return '#FF9800';
    return '#F44336';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>📿 修行实践</Text>
          <Text style={styles.subtitle}>日常修行与功课记录</Text>
        </View>

        <View style={styles.todaySection}>
          <Text style={styles.sectionTitle}>今日功课 ({today})</Text>
          
          {loading ? (
            <Text style={styles.loadingText}>加载中...</Text>
          ) : practiceProjects.length > 0 ? (
            practiceProjects.map((project) => {
              const progress = getTodayProgress(project.id, project.daily_target);
              const progressColor = getProgressColor(progress.percentage);
              
              return (
                <View key={project.id} style={styles.practiceCard}>
                  <View style={styles.practiceHeader}>
                    <Text style={styles.practiceName}>{project.practices.name}</Text>
                    <TouchableOpacity
                      style={styles.recordButton}
                      onPress={() => {
                        setSelectedProject(project);
                        setShowRecordModal(true);
                      }}
                    >
                      <Text style={styles.recordButtonText}>记录</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${progress.percentage}%`, backgroundColor: progressColor }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {progress.current} / {progress.target} {project.practices.unit}
                    </Text>
                  </View>
                  
                  <View style={styles.practiceStats}>
                    <Text style={styles.statText}>
                      总进度: {project.current_count} / {project.target_count}
                    </Text>
                    <Text style={styles.statText}>
                      完成率: {Math.round(progress.percentage)}%
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>暂无修行项目</Text>
              <Text style={styles.emptySubtext}>请先在首页添加修行项目</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showRecordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRecordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>记录修行</Text>
            
            {selectedProject && (
              <Text style={styles.selectedPractice}>
                {selectedProject.practices.name}
              </Text>
            )}
            
            <Text style={styles.fieldLabel}>
              数量 ({selectedProject?.practices.unit}):
            </Text>
            <TextInput
              style={styles.numberInput}
              value={recordAmount}
              onChangeText={setRecordAmount}
              placeholder="请输入数量"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowRecordModal(false);
                  setSelectedProject(null);
                  setRecordAmount('');
                }}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={recordPractice}
              >
                <Text style={styles.saveButtonText}>记录</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2F4F4F',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#696969',
    textAlign: 'center',
  },
  todaySection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2F4F4F',
    marginBottom: 16,
  },
  loadingText: {
    textAlign: 'center',
    color: '#696969',
    fontSize: 16,
    marginTop: 20,
  },
  practiceCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
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
    marginBottom: 12,
  },
  practiceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F4F4F',
    flex: 1,
  },
  recordButton: {
    backgroundColor: '#8FBC8F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  recordButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F4F4F',
    textAlign: 'center',
  },
  practiceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 14,
    color: '#696969',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#696969',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2F4F4F',
    marginBottom: 16,
    textAlign: 'center',
  },
  selectedPractice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8FBC8F',
    textAlign: 'center',
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F4F4F',
    marginBottom: 8,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#DDD',
  },
  saveButton: {
    backgroundColor: '#8FBC8F',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
