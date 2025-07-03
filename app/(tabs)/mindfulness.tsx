
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
import { mindfulnessService } from '@/lib/database';

export default function MindfulnessScreen() {
  const { user } = useAuth();
  const [todayRecords, setTodayRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecord, setNewRecord] = useState({
    mind_type: 'good',
    description: ''
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user?.id) {
      loadTodayRecords();
    }
  }, [user]);

  const loadTodayRecords = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const records = await mindfulnessService.getTodayRecords(user.id, today);
      setTodayRecords(records);
      console.log('💭 Loaded mindfulness records:', records);
    } catch (error) {
      console.error('❌ Error loading mindfulness records:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMindfulnessRecord = async () => {
    if (!user?.id || !newRecord.description.trim()) {
      Alert.alert('提示', '请填写心得描述');
      return;
    }

    try {
      const now = new Date();
      const timeString = now.toTimeString().split(' ')[0];
      
      await mindfulnessService.recordMindfulness({
        user_id: user.id,
        record_date: today,
        record_time: timeString,
        mind_type: newRecord.mind_type,
        description: newRecord.description.trim()
      });

      setNewRecord({ mind_type: 'good', description: '' });
      setShowAddModal(false);
      loadTodayRecords();
      Alert.alert('成功', '心得记录已添加');
    } catch (error) {
      console.error('❌ Error adding mindfulness record:', error);
      Alert.alert('错误', '添加记录失败');
    }
  };

  const getMindTypeEmoji = (type) => {
    return type === 'good' ? '😊' : '😔';
  };

  const getMindTypeText = (type) => {
    return type === 'good' ? '善心' : '散乱';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>💝 心性修养</Text>
          <Text style={styles.subtitle}>培养内在的平静与智慧</Text>
        </View>

        <View style={styles.todaySection}>
          <Text style={styles.sectionTitle}>今日心得 ({today})</Text>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addButtonText}>+ 记录心得</Text>
          </TouchableOpacity>

          {loading ? (
            <Text style={styles.loadingText}>加载中...</Text>
          ) : todayRecords.length > 0 ? (
            todayRecords.map((record, index) => (
              <View key={record.id || index} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <Text style={styles.recordTime}>
                    {getMindTypeEmoji(record.mind_type)} {record.record_time?.slice(0, 5)} - {getMindTypeText(record.mind_type)}
                  </Text>
                </View>
                <Text style={styles.recordDescription}>{record.description}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>今日还没有心得记录</Text>
              <Text style={styles.emptySubtext}>点击上方按钮开始记录您的修行心得</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>记录心得</Text>
            
            <Text style={styles.fieldLabel}>心境状态:</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  newRecord.mind_type === 'good' && styles.typeOptionSelected
                ]}
                onPress={() => setNewRecord({...newRecord, mind_type: 'good'})}
              >
                <Text style={styles.typeOptionText}>😊 善心</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  newRecord.mind_type === 'bad' && styles.typeOptionSelected
                ]}
                onPress={() => setNewRecord({...newRecord, mind_type: 'bad'})}
              >
                <Text style={styles.typeOptionText}>😔 散乱</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>心得描述:</Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={4}
              value={newRecord.description}
              onChangeText={(text) => setNewRecord({...newRecord, description: text})}
              placeholder="请描述您今日的修行心得..."
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addMindfulnessRecord}
              >
                <Text style={styles.saveButtonText}>保存</Text>
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
  addButton: {
    backgroundColor: '#8FBC8F',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    color: '#696969',
    fontSize: 16,
    marginTop: 20,
  },
  recordCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    marginBottom: 8,
  },
  recordTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2F4F4F',
  },
  recordDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
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
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2F4F4F',
    marginBottom: 20,
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F4F4F',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  typeOption: {
    flex: 1,
    padding: 12,
    margin: 4,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  typeOptionSelected: {
    backgroundColor: '#8FBC8F',
  },
  typeOptionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 20,
    minHeight: 100,
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
