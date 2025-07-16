import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { presetProjectNameService } from "@/lib/database";
import PageTemplate from "@/components/PageTemplate";
import { toastService } from "@/lib/toast";
import { DesignSystem } from "@/constants/DesignSystem";
import {
  ComponentTokens,
  ComponentTextStyles,
  componentHelpers,
} from "@/utils/componentTokens";
import { Typography } from "@/utils/typography";
import ProgressBar from "@/components/ProgressBar";
import PracticeRecordCard from "@/components/PracticeRecordCard";

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
  project_name: string;
  preset_project_id: string;
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
  notes?: string;
  created_at: string;
}

// Define IconProps interface
interface IconProps {
  semantic: "completion";
}

// Icon Component (replace with your actual Icon component implementation)
const Icon: React.FC<IconProps> = ({ semantic }) => {
  // Replace this with your actual icon implementation
  // This is a placeholder, so it just returns a simple Text component
  const color = DesignSystem.colors.practiceComplete;
  return <Ionicons name="checkmark-circle" size={16} color={color} />;
};

export default function PracticeDetailScreen() {
  const { user } = useAuth();
  const { practiceId } = useLocalSearchParams<{ practiceId: string }>();

  const [project, setProject] = useState<PracticeProject | null>(null);
  const [presetProjectName, setPresetProjectName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayRecords, setTodayRecords] = useState<MeditationRecord[]>([]);
  const [weeklyRecords, setWeeklyRecords] = useState<MeditationRecord[]>([]);
  const [practiceRecords, setPracticeRecords] = useState<any[]>([]);

  useEffect(() => {
    if (user && practiceId) {
      loadPracticeData();
    }
  }, [user, practiceId]);

  useFocusEffect(
    React.useCallback(() => {
      if (user && practiceId) {
        loadPracticeData();
      }
    }, [user, practiceId]),
  );

  const loadPracticeData = async () => {
    if (!user || !practiceId) return;

    try {
      setLoading(true);

      // Load practice project
      const { data: practiceData, error } = await supabase
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
        .eq("id", practiceId)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      setProject(practiceData);

      // Load preset project name if needed
      if (practiceData.preset_project_id) {
        try {
          const presets =
            await presetProjectNameService.getPresetProjectNames();
          const preset = presets.find(
            (p) => p.id === practiceData.preset_project_id,
          );
          if (preset) {
            setPresetProjectName(preset.name);
          }
        } catch (presetError) {
          console.error("Error loading preset project name:", presetError);
        }
      }

      // Load meditation records if it's a time-based practice
      if (practiceData.practices.type === "time") {
        await loadMeditationRecords(practiceData);
      } else if (practiceData.practices.type === "count") {
        await loadPracticeRecords(practiceData.id);
      }
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

  const loadMeditationRecords = async (projectData: PracticeProject) => {
    if (!user?.id) return;

    try {
      const today = new Date().toISOString().split("T")[0];

      // Get today's records
      const { data: todayData, error: todayError } = await supabase
        .from("meditation_records")
        .select(
          "id, user_id, practice_id, record_date, duration_minutes, session_number, created_at",
        )
        .eq("user_id", user.id)
        .eq("practice_id", projectData.practice_id)
        .eq("record_date", today)
        .order("created_at", { ascending: true });

      if (todayError) throw todayError;

      // Get this week's records for weekly projects
      if (projectData.target_period === "weekly") {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const { data: weeklyData, error: weeklyError } = await supabase
          .from("meditation_records")
          .select(
            "id, user_id, practice_id, record_date, duration_minutes, session_number, created_at",
          )
          .eq("user_id", user.id)
          .eq("practice_id", projectData.practice_id)
          .gte("record_date", startOfWeek.toISOString().split("T")[0])
          .lte("record_date", endOfWeek.toISOString().split("T")[0])
          .order("created_at", { ascending: true });

        if (weeklyError) throw weeklyError;
        setWeeklyRecords(weeklyData || []);
      }

      setTodayRecords(todayData || []);
    } catch (error) {
      console.error("Error loading meditation records:", error);
    }
  };

  const loadPracticeRecords = async (projectId: string) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("daily_records")
        .select("*")
        .eq("user_id", user.id)
        .eq("practice_project_id", projectId)
        .order("record_date", { ascending: false })
        .limit(10); // Show last 10 records

      if (error) throw error;
      setPracticeRecords(data || []);
    } catch (error) {
      console.error("Error loading practice records:", error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPracticeData();
  };

  const calculateProgress = () => {
    if (!project)
      return { percentage: 0, current: 0, target: 0, isCompleted: false };

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

  const handleRecord = () => {
    if (!project) return;

    if (project.practices.type === "time") {
      // For meditation practices, navigate to the meditation record modal
      router.push({
        pathname: "/modals/meditation-record",
        params: {
          projectId: project.id,
          practiceId: project.practice_id,
          practiceName: project.practices.name,
        },
      });
    } else {
      // For count-based practices, show simple input
      router.push({
        pathname: "/modals/custom-record",
        params: {
          projectId: project.id,
          practiceName: project.practices.name,
          practiceType: project.practices.type,
        },
      });
    }
  };

  const handleViewHistory = () => {
    if (!project) return;

    if (project.practices.type === "time") {
      // For meditation practices, show meditation history
      router.push({
        pathname: "/meditation-history",
        params: {
          practiceId: project.practice_id,
          practiceName: project.practices.name,
        },
      });
    } else {
      // For count-based practices, show regular history
      router.push({
        pathname: "/practice-history",
        params: {
          projectId: project.id,
          practiceName: project.practices.name,
        },
      });
    }
  };

  const handleEditPractice = () => {
    if (!project) return;

    router.push({
      pathname: "/practice-config",
      params: {
        practiceId: project.practice_id,
        practiceName: project.practices.name,
        practiceType: project.practices.type,
        practiceUnit: project.practices.unit,
        practiceDescription: project.practices.description || "",
        editMode: "true",
        projectId: project.id,
        currentTargetCount: project.target_count.toString(),
        currentDailyTarget: project.daily_target.toString(),
        currentStartDate: project.start_date,
        currentEndDate: project.target_end_date || "",
        currentTargetPeriod: project.target_period,
        currentGoalType: project.goal_type || "total",
        currentProjectName: project.project_name || "",
        currentPresetId: project.preset_project_id || "",
      },
    });
  };

  const getDisplayProjectName = () => {
    if (!project) return "";
    return project.project_name || presetProjectName || "预设项目";
  };

  const renderRecentRecords = () => {
    if (!project) return null;

    if (project.practices.type === "time") {
      // Show recent meditation records
      const recentRecords = [...todayRecords, ...weeklyRecords]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 5);

      if (recentRecords.length === 0) {
        return <Text style={styles.noRecordsText}>暂无观修记录</Text>;
      }

      return recentRecords.map((record, index) => (
        <PracticeRecordCard
          key={record.id}
          record={record}
          practiceType="time"
          practiceUnit={project.practices.unit}
          isLast={index === recentRecords.length - 1}
          onPress={() =>
            router.push({
              pathname: "/meditation-detail/[recordId]",
              params: { recordId: record.id },
            })
          }
        />
      ));
    } else {
      // Show recent count-based records
      if (practiceRecords.length === 0) {
        return <Text style={styles.noRecordsText}>暂无修行记录</Text>;
      }

      return practiceRecords
        .slice(0, 5)
        .map((record, index) => (
          <PracticeRecordCard
            key={record.id}
            record={record}
            practiceType="count"
            practiceUnit={project.practices.unit}
            isLast={index === practiceRecords.length - 1}
          />
        ));
    }
  };

  const renderProgressDetails = () => {
    if (!project) return null;

    const progress = calculateProgress();
    const isTimeBasedWeekly =
      project.practices.type === "time" && project.target_period === "weekly";

    if (project.practices.type === "count") {
      return (
        <View style={styles.progressDetails}>
          <Text style={styles.progressText}>
            {progress.current.toLocaleString()}/
            {progress.target.toLocaleString()} {project.practices.unit}
          </Text>
          <Text style={styles.dailyTargetText}>
            每日目标：{project.daily_target.toLocaleString()}{" "}
            {project.practices.unit}
          </Text>
        </View>
      );
    } else {
      const todayCount = todayRecords.length;
      const target = project.daily_target;

      // Format session details for today
      const todayDetails = todayRecords
        .map(
          (record, index) => `第${index + 1}座${record.duration_minutes}分钟`,
        )
        .join("；");

      if (isTimeBasedWeekly) {
        const weeklyCount = weeklyRecords.length;
        const weeklyTarget = project.daily_target;

        return (
          <View style={styles.progressDetails}>
            <Text style={styles.progressText}>
              本周进度：{weeklyCount}/{weeklyTarget}座
              {weeklyCount >= weeklyTarget ? " ✅" : ""}
            </Text>
            {todayCount > 0 && todayDetails && (
              <Text style={styles.sessionDetails}>今日：{todayDetails}</Text>
            )}
          </View>
        );
      } else {
        return (
          <View style={styles.progressDetails}>
            <Text style={styles.progressText}>
              今日进度：{todayCount}/{target}座
              {todayCount >= target ? " ✅" : ""}
            </Text>
            {todayCount > 0 && todayDetails && (
              <Text style={styles.sessionDetails}>{todayDetails}</Text>
            )}
          </View>
        );
      }
    }
  };

  if (loading) {
    return (
      <PageTemplate
        title="修行详情"
        showBackButton={true}
        onBackPress={() => router.back()}
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

  if (!project) {
    return (
      <PageTemplate
        title="修行详情"
        showBackButton={true}
        onBackPress={() => router.back()}
        scrollable={false}
        backgroundColor={DesignSystem.colors.background}
      >
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>未找到修行项目</Text>
        </View>
      </PageTemplate>
    );
  }

  const progress = calculateProgress();
  const practiceDisplayType = project.target_end_date ? "固定时长" : "持续进行";
  const totalWeeks = project.target_end_date
    ? Math.ceil(
        (new Date(project.target_end_date).getTime() -
          new Date(project.start_date).getTime()) /
          (7 * 24 * 60 * 60 * 1000),
      )
    : null;

  return (
    <PageTemplate
      title={project.practices.name}
      showBackButton={true}
      onBackPress={() => router.back()}
      backgroundColor={DesignSystem.colors.background}
      padding={0}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Main Practice Info Card */}
        <View style={styles.mainCard}>
          {/* Section 1: Practice & Timeline */}
          <View style={styles.section1}>
            {/* Program name and completion badge row */}
            <View style={styles.programRow}>
              {/* Program Name on the left */}
              {(project.project_name || project.preset_project_id) && (
                <Text style={styles.programName}>
                  {getDisplayProjectName()}
                </Text>
              )}

              {/* Completion badge on the right (24px) */}
              {progress.isCompleted && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={DesignSystem.colors.practiceComplete}
                />
              )}
            </View>

            {/* Practice name */}
            <Text style={styles.practiceTitle}>{project.practices.name}</Text>
            {/* Timeline */}
            <Text style={styles.timelineText}>
              发愿：{project.start_date} • 圆满：
              {project.target_end_date || "持续进行"}
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Section 2: Progress Info */}
          <View style={styles.section2}>
            {project.practices.type === "count" ? (
              <>
                {/* Current vs Total Count */}
                <View style={styles.countRow}>
                  <Text style={styles.currentCount}>
                    {progress.current.toLocaleString()}
                  </Text>
                  <Text style={styles.totalCountAndDays}>
                    {progress.target.toLocaleString()} {project.practices.unit}{" "}
                    •{" "}
                    {totalWeeks
                      ? `${Math.ceil((new Date(project.target_end_date).getTime() - new Date(project.start_date).getTime()) / (24 * 60 * 60 * 1000))}天`
                      : "持续进行"}
                  </Text>
                </View>

                {/* Daily Target */}
                <Text style={styles.dailyTargetText}>
                  每日目标：{project.daily_target.toLocaleString()}{" "}
                  {project.practices.unit}
                </Text>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <ProgressBar
                    progress={progress.percentage}
                    size="thick"
                    containerStyle={{ flex: 1 }}
                  />
                  <Text style={styles.progressPercentage}>
                    {Math.round(progress.percentage)}%
                  </Text>
                </View>
              </>
            ) : (
              renderProgressDetails()
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Section 3: Action Buttons */}
          <View style={styles.section3}>
            <TouchableOpacity
              style={styles.secondaryButtonNew}
              onPress={handleEditPractice}
            >
              <Text style={styles.secondaryButtonTextNew}>编辑</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButtonNew}
              onPress={handleRecord}
            >
              <Text style={styles.primaryButtonTextNew}>记录</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Records Card */}
        <View style={styles.recordsCard}>
          <View style={styles.recordsHeader}>
            <Text style={styles.recordsTitle}>最近记录</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={handleViewHistory}
            >
              <Text style={styles.viewAllText}>查看全部</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={DesignSystem.colors.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.recordsList}>{renderRecentRecords()}</View>
        </View>
      </ScrollView>
    </PageTemplate>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...ComponentTextStyles.body,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    marginTop: DesignSystem.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: DesignSystem.spacing["4xl"],
  },
  emptyText: {
    ...ComponentTextStyles.subheading,
    color: DesignSystem.colors.textSecondary,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: DesignSystem.spacing.xl,
  },
  mainCard: componentHelpers.getCardWithMargin("outlined", "comfortable", "0"),

  // Section 1: Practice & Timeline
  section1: {
    paddingBottom: DesignSystem.spacing.lg,
  },
  practiceHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: DesignSystem.spacing.sm,
  },
  practiceInfo: {
    flex: 1,
  },
  practiceTitle: {
    ...ComponentTextStyles.dharma,
    marginBottom: DesignSystem.spacing.xs,
  },
  programName: {
    ...ComponentTextStyles.label,
    color: DesignSystem.colors.textSecondary,
  },
  timelineText: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.textSecondary,
  },

  // Divider
  divider: componentHelpers.getDividerStyle(
    "horizontal",
    "thin",
    "default",
    "normal",
  ),

  // Section 2: Progress Info
  section2: {
    paddingBottom: DesignSystem.spacing.lg,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: DesignSystem.spacing.sm,
    marginBottom: DesignSystem.spacing.sm,
  },
  currentCount: {
    ...Typography.styles.heading("xl"),
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.textPrimary,
  },
  totalCountAndDays: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.textSecondary,
  },
  dailyTargetText: {
    ...ComponentTextStyles.label,
    color: DesignSystem.colors.textSecondary,
    marginBottom: DesignSystem.spacing.md,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: DesignSystem.spacing.md,
  },
  progressPercentage: {
    ...Typography.styles.body("base"),
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.primary,
    minWidth: 50,
    textAlign: "right",
  },
  progressDetails: {
    marginBottom: DesignSystem.spacing.md,
  },
  progressText: {
    ...ComponentTextStyles.subheading,
    marginBottom: DesignSystem.spacing.xs,
  },
  sessionDetails: {
    ...ComponentTextStyles.label,
    fontStyle: "italic",
    color: DesignSystem.colors.textSecondary,
    marginTop: DesignSystem.spacing.xs,
  },

  // Section 3: Action Buttons
  section3: {
    flexDirection: "row",
    gap: DesignSystem.spacing.md,
  },
  secondaryButtonNew: {
    ...componentHelpers.getButtonStyle("secondary", "medium"),
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonNew: {
    ...componentHelpers.getButtonStyle("primary", "medium"),
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonTextNew: {
    ...componentHelpers.getButtonTextStyle("secondary", "medium"),
  },
  primaryButtonTextNew: {
    ...componentHelpers.getButtonTextStyle("primary", "medium"),
  },
  recordsCard: componentHelpers.getCardWithMargin(
    "outlined",
    "comfortable",
    "0",
  ),
  recordsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: DesignSystem.spacing.md,
  },
  recordsTitle: {
    ...ComponentTextStyles.subheading,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: DesignSystem.spacing.xs,
  },
  viewAllText: {
    ...ComponentTextStyles.link,
    fontSize: DesignSystem.typography.fontSize.sm,
  },
  recordsList: {
    gap: DesignSystem.spacing.sm,
  },
  noRecordsText: {
    ...ComponentTextStyles.body,
    textAlign: "center",
    paddingVertical: DesignSystem.spacing["2xl"],
    fontStyle: "italic",
    color: DesignSystem.colors.textSecondary,
  },
  programRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: DesignSystem.spacing.sm,
  },
});
