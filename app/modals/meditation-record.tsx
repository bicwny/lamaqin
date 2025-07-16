
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { meditationService } from '@/lib/database';
import { Colors } from '@/constants/Colors';
import { DesignSystem, createStyles } from '@/constants/DesignSystem';
import { ComponentTokens, ComponentTextStyles } from '@/utils/componentTokens';
import { Typography } from '@/utils/typography';
import { toastService } from '@/lib/toast';
import TopicSelectionModal from '@/components/TopicSelectionModal';
import ModalTemplate from '@/components/ModalTemplate';

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
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<{
    topic_number: number;
    title: string;
    description?: string;
  } | null>(null);

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
      
      // Set initial selected topic
      if (topics.length > 0) {
        const initialTopicNumber = parseInt(sessionNumber);
        const initialTopic = topics.find(t => t.topic_number === initialTopicNumber) || topics[0];
        setSelectedTopic(initialTopic);
        setSessionNumber(initialTopic.topic_number.toString());
      }
      
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
        
        // Set selected topic after topics are loaded
        if (meditationTopics.length > 0) {
          const topic = meditationTopics.find(t => t.topic_number === record.session_number);
          if (topic) {
            setSelectedTopic(topic);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error loading existing record:', error);
      toastService.error({ title: '❌ 加载失败', message: '记录加载失败，请重试' });
    }
  };

  const validateForm = () => {
    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      toastService.error({ title: '⚠️ 输入错误', message: '请输入有效的观修时长（大于0分钟）' });
      return false;
    }

    const sessionNum = parseInt(sessionNumber);
    if (isNaN(sessionNum) || sessionNum < 1) {
      toastService.error({ title: '⚠️ 选择错误', message: '请选择有效的观修内容' });
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
        toastService.success({ 
          title: '✅ 更新成功', 
          message: `观修记录已更新：${recordData.duration_minutes}分钟` 
        });
        router.back();
      } else {
        const savedRecord = await meditationService.recordMeditationWithReflection(recordData);
        console.log('✅ Record saved successfully');

        // Show achievement toast for new meditation record
        toastService.achievement({ 
          title: '观修完成', 
          message: `第${recordData.session_number}座 ${recordData.duration_minutes}分钟观修记录成功！` 
        });

        // Navigate back to practice page
        router.back();
      }
    } catch (error) {
      console.error('❌ Error saving meditation record:', error);
      toastService.error({ title: '❌ 保存失败', message: '观修记录保存失败，请检查网络后重试' });
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSelect = (topic: { topic_number: number; title: string; description?: string }) => {
    setSelectedTopic(topic);
    setSessionNumber(topic.topic_number.toString());
  };

  return (
    <ModalTemplate
      title={isEditing ? '编辑观修记录' : '记录新的观修'}
      onClose={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/practice');
        }
      }}
      scrollable={true}
      showCloseButton={true}
      variant="dialog"
      size="default"
      keyboardAvoidingView={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
          <Text style={styles.practiceTitle}>{practiceName}</Text>

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

          {/* Topic Selection - only show if there are topics or still loading */}
          {(loadingTopics || meditationTopics.length > 0) && (
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>选择观修内容</Text>
              {loadingTopics ? (
                <ActivityIndicator style={styles.loadingIndicator} />
              ) : meditationTopics.length > 0 ? (
                <TouchableOpacity
                  style={styles.topicSelector}
                  onPress={() => setShowTopicModal(true)}
                >
                  <Text style={styles.topicSelectorText}>
                    {selectedTopic ? selectedTopic.title : '请选择观修内容'}
                  </Text>
                  <Text style={styles.topicSelectorArrow}>›</Text>
                </TouchableOpacity>
              ) : null}
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
              <ActivityIndicator color={DesignSystem.colors.textInverse} />
            ) : (
              <Text style={styles.saveButtonText}>💾 保存记录</Text>
            )}
          </TouchableOpacity>
        
        {/* Topic Selection Modal */}
        <TopicSelectionModal
          visible={showTopicModal}
          onClose={() => setShowTopicModal(false)}
          onSelect={handleTopicSelect}
          topics={meditationTopics}
          selectedTopicNumber={selectedTopic?.topic_number}
          loading={loadingTopics}
        />
    </ModalTemplate>
  );
}

const styles = StyleSheet.create({
  practiceTitle: {
    ...createStyles.dharmaTitle('xl'),
    textAlign: 'center',
    marginBottom: DesignSystem.spacing['2xl'],
    paddingBottom: DesignSystem.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border,
  },
  inputSection: {
    marginBottom: DesignSystem.spacing['2xl'],
  },
  inputLabel: {
    ...createStyles.subheading('base'),
    marginBottom: DesignSystem.spacing.xs,
  },
  inputHint: {
    ...createStyles.body('sm'),
    color: DesignSystem.colors.textTertiary,
    marginBottom: DesignSystem.spacing.sm,
  },
  textInput: {
    ...ComponentTokens.input.standard,
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: DesignSystem.spacing.md,
    paddingBottom: DesignSystem.spacing.md,
  },
  topicSelector: {
    ...ComponentTokens.input.standard,
    paddingVertical: DesignSystem.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topicSelectorText: {
    ...createStyles.body('base'),
    flex: 1,
  },
  topicSelectorArrow: {
    ...createStyles.body('lg'),
    color: DesignSystem.colors.textSecondary,
    marginLeft: DesignSystem.spacing.sm,
  },
  characterCount: {
    ...createStyles.caption(),
    textAlign: 'right',
    marginTop: DesignSystem.spacing.xs,
  },
  loadingIndicator: {
    padding: DesignSystem.spacing.xl,
  },
  saveButton: {
    backgroundColor: DesignSystem.colors.warning,
    borderRadius: DesignSystem.borderRadius.md,
    paddingVertical: DesignSystem.spacing.lg,
    alignItems: 'center',
    // marginTop: DesignSystem.spacing['2xl'],
    // marginBottom: DesignSystem.spacing['3xl'],
    // ...DesignSystem.shadow.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...createStyles.buttonText('primary'),
    color: DesignSystem.colors.textPrimary,
    fontSize: DesignSystem.typography.fontSize.lg,
  },
});
