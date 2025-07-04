
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ToastAndroid,
  Platform,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';

export default function CustomRecordScreen() {
  const { user } = useAuth();
  const { 
    projectId, 
    practiceName,
    practiceType 
  } = useLocalSearchParams<{
    projectId: string;
    practiceName: string;
    practiceType: string;
  }>();

  const [count, setCount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Toast function for cross-platform support
  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('提示', message);
    }
  };

  const validateForm = () => {
    const countNum = parseInt(count);
    if (isNaN(countNum) || countNum <= 0) {
      Alert.alert('提示', '请输入有效的数量（大于0）');
      return false;
    }

    console.log('✅ Form validation passed:', { count: countNum });
    return true;
  };

  const handleSave = async () => {
    if (!user || !validateForm()) return;

    setLoading(true);
    try {
      const countNum = parseInt(count);
      
      // First, get the project details to find the practice_id
      const { data: project, error: projectError } = await supabase
        .from('user_practice_projects')
        .select('practice_id, current_count')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (projectError) throw projectError;

      // Insert the record
      const { data: record, error: recordError } = await supabase
        .from('practice_records')
        .insert({
          user_id: user.id,
          project_id: projectId,
          practice_id: project.practice_id,
          record_date: new Date().toISOString().split('T')[0],
          count: countNum,
          notes: notes.trim() || null
        })
        .select()
        .single();

      if (recordError) throw recordError;

      // Update the project's current count
      const newCurrentCount = project.current_count + countNum;
      const { error: updateError } = await supabase
        .from('user_practice_projects')
        .update({ 
          current_count: newCurrentCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      console.log('✅ Count record saved successfully');
      showToast(`已记录 ${countNum} 次`);
      
      // Navigate back to practice page
      router.back();
    } catch (error) {
      console.error('❌ Error saving count record:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

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
          📝 记录修行数量
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.practiceTitle}>📿 {practiceName}</Text>

          {/* Count Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>本次修行数量</Text>
            <Text style={styles.inputHint}>请输入本次修行的数量，如：108</Text>
            <TextInput
              style={styles.textInput}
              value={count}
              onChangeText={setCount}
              keyboardType="numeric"
              placeholder="108"
            />
          </View>

          {/* Notes Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>备注（可选）</Text>
            <Text style={styles.inputHint}>
              记录您在这次修行中的体验、感悟...
            </Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              placeholder="例如：今日顶礼时心境平静，体会到三宝的加持..."
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {notes.length} 字
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomContainer}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
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
    height: 100,
    textAlignVertical: 'top'
  },
  characterCount: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'right',
    marginTop: 4
  },
  bottomContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
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
    color: 'white',
    fontSize: 18,
    fontWeight: '600'
  }
});
