import { Image } from 'expo-image';
import { Platform, StyleSheet, View, Text } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
        />
      }>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937' }}>探索</Text>
      </View>
      <Text style={{ fontSize: 16, color: '#4b5563', lineHeight: 24 }}>此应用包含示例代码以帮助您入门。</Text>
      <Collapsible title="基于文件的路由">
        <Text style={{ fontSize: 14, color: '#374151', lineHeight: 20 }}>
          此应用有多个屏幕：{' '}
          <Text style={{ fontWeight: '600' }}>app/(tabs)/index.tsx</Text> 和{' '}
          <Text style={{ fontWeight: '600' }}>app/(tabs)/explore.tsx</Text>
        </Text>
        <Text style={{ fontSize: 14, color: '#374151', lineHeight: 20, marginTop: 8 }}>
          布局文件在 <Text style={{ fontWeight: '600' }}>app/(tabs)/_layout.tsx</Text>{' '}
          中设置选项卡导航器。
        </Text>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <Text style={{ color: '#3b82f6', fontSize: 14, textDecorationLine: 'underline' }}>了解更多</Text>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Android、iOS 和 Web 支持">
        <Text style={{ fontSize: 14, color: '#374151', lineHeight: 20 }}>
          您可以在 Android、iOS 和 Web 上打开此项目。要打开 Web 版本，请在运行此项目的终端中按{' '}
          <Text style={{ fontWeight: '600' }}>w</Text>。
        </Text>
      </Collapsible>
      <Collapsible title="Images">
        <ThemedText>
          For static images, you can use the <ThemedText type="defaultSemiBold">@2x</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to provide files for
          different screen densities
        </ThemedText>
        <Image source={require('@/assets/images/react-logo.png')} style={{ alignSelf: 'center' }} />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Custom fonts">
        <ThemedText>
          Open <ThemedText type="defaultSemiBold">app/_layout.tsx</ThemedText> to see how to load{' '}
          <ThemedText style={{ fontFamily: 'SpaceMono' }}>
            custom fonts such as this one.
          </ThemedText>
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/versions/latest/sdk/font">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Light and dark mode components">
        <ThemedText>
          This template has light and dark mode support. The{' '}
          <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook lets you inspect
          what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Animations">
        <ThemedText>
          This template includes an example of an animated component. The{' '}
          <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText> component uses
          the powerful <ThemedText type="defaultSemiBold">react-native-reanimated</ThemedText>{' '}
          library to create a waving hand animation.
        </ThemedText>
        {Platform.select({
          ios: (
            <ThemedText>
              The <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
              component provides a parallax effect for the header image.
            </ThemedText>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
