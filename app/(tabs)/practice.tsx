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
      scrollable={true}
      backgroundColor={DesignSystem.colors.background}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: DesignSystem.colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: DesignSystem.colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: DesignSystem.colors.background,
  },
  iconContainer: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: DesignSystem.colors.textPrimary,
    marginBottom: 10,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 16,
    color: DesignSystem.colors.textSecondary,
    textAlign: "center",
    marginBottom: 30,
  },
  browseButton: {
    flexDirection: "row",
    backgroundColor: DesignSystem.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  browseButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  practiceItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  practiceName: {
    fontSize: 18,
    fontWeight: "bold",
    color: DesignSystem.colors.textPrimary,
    marginBottom: 8,
  },
  practiceDescription: {
    fontSize: 14,
    color: DesignSystem.colors.textSecondary,
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 12,
    color: DesignSystem.colors.textSecondary,
    marginBottom: 4,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionButton: {
    backgroundColor: DesignSystem.colors.secondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  viewDetailsButton: {
    backgroundColor: DesignSystem.colors.primary,
  },
  completedText: {
    color: DesignSystem.colors.success,
    fontWeight: "bold",
  },
});