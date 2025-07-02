
<old_str>import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';

interface PracticeProject {
  id: string;
  practice_id: string;
  target_count: number;
  current_count: number;
  daily_target: number;
  status: 'not_started' | 'active' | 'completed';
  practices?: {
    name: string;
    type: 'count' | 'time';
    unit: string;
  };
  themes?: {
    name: string;
    type: string;
  };
}

interface TodayRecord {
  id: string;
  count: number;
  practice_project_id: string;
}

export default function PracticeScreen() {
  const [projects, setProjects] = useState<PracticeProject[]>([]);
  const [todayRecords, setTodayRecords] = useState<TodayRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mock user ID - in real app, get from auth
  const userId = 'user-123';
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // For now, using mock data since Supabase isn't connected
      setProjects([
        {
          id: '1',
          practice_id: 'mantra-1',
          target_count: 1000,
          current_count: 250,
          daily_target: 108,
          status: 'active',
          practices: {
            name: '六字大明咒',
            type: 'count',
            unit: '次'
          },
          themes: {
            name: '基础修行',
            type: 'foundation'
          }
        },
        {
          id: '2',
          practice_id: 'meditation-1',
          target_count: 30,
          current_count: 12,
          daily_target: 1,
          status: 'active',
          practices: {
            name: '禅修',
            type: 'time',
            unit: '分钟'
          }
        }
      ]);
      
      setTodayRecords([
        {
          id: '1',
          count: 54,
          practice_project_id: '1'
        }
      ]);
    } catch (error) {
      console.error('Error loading practice data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTodayCount = (projectId: string) => {
    const record = todayRecords.find(r => r.practice_project_id === projectId);
    return record ? record.count : 0;
  };

  const handleComplete = (project: PracticeProject) => {
    Alert.alert(
      `完成 ${project.practices?.name}`,
      `今日目标: ${project.daily_target}${project.practices?.unit}`,
      [
        { text: '取消', style: 'cancel' },
        { text: '确认完成', onPress: () => recordPractice(project, project.daily_target) }
      ]
    );
  };

  const handleCustomRecord = (project: PracticeProject) => {
    Alert.prompt(
      `${project.practices?.name} - 自定义记录`,
      `请输入完成数量 (${project.practices?.unit})`,
      [
        { text: '取消', style: 'cancel' },
        { text: '确认', onPress: (value) => {
          const count = parseInt(value || '0');
          if (count > 0) {
            recordPractice(project, count);
          }
        }}
      ],
      'plain-text'
    );
  };

  const recordPractice = (project: PracticeProject, count: number) => {
    // Update today's record
    const existingRecordIndex = todayRecords.findIndex(r => r.practice_project_id === project.id);
    const newTodayRecords = [...todayRecords];
    
    if (existingRecordIndex >= 0) {
      newTodayRecords[existingRecordIndex].count += count;
    } else {
      newTodayRecords.push({
        id: Date.now().toString(),
        count: count,
        practice_project_id: project.id
      });
    }
    
    setTodayRecords(newTodayRecords);
    
    // Update project current count
    const updatedProjects = projects.map(p => 
      p.id === project.id 
        ? { ...p, current_count: p.current_count + count }
        : p
    );
    setProjects(updatedProjects);
    
    Alert.alert('记录成功', `已记录 ${count} ${project.practices?.unit}`);
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>加载中...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            📿 修行记录
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Practice Tracking
          </ThemedText>
        </ThemedView>

        {/* Today's Practice */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            📖 今日功课
          </ThemedText>
          
          {projects.map((project) => {
            const todayCount = getTodayCount(project.id);
            const progress = (todayCount / project.daily_target) * 100;
            const isCompleted = todayCount >= project.daily_target;
            
            return (
              <View key={project.id} style={styles.practiceCard}>
                <View style={styles.practiceHeader}>
                  <ThemedText style={styles.practiceName}>
                    {project.practices?.name}: {todayCount}/{project.daily_target} {isCompleted ? '✅' : '⏳'}
                  </ThemedText>
                </View>
                
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min(progress, 100)}%`,
                        backgroundColor: isCompleted ? Colors.success : Colors.practice
                      }
                    ]} 
                  />
                </View>
                
                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={[styles.actionButton, isCompleted && styles.completedButton]}
                    onPress={() => handleComplete(project)}
                  >
                    <Text style={styles.actionButtonText}>完成</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.secondaryButton]}
                    onPress={() => handleCustomRecord(project)}
                  >
                    <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>自定义记录</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ThemedView>

        {/* Theme Progress */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            🎯 我的主题
          </ThemedText>
          
          <View style={styles.themeCard}>
            <ThemedText type="defaultSemiBold" style={styles.themeName}>
              📿 五加行 (25%)
            </ThemedText>
            <ThemedText style={styles.themeStatus}>
              进行中：顶礼、百字明
            </ThemedText>
            <ThemedText style={styles.themeStatus}>
              未启动：发心、供曼达、上师瑜伽
            </ThemedText>
            <TouchableOpacity style={styles.themeButton}>
              <Text style={styles.themeButtonText}>管理主题</Text>
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Action Buttons */}
        <ThemedView style={styles.section}>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.primaryActionButton}>
              <Text style={styles.primaryActionText}>添加修法</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryActionButton, styles.secondaryActionButton]}>
              <Text style={[styles.primaryActionText, styles.secondaryActionText]}>生成分享</Text>
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
    backgroundColor: Colors.practice,
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
  practiceCard: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.practice,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  practiceHeader: {
    marginBottom: 10,
  },
  practiceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    backgroundColor: Colors.practice,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: Colors.success,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.practice,
  },
  actionButtonText: {
    color: Colors.surface,
    fontWeight: 'bold',
    fontSize: 13,
  },
  secondaryButtonText: {
    color: Colors.practice,
  },
  themeCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.practice,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  themeName: {
    fontSize: 18,
    color: Colors.text,
    marginBottom: 8,
  },
  themeStatus: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  themeButton: {
    backgroundColor: Colors.practice,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  themeButtonText: {
    color: Colors.surface,
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 15,
  },
  primaryActionButton: {
    backgroundColor: Colors.practice,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  secondaryActionButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.practice,
  },
  primaryActionText: {
    color: Colors.surface,
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryActionText: {
    color: Colors.practice,
  },
});</old_str>
<new_str>import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';

interface DailyPractice {
  id: string;
  name: string;
  current: number;
  target: number;
  type: 'count' | 'time' | 'meditation';
  status: 'pending' | 'in_progress' | 'completed';
  unit: string;
}

interface Theme {
  id: string;
  name: string;
  progress: number;
  activeCount: number;
  notStartedCount: number;
  completedCount: number;
  activePractices: string[];
  notStartedPractices: string[];
}

export default function PracticeScreen() {
  const [dailyPractices, setDailyPractices] = useState<DailyPractice[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState<DailyPractice | null>(null);
  const [customCount, setCustomCount] = useState('');
  const [showAddPracticeModal, setShowAddPracticeModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Mock data for demonstration
    setDailyPractices([
      {
        id: '1',
        name: '顶礼',
        current: 391,
        target: 547,
        type: 'count',
        status: 'in_progress',
        unit: '次'
      },
      {
        id: '2',
        name: '百字明',
        current: 0,
        target: 273,
        type: 'count',
        status: 'pending',
        unit: '次'
      },
      {
        id: '3',
        name: '金刚萨埵心咒',
        current: 0,
        target: 13334,
        type: 'count',
        status: 'pending',
        unit: '次'
      },
      {
        id: '4',
        name: '前行观修',
        current: 0,
        target: 1,
        type: 'meditation',
        status: 'pending',
        unit: '座'
      },
      {
        id: '5',
        name: '课前念诵',
        current: 0,
        target: 1,
        type: 'count',
        status: 'pending',
        unit: '次'
      },
      {
        id: '6',
        name: '三十五佛忏悔文',
        current: 0,
        target: 1,
        type: 'count',
        status: 'pending',
        unit: '次'
      },
    ]);

    setThemes([
      {
        id: '1',
        name: '五加行',
        progress: 25,
        activeCount: 2,
        notStartedCount: 3,
        completedCount: 0,
        activePractices: ['顶礼', '百字明'],
        notStartedPractices: ['发心', '供曼达', '上师瑜伽']
      }
    ]);
  };

  const handleComplete = (practice: DailyPractice) => {
    const remaining = practice.target - practice.current;
    Alert.alert(
      `完成 ${practice.name}`,
      `今日目标: ${practice.target}${practice.unit}\n当前进度: ${practice.current}${practice.unit}\n剩余: ${remaining}${practice.unit}`,
      [
        { text: '取消', style: 'cancel' },
        { text: '确认完成', onPress: () => recordPractice(practice.id, remaining) }
      ]
    );
  };

  const handleCustomRecord = (practice: DailyPractice) => {
    setSelectedPractice(practice);
    setCustomCount('');
    setShowCustomModal(true);
  };

  const recordPractice = (practiceId: string, count: number) => {
    setDailyPractices(prev => prev.map(p => {
      if (p.id === practiceId) {
        const newCurrent = p.current + count;
        const newStatus = newCurrent >= p.target ? 'completed' : 'in_progress';
        return { ...p, current: newCurrent, status: newStatus };
      }
      return p;
    }));
    
    Alert.alert('记录成功', `已记录 ${count} ${selectedPractice?.unit || '次'}`);
  };

  const handleCustomSubmit = () => {
    if (selectedPractice && customCount) {
      const count = parseInt(customCount);
      if (count > 0) {
        recordPractice(selectedPractice.id, count);
        setShowCustomModal(false);
      }
    }
  };

  const renderPracticeCard = (practice: DailyPractice) => {
    const progress = (practice.current / practice.target) * 100;
    const isCompleted = practice.status === 'completed';
    const remaining = practice.target - practice.current;
    
    return (
      <View key={practice.id} style={styles.practiceCard}>
        <View style={styles.practiceHeader}>
          <ThemedText style={styles.practiceName}>
            {practice.name}: {practice.current}/{practice.target} {isCompleted ? '✅' : practice.status === 'in_progress' ? '⏳' : '☐'}
          </ThemedText>
        </View>
        
        {practice.status !== 'pending' && (
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: isCompleted ? Colors.success : Colors.practice
                }
              ]} 
            />
          </View>
        )}
        
        <View style={styles.actionRow}>
          {practice.type === 'meditation' ? (
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => handleCustomRecord(practice)}
            >
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>自定义记录</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, isCompleted && styles.completedButton]}
                onPress={() => handleComplete(practice)}
                disabled={isCompleted}
              >
                <Text style={styles.actionButtonText}>完成</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => handleCustomRecord(practice)}
              >
                <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>自定义记录</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            📿 修行记录
          </ThemedText>
        </ThemedView>

        {/* Today's Practice */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            📖 今日功课：
          </ThemedText>
          
          {dailyPractices.map(renderPracticeCard)}
          
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={styles.primaryActionButton}
              onPress={() => setShowAddPracticeModal(true)}
            >
              <Text style={styles.primaryActionText}>添加修法</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryActionButton, styles.secondaryActionButton]}>
              <Text style={[styles.primaryActionText, styles.secondaryActionText]}>生成分享</Text>
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Theme Progress */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            🎯 我的主题：
          </ThemedText>
          
          {themes.map(theme => (
            <View key={theme.id} style={styles.themeCard}>
              <ThemedText type="defaultSemiBold" style={styles.themeName}>
                📿 {theme.name} ({theme.progress}%)
              </ThemedText>
              <ThemedText style={styles.themeStatus}>
                进行中：{theme.activePractices.join('、')}
              </ThemedText>
              <ThemedText style={styles.themeStatus}>
                未启动：{theme.notStartedPractices.join('、')}
              </ThemedText>
              <TouchableOpacity style={styles.themeButton}>
                <Text style={styles.themeButtonText}>管理主题</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ThemedView>
      </ScrollView>

      {/* Custom Record Modal */}
      <Modal visible={showCustomModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              🙏 {selectedPractice?.name} - 自定义记录
            </ThemedText>
            
            <ThemedText style={styles.modalInfo}>
              当前进度：{selectedPractice?.current}{selectedPractice?.unit}
            </ThemedText>
            <ThemedText style={styles.modalInfo}>
              今日目标：{selectedPractice?.target}{selectedPractice?.unit}
            </ThemedText>
            <ThemedText style={styles.modalInfo}>
              剩余：{selectedPractice ? selectedPractice.target - selectedPractice.current : 0}{selectedPractice?.unit}
            </ThemedText>
            
            <ThemedText style={styles.inputLabel}>
              📊 输入完成数量：
            </ThemedText>
            <TextInput
              style={styles.textInput}
              value={customCount}
              onChangeText={setCustomCount}
              placeholder="输入数量"
              keyboardType="numeric"
            />
            <Text style={styles.unitText}>{selectedPractice?.unit}</Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCustomModal(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={handleCustomSubmit}
              >
                <Text style={styles.modalButtonText}>确认</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Practice Modal */}
      <Modal visible={showAddPracticeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              ➕ 添加修法
            </ThemedText>
            
            <ThemedText style={styles.modalSubtitle}>选择添加方式：</ThemedText>
            
            <TouchableOpacity style={styles.addMethodCard}>
              <Text style={styles.addMethodIcon}>🎯</Text>
              <View style={styles.addMethodContent}>
                <ThemedText style={styles.addMethodTitle}>加入主题</ThemedText>
                <ThemedText style={styles.addMethodDesc}>选择预设的修行主题</ThemedText>
                <Text style={styles.addMethodAction}>浏览主题</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.addMethodCard}>
              <Text style={styles.addMethodIcon}>📿</Text>
              <View style={styles.addMethodContent}>
                <ThemedText style={styles.addMethodTitle}>单独添加修法</ThemedText>
                <ThemedText style={styles.addMethodDesc}>独立添加一个修法项目</ThemedText>
                <Text style={styles.addMethodAction}>选择修法</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.addMethodCard}>
              <Text style={styles.addMethodIcon}>📖</Text>
              <View style={styles.addMethodContent}>
                <ThemedText style={styles.addMethodTitle}>添加每日功课</ThemedText>
                <ThemedText style={styles.addMethodDesc}>添加固定的每日功课</ThemedText>
                <Text style={styles.addMethodAction}>选择功课</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.addMethodCard}>
              <Text style={styles.addMethodIcon}>⚡</Text>
              <View style={styles.addMethodContent}>
                <ThemedText style={styles.addMethodTitle}>一次性修行记录</ThemedText>
                <ThemedText style={styles.addMethodDesc}>记录临时的修行活动</ThemedText>
                <Text style={styles.addMethodAction}>快速记录</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton, { marginTop: 20 }]}
              onPress={() => setShowAddPracticeModal(false)}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
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
    backgroundColor: Colors.practice,
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
  practiceCard: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.practice,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  practiceHeader: {
    marginBottom: 10,
  },
  practiceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    backgroundColor: Colors.practice,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: Colors.success,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.practice,
  },
  actionButtonText: {
    color: Colors.surface,
    fontWeight: 'bold',
    fontSize: 13,
  },
  secondaryButtonText: {
    color: Colors.practice,
  },
  themeCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.practice,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  themeName: {
    fontSize: 18,
    color: Colors.text,
    marginBottom: 8,
  },
  themeStatus: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  themeButton: {
    backgroundColor: Colors.practice,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  themeButtonText: {
    color: Colors.surface,
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 15,
  },
  primaryActionButton: {
    backgroundColor: Colors.practice,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  secondaryActionButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.practice,
  },
  primaryActionText: {
    color: Colors.surface,
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryActionText: {
    color: Colors.practice,
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
  },
  modalInfo: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  inputLabel: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 15,
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.practice,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.background,
  },
  unitText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 5,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    backgroundColor: Colors.practice,
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
  addMethodCard: {
    backgroundColor: Colors.background,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.practice,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addMethodIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  addMethodContent: {
    flex: 1,
  },
  addMethodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  addMethodDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  addMethodAction: {
    fontSize: 14,
    color: Colors.practice,
    fontWeight: 'bold',
  },
});</new_str>
