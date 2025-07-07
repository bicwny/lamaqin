
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Alert
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { COMMON_TIMEZONES, saveUserTimezone, type TimezoneInfo } from '@/lib/timezone';

interface TimezoneSelectorProps {
  currentTimezone: TimezoneInfo;
  onTimezoneChange: (timezone: TimezoneInfo) => void;
}

export default function TimezoneSelector({ currentTimezone, onTimezoneChange }: TimezoneSelectorProps) {
  const [showModal, setShowModal] = useState(false);

  const handleTimezoneSelect = async (timezone: { timezone: string; name: string }) => {
    try {
      const timezoneInfo: TimezoneInfo = {
        timezone: timezone.timezone,
        offset: getTimezoneOffset(timezone.timezone),
        displayName: timezone.name
      };

      await saveUserTimezone(timezoneInfo);
      onTimezoneChange(timezoneInfo);
      setShowModal(false);

      Alert.alert(
        '时区已更新',
        `时区已更改为 ${timezoneInfo.displayName}。应用将在下次启动时使用新时区进行日期计算。`,
        [{ text: '确定' }]
      );
    } catch (error) {
      console.error('❌ Error updating timezone:', error);
      Alert.alert('错误', '更新时区失败，请重试');
    }
  };

  const renderTimezoneItem = ({ item }: { item: { timezone: string; name: string } }) => {
    const isSelected = item.timezone === currentTimezone.timezone;
    
    return (
      <TouchableOpacity
        style={[styles.timezoneItem, isSelected && styles.selectedItem]}
        onPress={() => handleTimezoneSelect(item)}
      >
        <Text style={[styles.timezoneText, isSelected && styles.selectedText]}>
          {item.name}
        </Text>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>时区设置</Text>
      <TouchableOpacity style={styles.selector} onPress={() => setShowModal(true)}>
        <Text style={styles.currentTimezone}>{currentTimezone.displayName}</Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>
      
      <Text style={styles.hint}>
        当前时区用于确定每日修行记录的重置时间
      </Text>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.cancelButton}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>选择时区</Text>
            <View style={styles.placeholder} />
          </View>
          
          <FlatList
            data={COMMON_TIMEZONES}
            renderItem={renderTimezoneItem}
            keyExtractor={(item) => item.timezone}
            style={styles.list}
          />
        </View>
      </Modal>
    </View>
  );
}

function getTimezoneOffset(timezone: string): number {
  try {
    const now = new Date();
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
    return Math.round((targetTime.getTime() - utc.getTime()) / 60000);
  } catch {
    return 0;
  }
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  currentTimezone: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  arrow: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  hint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cancelButton: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  placeholder: {
    width: 50,
  },
  list: {
    flex: 1,
  },
  timezoneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedItem: {
    backgroundColor: '#F8F9FF',
  },
  timezoneText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  selectedText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold',
  },
});
