import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '页面未找到' }} />
      <View className="flex-1 items-center justify-center p-5 bg-gray-50">
        <Text className="text-2xl font-bold text-gray-800 mb-4">页面不存在</Text>
        <Link href="/" className="mt-4 py-4">
          <Text className="text-blue-500 text-base font-medium">返回首页</Text>
        </Link>
      </View>
    </>
  );
};
