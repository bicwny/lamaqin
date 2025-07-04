
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';

export default function PracticeConfigScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const {
    practiceId,
    practiceName,
    practiceType,
    practiceUnit,
  } = params as {
    practiceId: string;
    practiceName: string;
    practiceType: string;
    practiceUnit: string;
  };

  const [formData, setFormData] = useState({
    targetCount: practiceType === 'count' 
      ? (practiceName === '六字大明咒' ? '100000' : '10000')
      : '92',
    dailyTarget: practiceType === 'count'
      ? (practiceName === '六字大明咒' ? '3000' : '108')
      : '2',
    targetPeriod: 'daily',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!practiceId || !user?.id) {
      Alert.alert('错误', '缺少必要信息');
      return;
    }

    // Validate form data
    if (!formData.targetCount || !formData.dailyTarget) {
      Alert.alert('错误', '请填写完整的目标信息');
      return;
    }

    setSaving(true);
    try {
      console.log('💾 Creating new practice project...');

      // Calculate target end date
      let targetEndDate = '';
      if (formData.targetPeriod === 'daily') {
        const days = Math.ceil(parseInt(formData.targetCount) / parseInt(formData.dailyTarget));
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);
        targetEndDate = endDate.toISOString().split('T')[0];
      }

      const { data: newProject, error } = await supabase
        .from('user_practice_projects')
        .insert({
          user_id: user.id,
          practice_id: practiceId,
          target_count: parseInt(formData.targetCount),
          daily_target: parseInt(formData.dailyTarget),
          target_period: formData.targetPeriod,
          start_date: new Date().toISOString().split('T')[0],
          target_end_date: targetEndDate,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Practice project created successfully:', newProject);
      Alert.alert('成功', '修行项目已添加！', [
        {
          text: '确定',
          onPress: () => router.replace('/(tabs)/practice'),
        },
      ]);
    } catch (error) {
      console.error('Error creating practice project:', error);
      Alert.alert('错误', '创建修行项目失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: '配置修法目标', headerShown: true }} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.practiceTitle}>📿 {practiceName}</Text>
          <Text style={styles.practiceType}>
            {practiceType === 'count' ? '计数类' : '计时类'} • {practiceUnit}
          </Text>
        </View>

        <View style={styles.configForm}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {practiceType === 'count' ? '总目标数量' : '总目标座数'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.targetCount}
              onChangeText={(text) => setFormData({...formData, targetCount: text})}
              keyboardType="numeric"
              placeholder={practiceType === 'count' ? '如：100000' : '如：92'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              每日目标 ({practiceUnit})
            </Text>
            <TextInput
              style={styles.input}
              value={formData.dailyTarget}
              onChangeText={(text) => setFormData({...formData, dailyTarget: text})}
              keyboardType="numeric"
              placeholder={practiceType === 'count' ? '如：3000' : '如：2'}
            />
          </View>

          {practiceType === 'time' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>目标周期</Text>
              <View style={styles.periodSelector}>
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    formData.targetPeriod === 'daily' && styles.selectedPeriodButton
                  ]}
                  onPress={() => setFormData({...formData, targetPeriod: 'daily'})}
                >
                  <Text style={[
                    styles.periodButtonText,
                    formData.targetPeriod === 'daily' && styles.selectedPeriodButtonText
                  ]}>
                    每日
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    formData.targetPeriod === 'weekly' && styles.selectedPeriodButton
                  ]}
                  onPress={() => setFormData({...formData, targetPeriod: 'weekly'})}
                >
                  <Text style={[
                    styles.periodButtonText,
                    formData.targetPeriod === 'weekly' && styles.selectedPeriodButtonText
                  ]}>
                    每周
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>取消</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>添加修法</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  practiceTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  practiceType: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  configForm: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  selectedPeriodButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  selectedPeriodButtonText: {
    color: 'white',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    backgroundColor: 'white',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
