import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  console.log("🏠 TabLayout rendering at:", new Date().toISOString());

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            backgroundColor: "transparent",
          },
          default: {},
        }),
      }}
      initialRouteName="index"
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "问题",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={28}
              name={focused ? "book.fill" : "book"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: "闻思",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={28}
              name={focused ? "book.fill" : "book"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mindfulness"
        options={{
          title: "心性",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={28}
              name={focused ? "heart.fill" : "heart"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: "修行",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={28}
              name={focused ? "hands.and.sparkles.fill" : "hands.and.sparkles"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "统计",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={28}
              name={focused ? "chart.bar.fill" : "chart.bar"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null, // Hide the profile tab
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
