import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { DesignSystem } from "@/constants/DesignSystem";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  console.log("🏠 TabLayout rendering at:", new Date().toISOString());

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: DesignSystem.colors.redTara,
        tabBarInactiveTintColor: DesignSystem.colors.textTertiary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: DesignSystem.colors.backgroundSecondary + 'F2', // 95% opacity
            borderTopWidth: 0.5,
            borderTopColor: DesignSystem.colors.border,
            shadowColor: DesignSystem.colors.cardShadow,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: DesignSystem.opacity[10],
            shadowRadius: DesignSystem.spacing.sm,
            paddingTop: DesignSystem.spacing.sm,
            paddingBottom: DesignSystem.spacing.xs,
            height: 88,
          },
          default: {
            backgroundColor: DesignSystem.colors.backgroundSecondary,
            borderTopWidth: 0.5,
            borderTopColor: DesignSystem.colors.border,
            elevation: 8,
            shadowColor: DesignSystem.colors.cardShadow,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: DesignSystem.opacity[10],
            shadowRadius: DesignSystem.spacing.sm,
            paddingTop: DesignSystem.spacing.sm,
            paddingBottom: DesignSystem.spacing.xs,
            height: 68,
          },
        }),
        tabBarLabelStyle: {
          fontSize: DesignSystem.typography.fontSize.xs,
          fontWeight: DesignSystem.typography.fontWeight.semibold,
          marginTop: DesignSystem.spacing.xxs / 3, // 2px equivalent
        },
      }}
      initialRouteName="index"
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "当日",
          tabBarActiveTintColor: DesignSystem.colors.orangeTara,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={28}
              name={focused ? "sunny" : "sunny-outline"}
              color={focused ? DesignSystem.colors.orangeTara : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: "闻思",
          tabBarActiveTintColor: DesignSystem.colors.yellowTara,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={28}
              name={focused ? "ear" : "ear-outline"}
              color={focused ? DesignSystem.colors.yellowTara : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mindfulness"
        options={{
          title: "心性",
          tabBarActiveTintColor: DesignSystem.colors.redTara,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={28}
              name={focused ? "ellipse" : "ellipse-outline"}
              color={focused ? DesignSystem.colors.redTara : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: "修行",
          tabBarActiveTintColor: DesignSystem.colors.greenTara,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={28}
              name={focused ? "heart" : "heart-outline"}
              color={focused ? DesignSystem.colors.greenTara : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "回向",
          tabBarActiveTintColor: DesignSystem.colors.blueTara,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={28}
              name={focused ? "moon" : "moon-outline"}
              color={focused ? DesignSystem.colors.blueTara : color}
            />
          ),
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