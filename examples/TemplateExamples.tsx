
import React from 'react';
import { Text, View, TextInput, TouchableOpacity } from 'react-native';
import ModalTemplate from '@/components/ModalTemplate';
import LessonTemplate from '@/components/LessonTemplate';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Example Modal Usage
export function ExampleModal() {
  return (
    <ModalTemplate
      title="自定义记录"
      onClose={() => router.back()}
      rightAction={{
        text: "保存",
        onPress: () => {/* handle save */}
      }}
      showCloseButton={true}
    >
      <View style={{ gap: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>
          📿 大礼拜
        </Text>
        
        <View>
          <Text style={{ fontSize: 16, marginBottom: 8 }}>
            修行时长（分钟）
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
            }}
            placeholder="30"
            keyboardType="numeric"
          />
        </View>
        
        <TouchableOpacity
          style={{
            backgroundColor: Colors.primary,
            padding: 16,
            borderRadius: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            保存记录
          </Text>
        </TouchableOpacity>
      </View>
    </ModalTemplate>
  );
}

// Example Lesson Viewer Usage
export function ExampleLessonViewer() {
  return (
    <LessonTemplate
      title="第1课"
      headerLeft={
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
      }
      headerRight={
        <TouchableOpacity onPress={() => {/* handle open */}}>
          <Ionicons name="open-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      }
    >
      <ThemedText type="title" style={{ marginBottom: 20 }}>
        课程内容
      </ThemedText>
      
      <ThemedText style={{ lineHeight: 24 }}>
        这里是课程的详细内容。可以包含文字、图片、视频等各种学习材料。
        模板提供了统一的布局和样式，确保所有课程页面都有一致的用户体验。
      </ThemedText>
      
      <View style={{ 
        marginTop: 30, 
        padding: 16, 
        backgroundColor: 'white', 
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
        <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
          学习要点
        </ThemedText>
        <ThemedText>
          • 专注当下的体验
          • 保持正念观察
          • 不做过多思维分析
        </ThemedText>
      </View>
    </LessonTemplate>
  );
}
