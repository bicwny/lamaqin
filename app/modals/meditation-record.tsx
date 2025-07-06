import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  ToastAndroid,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { meditationService } from '@/lib/database';
import { Colors } from '@/constants/Colors';

export default function MeditationRecordScreen() {
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

  // Toast function for cross-platform support
  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('提示', message);
    }
  };

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

    console.log('✅ Form validation passed:', { duration: durationNum, sessionNumber: sessionNum });
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
        await meditationService.updateMeditationRecord(editRecordId, user.id, {
          duration_minutes: recordData.duration_minutes,
          session_number: recordData.session_number,
          reflection: recordData.reflection
        });
        console.log('✅ Meditation record updated successfully');
        showToast('观修记录已更新');
        // Navigate back with a small delay to ensure toast shows
        setTimeout(() => {
          router.back();
        }, 500);
      } else {
        const savedRecord = await meditationService.recordMeditationWithReflection(recordData);
        console.log('✅ Record saved successfully');

        // Show success toast
        showToast('观修记录已保存成功');

        // Navigate back to practice page
        router.back();
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
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(tabs)/practice');
          }
        }} style={styles.backButton}>
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          📝 {isEditing ? '编辑观修记录' : '记录新的观修'}
        </Text>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.practiceTitle}>📿 {practiceName}</Text>

          {/* Duration Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>观修时长（分钟）</Text>
            <Text style={styles.inputHint}>请输入观修时长，如：30</Text>
            <TextInput
              style={styles.textInput}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              placeholder="30"
            />
          </View>

          {/* Topic Selection */}
          <View style={styles.inputSection}>
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

          {/* Topic Description */}
          {selectedTopic?.description && (
            <View style={styles.topicDescription}>
              <Text style={styles.topicDescriptionLabel}>观修要点：</Text>
              <Text style={styles.topicDescriptionText}>
                {selectedTopic.description}
              </Text>
            </View>
          )}

          {/* Reflection Input */}
          <View style={styles.inputSection}>
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
              placeholder="例如：今日观修思维闲暇之本体，深感人身难得..."
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {reflection.length} 字
            </Text>
          </View>

          {/* Save Button - now inside scroll content */}
          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>💾 保存记录</Text>
            )}
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  keyboardAvoidingView: {
    flex: 1
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  backButton: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4
  },
  content: {
    flex: 1,
    padding: 16
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  practiceTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  inputSection: {
    marginBottom: 24
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6
  },
  inputHint: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
    lineHeight: 20
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#333'
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingBottom: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    backgroundColor: 'white',
    overflow: 'hidden',
    ...(Platform.OS === 'ios' && {
      minHeight: 200,
      paddingHorizontal: 0,
    }),
  },
  picker: {
    height: 50,
    color: '#333',
    ...(Platform.OS === 'android' && {
      backgroundColor: 'white',
    }),
  },
  topicDescription: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107'
  },
  topicDescriptionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 6
  },
  topicDescriptionText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20
  },
  characterCount: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'right',
    marginTop: 4
  },
  loadingIndicator: {
    padding: 20
  },
  saveButton: {
    backgroundColor: '#ffc107',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  saveButtonDisabled: {
    opacity: 0.6
  },
  saveButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600'
  }
});