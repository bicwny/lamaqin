
import React from 'react';
import { Text, View, TextInput, TouchableOpacity, FlatList } from 'react-native';
import PageTemplate from '@/components/PageTemplate';
import { Colors } from '@/constants/Colors';

// Example 1: Default Variant (existing behavior)
export function DefaultVariantExample() {
  return (
    <PageTemplate
      title="默认页面"
      showBackButton={true}
      onBackPress={() => console.log('Back pressed')}
    >
      <Text>这是默认的页面模板样式</Text>
    </PageTemplate>
  );
}

// Example 2: Modal Variant
export function ModalVariantExample() {
  return (
    <PageTemplate
      variant="modal"
      title="弹窗页面"
      modalCloseButton={true}
      onClose={() => console.log('Modal closed')}
      subtitle="这是一个弹窗页面"
    >
      <View style={{ padding: 16 }}>
        <Text>弹窗内容</Text>
        <TouchableOpacity style={{ marginTop: 16, padding: 12, backgroundColor: Colors.primary, borderRadius: 8 }}>
          <Text style={{ color: 'white', textAlign: 'center' }}>保存</Text>
        </TouchableOpacity>
      </View>
    </PageTemplate>
  );
}

// Example 3: Auth Variant
export function AuthVariantExample() {
  return (
    <PageTemplate
      variant="auth"
      title="登录"
    >
      <View style={{ width: '100%', maxWidth: 400 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 32 }}>
          欢迎回来
        </Text>
        <TextInput
          style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 16 }}
          placeholder="邮箱地址"
          keyboardType="email-address"
        />
        <TextInput
          style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 24 }}
          placeholder="验证码"
          keyboardType="number-pad"
        />
        <TouchableOpacity style={{ backgroundColor: Colors.primary, padding: 16, borderRadius: 8 }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>登录</Text>
        </TouchableOpacity>
      </View>
    </PageTemplate>
  );
}

// Example 4: Form Variant
export function FormVariantExample() {
  return (
    <PageTemplate
      variant="form"
      title="编辑资料"
      showBackButton={true}
      onBackPress={() => console.log('Back pressed')}
    >
      <View style={{ gap: 16 }}>
        <View>
          <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 8 }}>用户名</Text>
          <TextInput
            style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8 }}
            placeholder="请输入用户名"
          />
        </View>
        <View>
          <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 8 }}>邮箱</Text>
          <TextInput
            style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8 }}
            placeholder="请输入邮箱"
            keyboardType="email-address"
          />
        </View>
        <View>
          <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 8 }}>个人简介</Text>
          <TextInput
            style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, minHeight: 100 }}
            placeholder="请输入个人简介"
            multiline
            textAlignVertical="top"
          />
        </View>
        <TouchableOpacity style={{ backgroundColor: Colors.primary, padding: 16, borderRadius: 8, marginTop: 16 }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>保存修改</Text>
        </TouchableOpacity>
      </View>
    </PageTemplate>
  );
}

// Example 5: List Variant
export function ListVariantExample() {
  const data = [
    { id: '1', title: '修行记录 1', date: '2024-01-01' },
    { id: '2', title: '修行记录 2', date: '2024-01-02' },
    { id: '3', title: '修行记录 3', date: '2024-01-03' },
  ];

  return (
    <PageTemplate
      variant="list"
      title="修行历史"
      showBackButton={true}
      onBackPress={() => console.log('Back pressed')}
    >
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
            <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.title}</Text>
            <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>{item.date}</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </PageTemplate>
  );
}
