
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { meditationService } from '@/lib/database';
import { Colors } from '@/constants/Colors';

export default function MeditationRecordModal() {
  const { user } = useAuth();
  const { 
    practiceId, 
    practiceProjectId, 
    practiceName,
    editRecordId 
  } = useLocalSearchParams<{
    practiceId: string;
    practiceProjectId: string;
    practiceName: string;
    editRecordId?: string;
  }>();

  const [duration, setDuration] = useState('');
  const [sessionNumber, setSessionNumber] = useState('1');
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [meditationTopics, setMeditationTopics] = useState<Array<{
    topic_number: number;
    title: string;
    description?: string;
  }>>([]);

  const isEditing = !!editRecordId;

  useEffect(() => {
    loadMeditationTopics();
    if (isEditing) {
      loadExistingRecord();
    }
  }, []);

  const loadMeditationTopics = async () => {
    try {
      console.log('🔄 Loading meditation topics for practice:', practiceId);
      const topics = await meditationService.getMeditationTopics(practiceId);
      setMeditationTopics(topics);
      console.log('📚 Loaded meditation topics:', topics.length);
    } catch (error) {
      console.error('❌ Error loading meditation topics:', error);
    } finally {
      setLoadingTopics(false);
    }
  };

  const loadExistingRecord = async () => {
    if (!user || !editRecordId) return;

    try {
      const record = await meditationService.getMeditationRecordWithReflection(editRecordId, user.id);
      if (record) {
        setDuration(record.duration_minutes.toString());
        setSessionNumber(record.session_number?.toString() || '1');
        setReflection(record.reflection || '');
      }
    } catch (error) {
      console.error('❌ Error loading existing record:', error);
      Alert.alert('错误', '加载记录失败');
    }
  };

  const validateForm = () => {
    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      Alert.alert('提示', '请输入有效的观修时长（大于0分钟）');
      return false;
    }

    const sessionNum = parseInt(sessionNumber);
    if (isNaN(sessionNum) || sessionNum < 1) {
      Alert.alert('提示', '请选择有效的观修内容');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!user || !validateForm()) return;

    setLoading(true);
    try {
      const recordData = {
        user_id: user.id,
        practice_id: practiceId,
        record_date: new Date().toISOString().split('T')[0],
        duration_minutes: parseInt(duration),
        session_number: parseInt(sessionNumber),
        reflection: reflection.trim() || undefined
      };

      if (isEditing) {
        // 更新现有记录
        await meditationService.updateMeditationRecord(editRecordId, user.id, {
          duration_minutes: recordData.duration_minutes,
          session_number: recordData.session_number,
          reflection: recordData.reflection
        });
        Alert.alert('成功', '观修记录已更新', [
          { text: '确定', onPress: () => router.back() }
        ]);
      } else {
        // 创建新记录
        await meditationService.recordMeditationWithReflection(recordData);
        Alert.alert('成功', '观修记录已保存', [
          { text: '确定', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('❌ Error saving meditation record:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const selectedTopic = meditationTopics.find(t => t.topic_number === parseInt(sessionNumber));

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: isEditing ? '编辑观修记录' : '记录观修',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.cancelButton}>取消</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <Text style={styles.saveButton}>保存</Text>
              )}
            </TouchableOpacity>
          )
        }} 
      />

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📿 {practiceName}</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>观修时长（分钟）</Text>
            <TextInput
              style={styles.textInput}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              placeholder="请输入观修时长，如：30"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>选择观修内容</Text>
            {loadingTopics ? (
              <ActivityIndicator style={styles.loadingIndicator} />
            ) : meditationTopics.length > 0 ? (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={parseInt(sessionNumber)}
                  onValueChange={(value) => setSessionNumber(value.toString())}
                  style={styles.picker}
                >
                  {meditationTopics.map((topic) => (
                    <Picker.Item 
                      key={topic.topic_number} 
                      label={`第${topic.topic_number}座 - ${topic.title}`} 
                      value={topic.topic_number} 
                    />
                  ))}
                </Picker>
              </View>
            ) : (
              <TextInput
                style={styles.textInput}
                value={sessionNumber}
                onChangeText={setSessionNumber}
                keyboardType="numeric"
                placeholder="座数编号"
              />
            )}
          </View>

          {selectedTopic?.description && (
            <View style={styles.topicDescription}>
              <Text style={styles.topicDescriptionLabel}>观修要点：</Text>
              <Text style={styles.topicDescriptionText}>
                {selectedTopic.description}
              </Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>观后感（可选）</Text>
            <Text style={styles.inputHint}>
              记录您在这次观修中的体验、感悟和思考...
            </Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={reflection}
              onChangeText={setReflection}
              multiline
              numberOfLines={6}
              placeholder="例如：今日观修思维闲暇之本体，深感人身难得。通过观想八种闲暇和十种圆满，认识到现在的修行条件是多么珍贵..."
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {reflection.length} 字
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  content: {
    flex: 1,
    padding: 16
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center'
  },
  inputGroup: {
    marginBottom: 20
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  inputHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white'
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top'
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
    overflow: 'hidden'
  },
  picker: {
    height: 50
  },
  topicDescription: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary
  },
  topicDescriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4
  },
  topicDescriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4
  },
  loadingIndicator: {
    padding: 20
  },
  cancelButton: {
    color: '#666',
    fontSize: 16,
    paddingHorizontal: 10
  },
  saveButton: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 10
  }
});
