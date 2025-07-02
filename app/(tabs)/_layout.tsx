import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}
      initialRouteName="study">
      <Tabs.Screen
        name="study"
        options={{
          title: '闻思',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: '修行',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="hands.and.sparkles.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="mindfulness"
        options={{
          title: '心性',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: '统计',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '个人',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
          name="study"
          options={{
            title: '📚 闻思',
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol size={28} name={focused ? 'book.fill' : 'book'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="practice"
          options={{
            title: '📿 修行',
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol size={28} name={focused ? 'heart.fill' : 'heart'} color={color} />
            ),
          }}
        /></Tabs.Screen>
        <Tabs.Screen
          name="mindfulness"
          options={{
            title: '💝 心性',
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol size={28} name={focused ? 'brain.head.profile.fill' : 'brain.head.profile'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: '📊 统计',
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol size={28} name={focused ? 'chart.bar.fill' : 'chart.bar'} color={color} />
            ),
          }}
        />
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hide the default index tab
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide the explore tab
        }}
      />
    </Tabs>
  );
}