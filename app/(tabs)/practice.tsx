import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import PageTemplate from "@/components/PageTemplate";
import CalendarView from "@/components/CalendarView";
import { DesignSystem } from "@/constants/DesignSystem";
import {
  ComponentTokens,
  ComponentTextStyles,
} from "@/utils/componentTokens";
import { presetProjectNameService } from "@/lib/database";
import { toastService } from "@/lib/toast";
import { clearCalendarCache } from "@/lib/calendarCache";

type TabType = 'practices' | 'calendar';

interface PracticeProject {
  id: string;
  user_id: string;
  practice_id: string;
  total_target?: number;
  current_count: number;
  daily_target?: number;
  weekly_target?: number;
  target_period: string;
  start_date: string;
  target_end_date: string;
  status: string;
  practices: {
    id: string;
    name: string;
    type: string;
    unit: string;
    description: string;
  };
}

interface MeditationRecord {
  id: string;
  user_id: string;
  practice_id: string;
  record_date: string;
  duration_minutes: number;
  session_number?: number;
  created_at: string;
}

export default function PracticeScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('practices');
  const [projects, setProjects] = useState<PracticeProject[]>([]);
  const [presetProjectNames, setPresetProjectNames] = useState<{
    [key: string]: string;
  }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [calendarKey, setCalendarKey] = useState(0);

  const handleTabChange = async (tabKey: TabType) => {
    if (tabKey === 'calendar') {
      await clearCalendarCache();
      setCalendarKey(prev => prev + 1);
    }
    setActiveTab(tabKey);
  };

  useEffect(() => {
    if (user) {
      loadPracticeData();
    }
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      loadPracticeData();
    }, [user]),
  );

  const loadPracticeData = async () => {
    if (!user) return;

    try {
      console.log("🔄 Loading practice data for user:", user.id);

      const { data: practiceProjects, error } = await supabase
        .from("user_practice_projects")
        .select(
          `
          *,
          practices (
            id,
            name,
            type,
            unit,
            description
          )
        `,
        )
        .eq("user_id", user.id)
        .in("status", ["active", "not_started", "completed"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log("📋 User practice projects:", practiceProjects);
      console.log(
        "📋 Loaded practice projects:",
        practiceProjects?.length || 0,
      );

      const presetIds =
        practiceProjects
          ?.filter((p) => p.preset_project_id)
          .map((p) => p.preset_project_id) || [];
      if (presetIds.length > 0) {
        try {
          const presets =
            await presetProjectNameService.getPresetProjectNames();
          const presetMap: { [key: string]: string } = {};
          presets.forEach((preset) => {
            presetMap[preset.id] = preset.name;
          });
          setPresetProjectNames(presetMap);
        } catch (presetError) {
          console.error("Error loading preset project names:", presetError);
        }
      }

      const timePractices = practiceProjects?.filter(p => p.practices?.type === 'time') || [];
      if (timePractices.length > 0) {
        const practiceIds = timePractices.map(p => p.practice_id);
        
        const { data: meditationCounts, error: countError } = await supabase
          .from('meditation_records')
          .select('practice_id')
          .eq('user_id', user.id)
          .in('practice_id', practiceIds);
        
        if (!countError && meditationCounts) {
          const countMap: { [key: string]: number } = {};
          meditationCounts.forEach(record => {
            countMap[record.practice_id] = (countMap[record.practice_id] || 0) + 1;
          });
          
          practiceProjects?.forEach(project => {
            if (project.practices?.type === 'time') {
              const actualCount = countMap[project.practice_id] || 0;
              if (project.current_count !== actualCount) {
                console.log(`📊 Correcting count for ${project.practices.name}: ${project.current_count} -> ${actualCount}`);
                project.current_count = actualCount;
              }
            }
          });
        }
      }

      setProjects(practiceProjects || []);
    } catch (error) {
      console.error("Error loading practice data:", error);
      toastService.error({
        title: "❌ 加载失败",
        message: "修行数据加载失败，请重试",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPracticeData();
  };

  const calculateProgress = (project: PracticeProject) => {
    if (!project.total_target) {
      return {
        current: project.current_count,
        target: null,
        percentage: 0,
        isCompleted: false,
      };
    }

    if (project.practices.type === "count") {
      const percentage = Math.min(
        (project.current_count / project.total_target) * 100,
        100,
      );
      return {
        current: project.current_count,
        target: project.total_target,
        percentage: percentage,
        isCompleted: project.current_count >= project.total_target,
      };
    } else {
      return {
        current: project.current_count,
        target: project.total_target,
        percentage: Math.min(
          (project.current_count / project.total_target) * 100,
          100,
        ),
        isCompleted: project.current_count >= project.total_target,
      };
    }
  };

  const handleAddPractice = () => {
    router.push("/add-practice");
  };

  const handleCustomRecord = async (
    projectId: string,
    practiceName: string,
  ) => {
    console.log(
      "🔄 handleCustomRecord called with project:",
      projectId,
      practiceName,
    );

    const project = projects.find((p) => p.id === projectId);
    if (!project) {
      toastService.error({ title: "❌ 项目错误", message: "未找到修行项目" });
      return;
    }

    if (project.practices.type === "time") {
      router.push({
        pathname: "/modals/meditation-record",
        params: {
          practiceId: project.practice_id,
          practiceProjectId: projectId,
          practiceName: practiceName,
        },
      });
    } else {
      router.push({
        pathname: "/modals/custom-record",
        params: {
          projectId: projectId,
          practiceName: practiceName,
          practiceType: project.practices.type,
        },
      });
    }
  };

  const handleViewDetails = (projectId: string, practiceName: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) {
      toastService.error({ title: "❌ 项目错误", message: "未找到修行项目" });
      return;
    }

    router.push({
      pathname: "/practice-history",
      params: {
        projectId: projectId,
        practiceName: practiceName,
      },
    });
  };

  const renderPracticeItem = ({ item }: { item: PracticeProject }) => {
    const progress = calculateProgress(item);
    const unit = item.practices.type === 'time' ? '座' : item.practices.unit;

    return (
      <View key={item.id} style={styles.practiceItem}>
        <View style={styles.cardRow}>
          <View style={styles.cardContent}>
            <Text style={styles.practiceName}>{item.practices.name}</Text>
            
            <Text style={styles.progressText}>
              {progress.target 
                ? `${(progress.current ?? 0).toLocaleString()}/${progress.target.toLocaleString()}${unit}`
                : `圆满${(progress.current ?? 0).toLocaleString()}${unit}`
              }
            </Text>
            
            {progress.target && (
              <Text style={[
                styles.percentageText,
                progress.isCompleted && styles.percentageCompleted
              ]}>
                {Math.round(progress.percentage)}%
              </Text>
            )}
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => handleViewDetails(item.id, item.practices.name)}
            >
              <Ionicons
                name="document-text-outline"
                size={22}
                color={DesignSystem.colors.textSecondary}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.circleButton, styles.circleButtonPrimary]}
              onPress={() => handleCustomRecord(item.id, item.practices.name)}
            >
              <Ionicons
                name="add"
                size={24}
                color={DesignSystem.colors.redTara}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'practices', label: '功课', icon: 'flower-outline' },
    { key: 'calendar', label: '日历', icon: 'calendar-outline' },
  ];

  const renderTabContent = () => {
    if (activeTab === 'practices') {
      if (projects.length === 0) {
        return (
          <View style={styles.emptyState}>
            <View style={styles.iconContainer}>
              <Ionicons name="flower-outline" size={80} color="#9CA3AF" />
            </View>

            <Text style={styles.emptyTitle}>开始你的修行之旅</Text>
            <Text style={styles.emptyDescription}>
              添加你的第一个修行项目，开始记录你的精神成长历程
            </Text>

            <TouchableOpacity
              style={[styles.browseButton, { backgroundColor: DesignSystem.colors.redTara }]}
              onPress={handleAddPractice}
            >
              <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
              <Text style={styles.browseButtonText}>添加修行项目</Text>
            </TouchableOpacity>
          </View>
        );
      }

      return (
        <FlatList
          data={projects}
          renderItem={renderPracticeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      );
    }

    if (activeTab === 'calendar') {
      return (
        <ScrollView 
          style={styles.calendarScrollView}
          contentContainerStyle={styles.calendarScrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {user && (
            <View style={styles.calendarContainer}>
              <CalendarView key={calendarKey} userId={user.id} />
            </View>
          )}
        </ScrollView>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <PageTemplate
        title="修行"
        subtitle="如人饮水，冷暖自知"
        rightAction={{
          text: "添加",
          onPress: handleAddPractice,
        }}
        scrollable={false}
        backgroundColor={DesignSystem.colors.background}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DesignSystem.colors.redTara} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="修行"
      subtitle="如人饮水，冷暖自知"
      rightAction={{
        text: "添加",
        onPress: handleAddPractice,
      }}
      scrollable={false}
      backgroundColor={DesignSystem.colors.background}
      padding={0}
    >
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabItem,
              activeTab === tab.key && styles.tabItemActive
            ]}
            onPress={() => handleTabChange(tab.key)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={activeTab === tab.key ? DesignSystem.colors.primary : DesignSystem.colors.textTertiary} 
            />
            <Text style={[
              styles.tabLabel,
              activeTab === tab.key && styles.tabLabelActive
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {renderTabContent()}
      </View>
    </PageTemplate>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: DesignSystem.colors.background,
  },
  loadingText: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.textSecondary,
    marginTop: DesignSystem.spacing.md,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    marginHorizontal: DesignSystem.spacing.lg,
    marginTop: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.xs,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignSystem.spacing.xs,
    paddingVertical: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.md,
  },
  tabItemActive: {
    backgroundColor: DesignSystem.colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabLabel: {
    ...ComponentTextStyles.label,
    color: DesignSystem.colors.textTertiary,
  },
  tabLabelActive: {
    color: DesignSystem.colors.primary,
    fontWeight: DesignSystem.typography.fontWeight.semibold as any,
  },
  tabContent: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: DesignSystem.spacing.xl,
    backgroundColor: DesignSystem.colors.background,
  },
  iconContainer: {
    marginBottom: DesignSystem.spacing.xl,
  },
  emptyTitle: {
    ...ComponentTextStyles.heading,
    textAlign: "center",
    marginBottom: DesignSystem.spacing.md,
  },
  emptyDescription: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.textSecondary,
    textAlign: "center",
    marginBottom: DesignSystem.spacing["2xl"],
  },
  browseButton: {
    ...ComponentTokens.button.variants.primary,
    ...ComponentTokens.button.sizes.large,
    flexDirection: "row",
    alignItems: "center",
    gap: DesignSystem.spacing.sm,
  },
  browseButtonText: {
    ...ComponentTextStyles.button.primary,
    fontSize: DesignSystem.typography.fontSize.base,
  },
  listContainer: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.xl,
  },
  practiceItem: {
    ...ComponentTokens.card.variants.outlined,
    padding: ComponentTokens.card.padding.comfortable,
    marginBottom: ComponentTokens.card.margin.spacious,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    paddingRight: DesignSystem.spacing.md,
  },
  practiceName: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.textPrimary,
    marginBottom: DesignSystem.spacing.xs,
  },
  progressText: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.textSecondary,
    marginBottom: DesignSystem.spacing.xs,
  },
  percentageText: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.redTara,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  percentageCompleted: {
    color: DesignSystem.colors.greenTara,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: DesignSystem.spacing.sm,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border,
    backgroundColor: DesignSystem.colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  circleButtonPrimary: {
    borderColor: DesignSystem.colors.redTara,
  },
  calendarScrollView: {
    flex: 1,
  },
  calendarScrollContent: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.xl,
  },
  calendarContainer: {
    flex: 1,
  },
});
