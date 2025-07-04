
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { meditationService } from '@/lib/database';
import { meditationTopicsService } from '@/lib/meditation-topics';
import type { MeditationRecord, MeditationTopic } from '@/types/database';

const { height: screenHeight } = Dimensions.get('window');

export default function MeditationRecordModal() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  
  // 路由参数
  const practiceId = params.practiceId as string;
  const practiceProjectId = params.practiceProjectId as string;
  const editRecordId = params.editRecordId as string;
  const practiceName = params.practiceName as string;

  // 表单状态
  const [duration, setDuration] = useState('');
  const [sessionNumber, setSessionNumber] = useState('');
  const [reflection, setReflection] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<MeditationTopic | null>(null);
  
  // 数据状态
  const [topics, setTopics] = useState<MeditationTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadMeditationTopics();
    if (editRecordId) {
      loadExistingRecord();
    }
  }, []);

  const loadMeditationTopics = async () => {
    try {
      const topicsData = await meditationTopicsService.getAllTopics(practiceId);
      setTopics(topicsData);
    } catch (error) {
      console.error('❌ Error loading meditation topics:', error);
    }
  };

  const loadExistingRecord = async () => {
    try {
      setIsEditing(true);
      const records = await meditationService.getMeditationRecords(user!.id);
      const record = records.find(r => r.id === editRecordId);
      
      if (record) {
        setDuration(record.duration_minutes.toString());
        setSessionNumber(record.session_number?.toString() || '');
        setReflection(record.reflection || '');
        
        // 找到对应的观修方法
        if (record.session_number) {
          const topic = topics.find(t => t.topic_number === record.session_number);
          setSelectedTopic(topic || null);
        }
      }
    } catch (error) {
      console.error('❌ Error loading existing record:', error);
      Alert.alert('错误', '加载记录失败');
    }
  };

  const validateForm = () => {
    if (!duration || isNaN(parseInt(duration)) || parseInt(duration) <= 0) {
      Alert.alert('错误', '请输入有效的观修时长（分钟）');
      return false;
    }

    if (sessionNumber && (isNaN(parseInt(sessionNumber)) || parseInt(sessionNumber) < 1 || parseInt(sessionNumber) > 92)) {
      Alert.alert('错误', '座数必须在1-92之间');
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
        session_number: sessionNumber ? parseInt(sessionNumber) : null,
        session_attempt: 1, // 默认为第1次尝试
        reflection: reflection.trim() || null
      };

      if (isEditing) {
        // 更新现有记录
        await meditationService.updateMeditationRecord(editRecordId, {
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

  const handleTopicSelect = (topic: MeditationTopic) => {
    setSelectedTopic(topic);
    setSessionNumber(topic.topic_number.toString());
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#f5f5f5' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20 }}>
          {/* 标题 */}
          <View style={{ alignItems: 'center', marginBottom: 30 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#2c3e50' }}>
              🧘 {isEditing ? '编辑' : '记录'}观修
            </Text>
            <Text style={{ fontSize: 16, color: '#7f8c8d', marginTop: 5 }}>
              {practiceName}
            </Text>
          </View>

          {/* 观修时长 */}
          <View style={{ marginBottom: 25 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#2c3e50', marginBottom: 8 }}>
              观修时长 *
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#bdc3c7',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: '#fff'
              }}
              placeholder="请输入观修时长（分钟）"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />
          </View>

          {/* 座数选择 */}
          <View style={{ marginBottom: 25 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#2c3e50', marginBottom: 8 }}>
              第几座观修？（可选）
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#bdc3c7',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: '#fff',
                marginBottom: 10
              }}
              placeholder="请输入座数（1-92）"
              value={sessionNumber}
              onChangeText={setSessionNumber}
              keyboardType="numeric"
            />
            
            {/* 显示选中的观修方法 */}
            {selectedTopic && (
              <View style={{
                backgroundColor: '#e8f5e8',
                padding: 12,
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: '#27ae60'
              }}>
                <Text style={{ fontSize: 14, color: '#27ae60', fontWeight: '600' }}>
                  第{selectedTopic.topic_number}座：{selectedTopic.title}
                </Text>
                {selectedTopic.description && (
                  <Text style={{ fontSize: 12, color: '#2c3e50', marginTop: 4 }}>
                    {selectedTopic.description}
                  </Text>
                )}
              </View>
            )}

            {/* 快速选择观修方法 */}
            {!selectedTopic && topics.length > 0 && (
              <View>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 8 }}>
                  或者从常用方法中选择：
                </Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 10 }}
                >
                  {topics.slice(0, 10).map((topic) => (
                    <TouchableOpacity
                      key={topic.id}
                      onPress={() => handleTopicSelect(topic)}
                      style={{
                        backgroundColor: '#3498db',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 15,
                        marginRight: 8
                      }}
                    >
                      <Text style={{ color: '#fff', fontSize: 12 }}>
                        第{topic.topic_number}座
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* 观后感 */}
          <View style={{ marginBottom: 30 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#2c3e50', marginBottom: 8 }}>
              观后感（可选）
            </Text>
            <Text style={{ fontSize: 12, color: '#7f8c8d', marginBottom: 8 }}>
              记录您在这次观修中的感悟、体会或发现
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#bdc3c7',
                borderRadius: 8,
                padding: 12,
                fontSize: 14,
                backgroundColor: '#fff',
                minHeight: 100,
                textAlignVertical: 'top'
              }}
              placeholder="例如：今日观修"思维闲暇之本体"，深感人身难得。通过观想八种闲暇和十种圆满，认识到现在的修行条件是多么珍贵..."
              value={reflection}
              onChangeText={setReflection}
              multiline
              numberOfLines={6}
            />
            <Text style={{ fontSize: 11, color: '#95a5a6', marginTop: 4 }}>
              {reflection.length}/500 字
            </Text>
          </View>

          {/* 操作按钮 */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                flex: 1,
                backgroundColor: '#95a5a6',
                padding: 15,
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                取消
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              style={{
                flex: 2,
                backgroundColor: loading ? '#bdc3c7' : '#27ae60',
                padding: 15,
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                {loading ? '保存中...' : (isEditing ? '更新记录' : '保存记录')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
