
import React from 'react';
import { Text, View } from 'react-native';
import PageTemplate from '@/components/PageTemplate';
import CardContainer from '@/components/CardContainer';
import ActionButtonRow from '@/components/ActionButtonRow';
import SectionTitle from '@/components/SectionTitle';
import { Colors } from '@/constants/Colors';

export default function ExamplePage() {
  return (
    <PageTemplate
      title="页面标题"
      showBackButton={true}
      onBackPress={() => {/* handle back */}}
      rightAction={{
        text: "编辑",
        onPress: () => {/* handle edit */}
      }}
    >
      <SectionTitle title="课程学习" marginHorizontal={16} />
      
      <CardContainer>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
          《修心七要》
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
          听传承: 0次 | 看法本: 0次
        </Text>
        
        <ActionButtonRow
          buttons={[
            {
              text: "听传承",
              onPress: () => {},
              backgroundColor: '#10B981'
            },
            {
              text: "看法本", 
              onPress: () => {},
              backgroundColor: Colors.primary
            },
            {
              text: "在线课程",
              onPress: () => {},
              backgroundColor: '#F59E0B'
            }
          ]}
        />
      </CardContainer>

      <SectionTitle title="修行实践" marginHorizontal={16} />
      
      <CardContainer>
        <Text>修行内容...</Text>
      </CardContainer>
    </PageTemplate>
  );
}
