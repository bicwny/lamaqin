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
import ConfirmationDialog from "@/components/ConfirmationDialog";

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
  project_name: string;
  preset_project_id: string;
  source_type: 'class_required' | 'user_created';
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
  const [hasMeditationTopics, setHasMeditationTopics] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
      // Check if practice has meditation topics
      const { data: topicsData, error: topicsError } = await supabase
        .from("meditation_topics")
        .select("id")
        .eq("practice_id", projectData.practice_id)
        .limit(1);
      
      setHasMeditationTopics((topicsData && topicsData.length > 0) || false);

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

      // Recalculate and sync current_count from actual daily records
      await syncCurrentCountFromRecords(projectId);
    } catch (error) {
      console.error("Error loading practice records:", error);
    }
  };

  const syncCurrentCountFromRecords = async (projectId: string) => {
    if (!user?.id) return;

    try {
      // Get all daily records for this practice project
      const { data: allRecords, error: recordsError } = await supabase
        .from("daily_records")
        .select("count")
        .eq("user_id", user.id)
        .eq("practice_project_id", projectId);

      if (recordsError) throw recordsError;

      // Calculate total from all records
      const totalFromRecords = (allRecords || []).reduce((sum, r) => sum + (r.count || 0), 0);

      // Get current stored count
      const { data: projectData, error: projectError } = await supabase
        .from("user_practice_projects")
        .select("current_count")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single();

      if (projectError) throw projectError;

      // If there's a mismatch, update the database
      if (projectData.current_count !== totalFromRecords) {
        console.log(`Syncing current_count: stored=${projectData.current_count}, calculated=${totalFromRecords}`);
        
        const { error: updateError } = await supabase
          .from("user_practice_projects")
          .update({ 
            current_count: totalFromRecords,
            updated_at: new Date().toISOString()
          })
          .eq("id", projectId)
          .eq("user_id", user.id);

        if (updateError) throw updateError;

        // Update local state to reflect the corrected count
        setProject(prev => prev ? { ...prev, current_count: totalFromRecords } : null);
      }
    } catch (error) {
      console.error("Error syncing current count:", error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPracticeData();
  };

  const calculateProgress = () => {
    if (!project)
      return { percentage: 0, current: 0, target: null, isCompleted: false };

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
        currentTotalTarget: project.total_target?.toString() || "",
        currentDailyTarget: project.daily_target?.toString() || "",
        currentWeeklyTarget: project.weekly_target?.toString() || "",
        currentStartDate: project.start_date,
        currentEndDate: project.target_end_date || "",
        currentTargetPeriod: project.target_period,
        currentGoalType: project.goal_type || "total",
        currentProjectName: project.project_name || "",
        currentPresetId: project.preset_project_id || "",
      },
    });
  };

  const handleDeletePractice = () => {
    if (!project || !user) return;
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!project || !user) return;

    setShowDeleteDialog(false);
    setIsDeleting(true);
    
    try {
      const { classCurriculumService } = await import("@/lib/database");
      const result = await classCurriculumService.deletePracticeProject(user.id, project.id);

      if (result.success) {
        toastService.success({
          title: "删除成功",
          message: `${project.practices.name} 已删除`,
        });
        router.back();
      } else {
        toastService.error({
          title: "删除失败",
          message: result.error || "请稍后重试",
        });
      }
    } catch (error) {
      console.error("Error deleting practice:", error);
      toastService.error({
        title: "删除失败",
        message: "请稍后重试",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const getDisplayProjectName = () => {
    if (!project) return "";
    return project.project_name || presetProjectName || "预设项目";
  };

  const renderRecentRecords = () => {
    if (!project) return null;

    if (project.practices.type === "time") {
      // Show recent meditation records (deduplicate by ID since today's records appear in both arrays)
      // Only use weeklyRecords if this is actually a weekly practice
      const recordsToUse = project.target_period === "weekly" 
        ? [...todayRecords, ...weeklyRecords]
        : todayRecords;
      
      const uniqueRecordsMap = new Map();
      recordsToUse.forEach(record => {
        if (!uniqueRecordsMap.has(record.id)) {
          uniqueRecordsMap.set(record.id, record);
        }
      });
      const recentRecords = Array.from(uniqueRecordsMap.values())
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
          hasTopics={hasMeditationTopics}
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
            每日目标：{project.daily_target?.toLocaleString()} {project.practices.unit}
          </Text>
        </View>
      );
    } else {
      const todayCount = todayRecords.length;
      const target = project.daily_target || project.weekly_target;

      // Format session details for today
      const todayDetails = todayRecords
        .map(
          (record, index) => `第${index + 1}座${record.duration_minutes}分钟`,
        )
        .join("；");

      if (isTimeBasedWeekly) {
        const weeklyCount = weeklyRecords.length;
        // For weekly practices, the weekly goal is stored in weekly_target
        const weeklyTarget = project.weekly_target;
        const totalDone = project.current_count;
        const totalTarget = project.total_target;

        return (
          <View style={styles.progressDetails}>
            <Text style={styles.progressText}>
              {totalTarget 
                ? `${totalDone}/${totalTarget}座`
                : `已完成 ${totalDone}座`
              }
            </Text>
            <Text style={styles.dailyTargetText}>
              本周：{weeklyCount}{weeklyTarget ? `/${weeklyTarget}` : ''}座
              {weeklyTarget && weeklyCount >= weeklyTarget ? " ✅" : ""}
            </Text>
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
          <ActivityIndicator size="large" color={DesignSystem.colors.redTara} />
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
            {/* Timeline with total days */}
            <Text style={styles.timelineText}>
              发愿：{project.start_date} • 圆满：
              {project.target_end_date || "持续进行"}
              {project.target_end_date && ` • ${Math.ceil((new Date(project.target_end_date).getTime() - new Date(project.start_date).getTime()) / (24 * 60 * 60 * 1000))}天`}
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
                    {progress.target ? `${progress.target.toLocaleString()} ${project.practices.unit}` : `${project.practices.unit}`}
                  </Text>
                </View>

                {/* Daily Target */}
                {project.daily_target && (
                  <Text style={styles.dailyTargetText}>
                    每日目标：{project.daily_target.toLocaleString()}{" "}
                    {project.practices.unit}
                  </Text>
                )}

                {/* Progress Bar */}
                {progress.target && (
                  <View style={styles.progressBarContainer}>
                    <ProgressBar
                      progress={progress.percentage}
                      size="thick"
                      fillColor={DesignSystem.colors.redTara}
                      containerStyle={{ flex: 1 }}
                    />
                    <Text style={styles.progressPercentage}>
                      {Math.round(progress.percentage)}%
                    </Text>
                  </View>
                )}
              </>
            ) : (
              renderProgressDetails()
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Section 3: Action Buttons */}
          <View style={styles.section3}>
            {project.source_type === 'user_created' && (
              <TouchableOpacity
                style={[styles.deleteButtonNew, isDeleting && styles.buttonDisabled]}
                onPress={handleDeletePractice}
                disabled={isDeleting}
              >
                <Text style={styles.deleteButtonTextNew}>
                  {isDeleting ? '删除中...' : '删除'}
                </Text>
              </TouchableOpacity>
            )}
            
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
                color={DesignSystem.colors.redTara}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.recordsList}>{renderRecentRecords()}</View>
        </View>
      </ScrollView>

      <ConfirmationDialog
        visible={showDeleteDialog}
        title="确认删除"
        message={`确定要删除 ${project.practices.name} 吗？\n\n所有相关的修行记录也会被永久删除。`}
        confirmText="删除"
        cancelText="取消"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        destructive={true}
      />
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
    color: DesignSystem.colors.textPrimary,
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
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.xl,
  },
  mainCard: componentHelpers.getCardWithBottomMargin(
    "outlined",
    "md",
    "comfortable",
  ),

  // Section 1: Practice & Timeline
  section1: {
    // paddingBottom: DesignSystem.spacing.lg,
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
    color: DesignSystem.colors.redTara, // Buddhist semantic color for practice titles
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
  section2: {},
  countRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: DesignSystem.spacing.sm,
    marginBottom: DesignSystem.spacing.sm,
  },
  currentCount: {
    ...Typography.styles.heading("xl"),
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.redTara, // Buddhist semantic color for active practice counts
  },
  totalCountAndDays: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.textSecondary,
  },
  dailyTargetText: {
    ...ComponentTextStyles.label,
    color: DesignSystem.colors.textSecondary,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: DesignSystem.spacing.md,
  },
  progressPercentage: {
    ...Typography.styles.body("base"),
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.redTara, // Buddhist semantic color for progress indicators
    minWidth: 50,
    textAlign: "right",
  },
  progressDetails: {
    marginBottom: DesignSystem.spacing.md,
  },
  progressText: {
    ...ComponentTextStyles.subheading,
    marginBottom: DesignSystem.spacing.xs,
    color: DesignSystem.colors.textPrimary,
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
    ...componentHelpers.getButtonStyle("secondary", "small"),
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonNew: {
    ...componentHelpers.getButtonStyle("primary", "small"),
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DesignSystem.colors.redTara, // Red Tara for practice energy and action
  },
  secondaryButtonTextNew: {
    ...componentHelpers.getButtonTextStyle("secondary", "small"),
  },
  primaryButtonTextNew: {
    ...componentHelpers.getButtonTextStyle("primary", "small"),
    color: DesignSystem.colors.whiteTara, // White Tara for purity and clarity on Red Tara background
  },
  recordsCard: componentHelpers.getCardWithBottomMargin(
    "outlined",
    "md",
    "comfortable",
  ),
  recordsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: DesignSystem.spacing.md,
  },
  recordsTitle: {
    ...ComponentTextStyles.subheading,
    color: DesignSystem.colors.textPrimary,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: DesignSystem.spacing.xs,
  },
  viewAllText: {
    ...ComponentTextStyles.link,
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.redTara, // Red Tara for practice navigation links
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
  deleteButtonNew: {
    ...componentHelpers.getButtonStyle("secondary", "small"),
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderColor: DesignSystem.colors.error,
  },
  deleteButtonTextNew: {
    ...componentHelpers.getButtonTextStyle("secondary", "small"),
    color: DesignSystem.colors.error,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
