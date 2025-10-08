import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';
import PageTemplate from '@/components/PageTemplate';

export default function StatsScreen() {
  return (
    <PageTemplate title="回向" subtitle="诸佛菩萨如何回向 我亦如是回向" scrollable={false} padding={0}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.dedicationContainer}>
          <Text style={styles.dedicationText}>
            所南德义檀嘉热巴涅    此福已得一切智{'\n'}
            托内尼波札南潘协将    摧伏一切过患敌{'\n'}
            杰嘎纳齐瓦隆彻巴耶    生老病死犹波涛{'\n'}
            哲波措利卓瓦卓瓦效    愿度有海诸有情
          </Text>
          
          <Text style={styles.dedicationText}>
            文殊师利勇猛智  普贤慧行亦复然{'\n'}
            我今回向诸善根  随彼一切常修学{'\n'}
            三世诸佛所称叹  如是最胜诸大愿{'\n'}
            我今回向诸善根  为得普贤殊胜行{'\n'}
            生生世世不离师  恒时享用盛法乐{'\n'}
            圆满地道功德已  唯愿速得金刚持
          </Text>
        </View>
      </ScrollView>
    </PageTemplate>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingVertical: DesignSystem.spacing['4xl'],
  },
  dedicationContainer: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.xl,
  },
  dedicationText: {
    fontSize: DesignSystem.typography.fontSize.lg,
    color: DesignSystem.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: DesignSystem.spacing.xl,
    fontWeight: DesignSystem.typography.fontWeight.medium as any,
  },
});
