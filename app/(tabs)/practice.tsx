import React, { useState, useEffect } from "react";
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
import ProgressBar from "@/components/ProgressBar";
import { DesignSystem } from "@/constants/DesignSystem";
import { ComponentTokens, ComponentTextStyles } from "@/utils/componentTokens";
import { presetProjectNameService } from "@/lib/database";
import { toastService } from "@/lib/toast";

interface PracticeProject {
  id: string;
  user_id: string;
  practice_id: string;
  target_count: number;
  current_count: number;
  daily_target: number;
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
    if (project.practices.type === "count") {
      const percentage = Math.min(
        (project.current_count / project.target_count) * 100,
        100,
      );
      return {
        current: project.current_count,
        target: project.target_count,
        percentage: percentage,
        isCompleted: project.current_count >= project.target_count,
      };
    } else {
      // For time-based practices, calculate based on sessions
      return {
        current: project.current_count,
        target: project.target_count,
        percentage: Math.min(
          (project.current_count / project.target_count) * 100,
          100,
        ),
        isCompleted: project.current_count >= project.target_count,
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
      // For meditation practices, navigate to the meditation record modal
      router.push({
        pathname: "/modals/meditation-record",
        params: {
          projectId: projectId,
          practiceId: project.practice_id,
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

    // Use unified practice detail page for both count and time-based practices
    router.push({
      pathname: "/practice-detail/[practiceId]",
      params: {
        practiceId: projectId,
      },
    });
  };

  const renderPracticeItem = ({ item }: { item: PracticeProject }) => {
    const progress = calculateProgress(item);
    const presetName = item.preset_project_id
      ? presetProjectNames[item.preset_project_id]
      : null;
    const displayName = item.project_name || presetName || "预设项目";

    return (
      <View style={styles.practiceItem}>
        <View style={styles.practiceHeader}>
          <View style={styles.practiceInfo}>
            <Text style={styles.practiceName}>{item.practices.name}</Text>
            {(item.project_name || item.preset_project_id) && (
              <Text style={styles.programName}>{displayName}</Text>
            )}
          </View>
          {progress.isCompleted && (
            <Text style={styles.completedBadge}>✅</Text>
          )}
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {progress.current.toLocaleString()}/{progress.target.toLocaleString()} {item.practices.unit}
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.round(progress.percentage)}%
            </Text>
          </View>
          <ProgressBar 
            progress={progress.percentage} 
            size="thick"
            containerStyle={styles.progressBar}
          />
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleCustomRecord(item.id, item.practices.name)}
          >
            <Text style={styles.actionButtonText}>记录</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.viewDetailsButton]}
            onPress={() => handleViewDetails(item.id, item.practices.name)}
          >
            <Text style={styles.actionButtonText}>详情</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <PageTemplate
        title="修行记录"
        rightAction={{
          text: "添加",
          onPress: handleAddPractice,
        }}
        scrollable={false}
        backgroundColor={DesignSystem.colors.background}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DesignSystem.colors.primary} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </PageTemplate>
    );
  }

  if (projects.length === 0) {
    return (
      <PageTemplate
        title="修行记录"
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
            style={styles.browseButton}
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
      title="修行记录"
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
    padding: DesignSystem.spacing.lg,
  },
  practiceItem: {
    ...ComponentTokens.card.variants.outlined,
    padding: ComponentTokens.card.padding.comfortable,
    marginBottom: ComponentTokens.card.margin.standard,
  },
  practiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: DesignSystem.spacing.md,
  },
  practiceInfo: {
    flex: 1,
  },
  practiceName: {
    ...ComponentTextStyles.subheading,
    marginBottom: DesignSystem.spacing.xs,
  },
  programName: {
    ...ComponentTextStyles.label,
    color: DesignSystem.colors.textSecondary,
  },
  completedBadge: {
    fontSize: DesignSystem.typography.fontSize.lg,
  },
  progressContainer: {
    marginBottom: DesignSystem.spacing.lg,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: DesignSystem.spacing.sm,
  },
  progressText: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.textPrimary,
  },
  progressPercentage: {
    ...ComponentTextStyles.label,
    color: DesignSystem.colors.primary,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
  progressBar: {
    flex: 1,
    marginRight: 12,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: DesignSystem.spacing.md,
  },
  actionButton: {
    ...ComponentTokens.button.variants.secondary,
    ...ComponentTokens.button.sizes.medium,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  viewDetailsButton: {
    ...ComponentTokens.button.variants.primary,
  },
  actionButtonText: {
    ...ComponentTextStyles.button.secondary,
  },
});