
import { Link } from 'expo-router';
import PageTemplate from '@/components/PageTemplate';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet } from 'react-native';

export default function NotFoundScreen() {
  return (
    <PageTemplate
      title="页面未找到"
      showBackButton={false}
      scrollable={false}
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title">这个页面不存在</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">返回首页</ThemedText>
        </Link>
      </ThemedView>
    </PageTemplate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
