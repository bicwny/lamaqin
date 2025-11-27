import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import PageTemplate from "@/components/PageTemplate";
import { DesignSystem } from "@/constants/DesignSystem";
import {
  ComponentTokens,
  ComponentTextStyles,
} from "@/utils/componentTokens";
import { presetProjectNameService } from "@/lib/database";
import { toastService } from "@/lib/toast";

interface PracticeProject {
  id: string;
  user_id: string;
  practice_id: string;
  total_target?: number;  // 可选：持续修行时为null
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
  const [projects, setProjects] = useState<PracticeProject[]>([]);
  const [presetProjectNames, setPresetProjectNames] = useState<{
    [key: string]: string;
  }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log("📋 User practice projects:", practiceProjects);
      console.log(
        "📋 Loaded practice projects:",
        practiceProjects?.length || 0,
      );

      // Load preset project names for projects that use presets
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
    // 如果没有总目标，表示持续修行，只显示当前进度
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
      // For time-based practices, calculate based on sessions
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
      // For time-based practices, open meditation record modal directly
      router.push({
        pathname: "/modals/meditation-record",
        params: {
          practiceId: project.practice_id,
          practiceProjectId: projectId,
          practiceName: practiceName,
        },
      });
    } else {
      // For count-based practices, show simple input
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

    // Navigate to practice-history page (deprecated practice-detail)
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
        {/* Row layout: Left content + Right action buttons */}
        <View style={styles.cardRow}>
          {/* Left side: Title, progress, percentage */}
          <View style={styles.cardContent}>
            {/* Practice name - large title */}
            <Text style={styles.practiceName}>{item.practices.name}</Text>
            
            {/* Progress line */}
            <Text style={styles.progressText}>
              {progress.target 
                ? `${(progress.current ?? 0).toLocaleString()}/${progress.target.toLocaleString()}${unit}`
                : `${(progress.current ?? 0).toLocaleString()}${unit}`
              }
            </Text>
            
            {/* Percentage - only show when there's a target */}
            {progress.target && (
              <Text style={[
                styles.percentageText,
                progress.isCompleted && styles.percentageCompleted
              ]}>
                {Math.round(progress.percentage)}%
              </Text>
            )}
          </View>
          
          {/* Right side: Two circular action buttons */}
          <View style={styles.actionButtons}>
            {/* History button */}
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
            
            {/* Add record button */}
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

  if (projects.length === 0) {
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
  calendarSection: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.md,
  },
  sectionTitle: {
    ...ComponentTextStyles.subheading,
    marginBottom: DesignSystem.spacing.sm,
    color: DesignSystem.colors.textPrimary,
  },
});