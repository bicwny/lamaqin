
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface Practice {
  id: string;
  name: string;
  type: string;
  unit: string;
  description: string;
}

export default function AddPracticeScreen() {
  const { user } = useAuth();
  const [practices, setPractices] = useState<Practice[]>([]);
  const [filteredPractices, setFilteredPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadPractices();
  }, []);

  useEffect(() => {
    // Filter practices based on search text
    if (searchText.trim() === '') {
      setFilteredPractices(practices);
    } else {
      const filtered = practices.filter(practice =>
        practice.name.toLowerCase().includes(searchText.toLowerCase()) ||
        practice.description?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredPractices(filtered);
    }
  }, [searchText, practices]);

  const loadPractices = async () => {
    try {
      console.log('🔄 Loading available practices...');

      // Get all practices - no filtering, allow multiple projects for same practice
      const { data: allPractices, error: practicesError } = await supabase
        .from('practices')
        .select('*')
        .order('name');

      if (practicesError) throw practicesError;

      console.log('📋 Available practices:', allPractices?.length || 0);
      console.log('🔍 Available practice names:', allPractices?.map(p => p.name) || []);
      setPractices(allPractices || []);
      setFilteredPractices(allPractices || []);
    } catch (error) {
      console.error('Error loading practices:', error);
      Alert.alert('错误', '加载修行项目失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePracticeSelect = (practice: Practice) => {
    // Navigate to configuration page with practice details
    router.push({
      pathname: '/practice-config',
      params: {
        practiceId: practice.id,
        practiceName: practice.name,
        practiceType: practice.type,
        practiceUnit: practice.unit,
      },
    });
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>取消</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>选择项目名称</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>加载修行项目中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (practices.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>取消</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>选择项目名称</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>🔄 加载中...</Text>
          <Text style={styles.emptyDescription}>
            正在加载修行项目
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>取消</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>选择项目名称</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索预设名称或输入自定义名称..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Practice List */}
      <ScrollView style={styles.practiceList} showsVerticalScrollIndicator={false}>
        {filteredPractices.map((practice) => (
          <TouchableOpacity
            key={practice.id}
            style={styles.practiceItem}
            onPress={() => handlePracticeSelect(practice)}
          >
            <View style={styles.practiceInfo}>
              <Text style={styles.practiceName}>
                {practice.name}
              </Text>
              <Text style={styles.practiceSubtitle}>
                {practice.type === 'count' ? '计数类修行' : '计时类修行'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        ))}
        
        {filteredPractices.length === 0 && searchText.trim() !== '' && (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>未找到匹配的修行项目</Text>
            <Text style={styles.noResultsSubtext}>请尝试其他关键词</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 0.5,
    borderBottomColor: '#C7C7CC',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontSize: 17,
    color: Colors.primary,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 50, // Same width as cancel button to center the title
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 0.5,
    borderBottomColor: '#C7C7CC',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  practiceList: {
    flex: 1,
  },
  practiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#C7C7CC',
  },
  practiceInfo: {
    flex: 1,
  },
  practiceName: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000',
    marginBottom: 2,
  },
  practiceSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  noResultsText: {
    fontSize: 17,
    color: '#8E8E93',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
  },
});
