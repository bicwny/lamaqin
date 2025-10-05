
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Colors } from '@/constants/Colors';

interface MeditationTopic {
  topic_number: number;
  title: string;
  description?: string;
}

interface TopicSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (topic: MeditationTopic) => void;
  topics: MeditationTopic[];
  selectedTopicNumber?: number;
  loading?: boolean;
}

export default function TopicSelectionModal({
  visible,
  onClose,
  onSelect,
  topics,
  selectedTopicNumber,
  loading = false
}: TopicSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTopics, setFilteredTopics] = useState<MeditationTopic[]>([]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTopics(topics);
    } else {
      const filtered = topics.filter(topic =>
        topic.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTopics(filtered);
    }
  }, [searchQuery, topics]);

  const handleTopicSelect = (topic: MeditationTopic) => {
    console.log('🟢 handleTopicSelect called with topic:', topic.title);
    onSelect(topic);
    onClose();
  };

  const renderTopicItem = ({ item }: { item: MeditationTopic }) => {
    const isSelected = selectedTopicNumber === item.topic_number;
    
    return (
      <TouchableOpacity
        style={[styles.topicItem, isSelected && styles.selectedTopicItem]}
        onPress={() => {
          console.log('🔵 Topic item pressed:', item.title);
          handleTopicSelect(item);
        }}
        activeOpacity={0.7}
        disabled={false}
        delayLongPress={500}
        delayPressIn={0}
        delayPressOut={100}
      >
        <Text 
          style={[styles.topicTitle, isSelected && styles.selectedTopicTitle]}
          selectable={false}
        >
          {item.title}
        </Text>
        {isSelected && (
          <Text style={styles.checkMark} selectable={false}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  const modalContent = (
    <>
      {/* Header */}
      <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>取消</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>选择观修内容</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="搜索观修内容..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            clearButtonMode="while-editing"
            editable={true}
            autoFocus={false}
            selectTextOnFocus={true}
            blurOnSubmit={false}
            returnKeyType="search"
          />
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>加载观修内容中...</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.topicsList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {filteredTopics.map((item, index) => (
              <View key={item.topic_number.toString()}>
                {renderTopicItem({ item })}
                {index < filteredTopics.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </ScrollView>
        )}

        {/* Empty State */}
        {!loading && filteredTopics.length === 0 && searchQuery.length > 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>未找到匹配的观修内容</Text>
            <Text style={styles.emptySubtext}>请尝试其他关键词</Text>
          </View>
        )}
    </>
  );

  if (Platform.OS === 'web') {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={onClose}
        transparent={false}
      >
        <SafeAreaView style={styles.container}>
          {modalContent}
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      supportedOrientations={['portrait']}
      statusBarTranslucent={false}
      transparent={false}
    >
      <SafeAreaView style={styles.container}>
        {modalContent}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    zIndex: 10,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
  },
  cancelButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 60,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 44,
    textAlignVertical: 'center',
  },
  topicsList: {
    flex: 1,
    backgroundColor: 'white',
    zIndex: 1,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    minHeight: 56,
    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
  },
  selectedTopicItem: {
    backgroundColor: '#f0f8ff',
  },
  topicTitle: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  selectedTopicTitle: {
    color: Colors.primary,
    fontWeight: '500',
  },
  checkMark: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f3f4',
    marginLeft: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});
