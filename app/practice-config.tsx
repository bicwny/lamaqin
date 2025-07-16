import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { DesignSystem } from "@/constants/DesignSystem";
import { ComponentTokens, ComponentTextStyles } from '@/utils/componentTokens';
import PageTemplate from "@/components/PageTemplate";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getCurrentWeekStart } from "@/lib/topic-progress";
import { practiceService, presetProjectNameService } from "@/lib/database";
import ModalDatetimePicker from "react-native-modal-datetime-picker";

interface Practice {
  id: string;
  name: string;
  type: string;
  unit: string;
  description?: string;
}

export default function PracticeConfigScreen() {
  const { user } = useAuth();
  const {
    practiceId,
    practiceName,
    practiceType,
    practiceUnit,
    practiceDescription,
    editMode,
    projectId,
    currentTargetCount,
    currentDailyTarget,
    currentStartDate,
    currentEndDate,
    currentTargetPeriod,
    currentGoalType,
    currentProjectName,
    currentPresetId,
  } = useLocalSearchParams<{
    practiceId: string;
    practiceName: string;
    practiceType: string;
    practiceUnit: string;
    practiceDescription: string;
    editMode?: string;
    projectId?: string;
    currentTargetCount?: string;
    currentDailyTarget?: string;
    currentStartDate?: string;
    currentEndDate?: string;
    currentTargetPeriod?: string;
    currentGoalType?: string;
    currentProjectName?: string;
    currentPresetId?: string;
  }>();

  const isEditMode = editMode === 'true';
  const [startDate, setStartDate] = useState(
    isEditMode && currentStartDate ? new Date(currentStartDate) : new Date()
  );
  const [duration, setDuration] = useState(
    isEditMode && currentEndDate ? 
      Math.ceil((new Date(currentEndDate).getTime() - new Date(currentStartDate || '').getTime()) / (1000 * 60 * 60 * 24)).toString() : 
      "30"
  );
  const [totalTarget, setTotalTarget] = useState(
    isEditMode && currentTargetCount ? currentTargetCount : ""
  );
  const [dailyTarget, setDailyTarget] = useState(
    isEditMode && currentDailyTarget ? currentDailyTarget : ""
  );
  const [sessionsTarget, setSessionsTarget] = useState(
    isEditMode && currentDailyTarget ? currentDailyTarget : "1"
  );
  const [loading, setLoading] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    isEditMode && currentPresetId ? currentPresetId : ""
  );
  const [projectName, setProjectName] = useState(
    isEditMode && currentProjectName ? currentProjectName : ""
  );
  const [durationMode, setDurationMode] = useState<"固定时长">(
    isEditMode && !currentEndDate ? "固定时长" : "固定时长"
  );
  const [configMode, setConfigMode] = useState<"total" | "daily">(
    isEditMode && currentGoalType ? currentGoalType as "total" | "daily" : "total"
  );
  const [presetProjectNames, setPresetProjectNames] = useState<
    Array<{
      id: string;
      name: string;
      category?: string;
      display_order: number;
    }>
  >([]);
  const [loadingPresets, setLoadingPresets] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Time-based configuration
  const [frequencyMode, setFrequencyMode] = useState<"weekly" | "daily">(
    "weekly",
  );
  const [weeklyGoal, setWeeklyGoal] = useState("");

  // Time planning
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [customEndDate, setCustomEndDate] = useState(
    new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000),
  ); // Default to 60 days from now
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customDays, setCustomDays] = useState("60"); // Default to 60 days

  // Calculated values
  const [suggestedDaily, setSuggestedDaily] = useState(0);
  const [projectedTotal, setProjectedTotal] = useState(0);
  const [calculatedDays, setCalculatedDays] = useState(0);

  const [targetPeriod, setTargetPeriod] = useState<"daily" | "weekly">(
    "weekly",
  );
  const [goalType, setGoalType] = useState<"fixed_duration" | "topic_progress">(
    "fixed_duration",
  );
  const [weeklyTopicTarget, setWeeklyTopicTarget] = useState(2);
  const [isStartDatePickerVisible, setStartDatePickerVisibility] =
    useState(false);
  const [isCustomDatePickerVisible, setCustomDatePickerVisibility] =
    useState(false);

  useEffect(() => {
    calculateSuggestions();
  }, [
    totalTarget,
    dailyTarget,
    startDate,
    durationMode,
    customEndDate,
    configMode,
  ]);

  // Handle days input change - auto update end date
  const handleDaysInputChange = (text: string) => {
    setCustomDays(text);
    const days = parseInt(text);
    if (!isNaN(days) && days > 0) {
      const newEndDate = new Date(
        startDate.getTime() + days * 24 * 60 * 60 * 1000,
      );
      setCustomEndDate(newEndDate);
      setDurationMode("自定义");
    } else if (!isNaN(days) && days <= 0) {
      Alert.alert("输入错误", "天数必须大于0");
    }
  };

  // Handle end date change - auto update days
  const handleEndDateChange = (selectedDate: Date) => {
    setCustomEndDate(selectedDate);
    const daysDiff = Math.ceil(
      (selectedDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000),
    );
    setCustomDays(daysDiff.toString());
    setDurationMode("自定义");
  };

  useEffect(() => {
    const fetchPresets = async () => {
      setLoadingPresets(true);
      try {
        const presets = await presetProjectNameService.getPresetProjectNames();
        setPresetProjectNames(presets);
      } catch (error) {
        console.error("Failed to fetch preset project names:", error);
        Alert.alert("错误", "Failed to load preset project names.");
      } finally {
        setLoadingPresets(false);
      }
    };

    fetchPresets();
  }, []);

  const openProjectModal = () => {
    setSearchText("");
    setShowProjectModal(true);
  };

  const selectPreset = (preset: {
    id: string;
    name: string;
    category?: string;
    display_order: number;
  }) => {
    setProjectName(preset.name);
    setSelectedPresetId(preset.id);
    setShowProjectModal(false);
  };

  const selectCustomName = () => {
    if (searchText.trim()) {
      setProjectName(searchText.trim());
      setSelectedPresetId("");
      setShowProjectModal(false);
    }
  };

  const getFilteredPresets = () => {
    if (!searchText.trim()) return presetProjectNames;
    return presetProjectNames.filter((preset) =>
      preset.name.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const getDurationInDays = () => {
    const start = startDate;
    let end: Date;

    switch (durationMode) {
      case "30天":
        end = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      case "60天":
        end = new Date(start.getTime() + 60 * 24 * 60 * 60 * 1000);
        break;
      case "100天":
        end = new Date(start.getTime() + 100 * 24 * 60 * 60 * 1000);
        break;
      case "1年":
        end = new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000);
        break;
      case "自定义":
        end = customEndDate;
        break;
      default:
        end = new Date(start.getTime() + 60 * 24 * 60 * 60 * 1000);
    }

    return Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  };

  const calculateSuggestions = () => {
    const days = getDurationInDays();
    setCalculatedDays(days);

    if (practiceType === "count") {
      if (configMode === "total" && totalTarget) {
        const total = parseInt(totalTarget);
        const suggested = Math.ceil(total / days);
        setSuggestedDaily(suggested);
      } else if (configMode === "daily" && dailyTarget) {
        const daily = parseInt(dailyTarget);
        const projected = daily * days;
        setProjectedTotal(projected);
      }
    }
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert("错误", "用户未登录");
      return;
    }

    // Validation
    if (practiceType === "count") {
      if (configMode === "total" && !totalTarget) {
        Alert.alert("错误", "请输入总目标数量");
        return;
      }
      if (configMode === "daily" && !dailyTarget) {
        Alert.alert("错误", "请输入每日目标数量");
        return;
      }
    } else {
      if (!sessionsTarget) {
        Alert.alert("错误", "请输入每周目标座数");
        return;
      }
    }

    setLoading(true);

    try {
      let finalTotalTarget: number;
      let finalDailyTarget: number;
      let endDate: Date | null = null;
      let targetPeriod: string;

      if (practiceType === "count") {
        const days = getDurationInDays();
        endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
        targetPeriod = "daily";

        if (configMode === "total") {
          finalTotalTarget = parseInt(totalTarget);
          finalDailyTarget = Math.ceil(finalTotalTarget / days);
        } else {
          finalDailyTarget = parseInt(dailyTarget);
          finalTotalTarget = finalDailyTarget * days;
        }
      } else {
        // Time-based practices - unified approach
        finalDailyTarget = parseInt(sessionsTarget); // User's weekly goal
        targetPeriod = "weekly";

        // Fixed duration practice
        const days = getDurationInDays();
        endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
        finalTotalTarget = finalDailyTarget * Math.ceil(days / 7);
      }

      const projectData = {
        user_id: user.id,
        practice_id: practiceId,
        target_count: finalTotalTarget,
        daily_target: finalDailyTarget,
        target_period: targetPeriod,
        start_date: startDate.toISOString().split("T")[0],
        target_end_date: endDate ? endDate.toISOString().split("T")[0] : null,
        status: "active",
        current_count: 0,
        preset_project_id: selectedPresetId || null,
        project_name: selectedPresetId ? null : projectName || null,
      };

      // Try to include goal_type, but handle cases where column doesn't exist yet
      try {
        const { error } = await supabase
          .from("user_practice_projects")
          .insert({ ...projectData, goal_type: configMode });

        if (error) throw error;
      } catch (error: any) {
        // If goal_type column doesn't exist, try without it
        if (error?.message?.includes("goal_type")) {
          const { error: fallbackError } = await supabase
            .from("user_practice_projects")
            .insert(projectData);

          if (fallbackError) throw fallbackError;
        } else {
          throw error;
        }
      }

      Alert.alert("成功", "修行项目已添加", [
        {
          text: "确定",
          onPress: () => router.replace("/(tabs)/practice"),
        },
      ]);
    } catch (error) {
      console.error("Error saving practice project:", error);
      Alert.alert("错误", "保存失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    handleSave();
  };

  const renderCountBasedConfig = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>目标设置</Text>

        <View style={styles.goalTypeContainer}>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                configMode === "total" && styles.segmentButtonActive,
              ]}
              onPress={() => setConfigMode("total")}
            >
              <Text style={[
                styles.segmentButtonText,
                configMode === "total" && styles.segmentButtonTextActive,
              ]}>
                总目标
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                configMode === "daily" && styles.segmentButtonActive,
              ]}
              onPress={() => setConfigMode("daily")}
            >
              <Text style={[
                styles.segmentButtonText,
                configMode === "daily" && styles.segmentButtonTextActive,
              ]}>
                每日目标
              </Text>
            </TouchableOpacity>
          </View>

          {configMode === "total" ? (
            <View style={styles.goalInputContainer}>
              <Text style={styles.goalInputLabel}>
                整个项目的总目标数量
              </Text>
              <View style={styles.goalInputRow}>
                <TextInput
                  style={styles.goalTextInput}
                  value={totalTarget}
                  onChangeText={setTotalTarget}
                  placeholder="输入总目标数量"
                  keyboardType="numeric"
                />
                <Text style={styles.goalInputUnit}>{practiceUnit}</Text>
              </View>
              {suggestedDaily > 0 && (
                <Text style={styles.helpText}>
                  建议每日：{suggestedDaily} {practiceUnit}
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.goalInputContainer}>
              <Text style={styles.goalInputLabel}>
                每日目标数量
              </Text>
              <View style={styles.goalInputRow}>
                <TextInput
                  style={styles.goalTextInput}
                  value={dailyTarget}
                  onChangeText={setDailyTarget}
                  placeholder="输入每日目标"
                  keyboardType="numeric"
                />
                <Text style={styles.goalInputUnit}>{practiceUnit}</Text>
              </View>
              {projectedTotal > 0 && (
                <Text style={styles.helpText}>
                  预计总量：{projectedTotal.toLocaleString()} {practiceUnit}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderTimeBasedConfig = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>目标设置</Text>

        <View style={styles.timeInputContainer}>
          <Text style={styles.timeInputLabel}>每周目标座数</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputPrefix}>每周</Text>
            <TextInput
              style={styles.textInput}
              value={sessionsTarget}
              onChangeText={setSessionsTarget}
              placeholder="1"
              keyboardType="numeric"
            />
            <Text style={styles.inputUnit}>座</Text>
          </View>
          <Text style={styles.helpText}>
            设置您希望每周完成的修行座数
          </Text>
        </View>
      </View>
    );
  };

  const renderTimePlanning = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>时间规划</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>开始日期</Text>
          <TouchableOpacity
            style={styles.simpleDateButton}
            onPress={() => setStartDatePickerVisibility(true)}
          >
            <Text style={styles.simpleDateButtonText}>
              {startDate.toLocaleDateString('zh-CN')}
            </Text>
            <Text style={styles.dateButtonIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>项目时长</Text>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                durationMode === "固定时长" && styles.segmentButtonActive,
              ]}
              onPress={() => setDurationMode("固定时长")}
            >
              <Text style={[
                styles.segmentButtonText,
                durationMode === "固定时长" && styles.segmentButtonTextActive,
              ]}>
                固定时长
              </Text>
            </TouchableOpacity>
          </View>

          {durationMode === "固定时长" && (
            <View style={styles.smartDurationContainer}>
              <View style={styles.daysInputContainer}>
                <TextInput
                  style={styles.daysInput}
                  value={customDays}
                  onChangeText={handleDaysInputChange}
                  keyboardType="numeric"
                  placeholder="60"
                />
                <Text style={styles.daysInputLabel}>天</Text>
              </View>
              <Text style={styles.durationSeparator}>至</Text>
              <TouchableOpacity
                style={styles.endDatePickerButton}
                onPress={() => setCustomDatePickerVisibility(true)}
              >
                <Text style={styles.endDatePickerButtonText}>
                  {customEndDate.toLocaleDateString('zh-CN')}
                </Text>
                <Text style={styles.dateButtonIcon}>📅</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.durationDisplay}>
            <Text style={styles.durationDisplayText}>
              {durationMode === "固定时长" 
                ? `项目时长：${calculatedDays} 天`
                : ``
              }
            </Text>
          </View>
        </View>

        {/* Date Pickers */}
        <ModalDatetimePicker
          isVisible={isStartDatePickerVisible}
          mode="date"
          onConfirm={(date) => {
            setStartDate(date);
            setStartDatePickerVisibility(false);
          }}
          onCancel={() => setStartDatePickerVisibility(false)}
          date={startDate}
        />

        <ModalDatetimePicker
          isVisible={isCustomDatePickerVisible}
          mode="date"
          onConfirm={(date) => {
            handleEndDateChange(date);
            setCustomDatePickerVisibility(false);
          }}
          onCancel={() => setCustomDatePickerVisibility(false)}
          date={customEndDate}
          minimumDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)}
        />
      </View>
    );
  };

  const renderSmartSummary = () => {
    const days = getDurationInDays();
    const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>项目预览</Text>

        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewPracticeName}>{practiceName}</Text>
            {projectName && (
              <View style={styles.previewProjectPill}>
                <Text style={styles.previewProjectPillText}>{projectName}</Text>
              </View>
            )}
          </View>

          <View style={styles.previewDetails}>
            <Text style={styles.previewDetailItem}>
              📅 开始日期：{startDate.toLocaleDateString('zh-CN')}
            </Text>

            {durationMode === "固定时长" ? (
              <>
                <Text style={styles.previewDetailItem}>
                  ⏳ 项目时长：{days} 天
                </Text>
                <Text style={styles.previewDetailItem}>
                  🏁 结束日期：{endDate.toLocaleDateString('zh-CN')}
                </Text>
              </>
            ) : (
              <Text style={styles.previewDetailItem}>
                ⏳ 项目时长：持续进行
              </Text>
            )}

            {practiceType === "count" ? (
              <>
                {configMode === "total" && totalTarget && (
                  <Text style={styles.previewDetailItem}>
                    🎯 总目标：{parseInt(totalTarget).toLocaleString()} {practiceUnit}
                  </Text>
                )}
                {(configMode === "daily" || suggestedDaily > 0) && (
                  <Text style={styles.previewDetailItem}>
                    📊 每日目标：{configMode === "daily" ? dailyTarget : suggestedDaily} {practiceUnit}
                  </Text>
                )}
                {projectedTotal > 0 && configMode === "daily" && (
                  <Text style={styles.previewDetailItem}>
                    📈 预计总量：{projectedTotal.toLocaleString()} {practiceUnit}
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.previewDetailItem}>
                🧘 每周目标：{sessionsTarget} 座
              </Text>
            )}
          </View>

          {(!totalTarget && !dailyTarget && !sessionsTarget) && (
            <Text style={styles.previewPlaceholder}>
              请设置目标后查看项目预览
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <PageTemplate
      title={isEditMode ? `编辑"${practiceName}"` : `配置"${practiceName}"`}
      showBackButton={true}
      onBackPress={() => router.back()}
      scrollable={true}
      backgroundColor={DesignSystem.colors.background}
      padding={0}
    >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>项目名称 (可选)</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>为这个修行项目起个名字</Text>

            {/* Project Name Display and Selection Button */}
            <View style={styles.projectNameContainer}>
              <TouchableOpacity
                style={styles.projectNameButton}
                onPress={openProjectModal}
              >
                <Text style={[
                  styles.projectNameButtonText,
                  !projectName && styles.projectNamePlaceholder
                ]}>
                  {projectName || "点击选择或输入项目名称..."}
                </Text>
                <Text style={styles.projectNameButtonIcon}>▼</Text>
              </TouchableOpacity>

              {projectName && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    setProjectName("");
                    setSelectedPresetId("");
                  }}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.helpText}>
              项目名称可以帮助您区分同一种修行的不同发愿或阶段
            </Text>
          </View>
        </View>

        {practiceType === "count"
          ? renderCountBasedConfig()
          : renderTimeBasedConfig()}
        {renderTimePlanning()}
        {renderSmartSummary()}

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={DesignSystem.colors.textInverse} />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditMode ? "更新项目" : "确认添加项目"}
            </Text>
          )}
        </TouchableOpacity>

      {/* Project Selection Modal */}
      <Modal
        visible={showProjectModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProjectModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowProjectModal(false)}>
              <Text style={styles.modalCancelButton}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>选择项目名称</Text>
            <TouchableOpacity
              onPress={selectCustomName}
              disabled={!searchText.trim()}
            >
              <Text style={[
                styles.modalConfirmButton,
                !searchText.trim() && styles.modalConfirmButtonDisabled
              ]}>
                使用
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalSearchContainer}>
            <TextInput
              style={styles.modalSearchInput}
              placeholder="搜索预设名称或输入自定义名称..."
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
          </View>

          <FlatList
            data={getFilteredPresets()}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalPresetItem}
                onPress={() => selectPreset(item)}
              >
                <View style={styles.modalPresetContent}>
                  <Text style={styles.modalPresetName}>{item.name}</Text>
                  {item.category && (
                    <Text style={styles.modalPresetCategory}>{item.category}</Text>
                  )}
                </View>
                <Text style={styles.modalPresetArrow}>→</Text>
              </TouchableOpacity>
            )}
            style={styles.modalPresetList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.modalEmptyState}>
                <Text style={styles.modalEmptyText}>
                  {searchText.trim()
                    ? `没有找到匹配的预设\n输入"${searchText}"作为自定义名称`
                    : "加载预设名称中..."
                  }
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
    </PageTemplate>
  );
}

const styles = StyleSheet.create({
  section: {
    ...ComponentTokens.card.variants.outlined,
    margin: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.lg,
    padding: ComponentTokens.card.padding.spacious,
  },
  sectionTitle: {
    ...ComponentTextStyles.subheading,
    marginBottom: DesignSystem.spacing.lg,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderRadius: DesignSystem.borderRadius.md,
    padding: DesignSystem.spacing.xs,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.sm,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    ...ComponentTokens.card.variants.outlined,
  },
  segmentButtonText: {
    ...ComponentTextStyles.label,
    color: DesignSystem.colors.textSecondary,
  },
  segmentButtonTextActive: {
    ...ComponentTextStyles.label,
    color: DesignSystem.colors.textPrimary,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  inputContainer: {
    marginTop: DesignSystem.spacing.lg,
  },
  inputLabel: {
    ...ComponentTextStyles.label,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    marginBottom: DesignSystem.spacing.xs,
  },
  inputRow: {
    ...ComponentTokens.input.standard,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputPrefix: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.textSecondary,
    marginRight: DesignSystem.spacing.sm,
  },
  textInput: {
    ...ComponentTokens.input.standard,
    flex: 1,
    marginHorizontal: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  inputUnit: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.textSecondary,
    marginLeft: DesignSystem.spacing.sm,
  },
  helpText: {
    ...ComponentTextStyles.caption,
    color: DesignSystem.colors.textSecondary,
    marginTop: DesignSystem.spacing.xs,
  },
  goalTypeContainer: {
    marginBottom: DesignSystem.spacing.xl,
  },
  goalInputContainer: {
    marginTop: DesignSystem.spacing.sm,
  },
  goalInputLabel: {
    ...ComponentTextStyles.label,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    marginBottom: DesignSystem.spacing.sm,
  },
  goalInputRow: {
    ...ComponentTokens.input.standard,
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalTextInput: {
    ...ComponentTokens.input.standard,
    flex: 1,
    marginHorizontal: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  goalInputUnit: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.textSecondary,
    marginLeft: DesignSystem.spacing.sm,
  },
  timeInputContainer: {
    marginBottom: DesignSystem.spacing.lg,
  },
  timeInputLabel: {
    ...ComponentTextStyles.label,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    marginBottom: DesignSystem.spacing.sm,
  },
  simpleDateButton: {
    ...ComponentTokens.button.variants.secondary,
    ...ComponentTokens.button.sizes.medium,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  simpleDateButtonText: {
    ...ComponentTextStyles.button.secondary,
  },
  dateButtonIcon: {
    ...ComponentTextStyles.body,
  },
  smartDurationContainer: {
    marginTop: DesignSystem.spacing.sm,
  },
  daysInputContainer: {
    ...ComponentTokens.input.standard,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  daysInput: {
    ...ComponentTokens.input.standard,
    flex: 1,
    marginHorizontal: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    textAlign: 'center',
  },
  daysInputLabel: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.textSecondary,
    marginLeft: DesignSystem.spacing.xs,
  },
  durationSeparator: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.textSecondary,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  endDatePickerButton: {
    ...ComponentTokens.button.variants.secondary,
    ...ComponentTokens.button.sizes.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 2,
  },
  endDatePickerButtonText: {
    ...ComponentTextStyles.button.secondary,
  },
  durationDisplay: {
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderRadius: DesignSystem.borderRadius.sm,
    padding: DesignSystem.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: DesignSystem.colors.primary,
  },
  durationDisplayText: {
    ...ComponentTextStyles.caption,
    color: DesignSystem.colors.textSecondary,
    textAlign: 'center',
  },
  previewCard: {
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: DesignSystem.colors.primary,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.md,
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.sm,
  },
  previewPracticeName: {
    ...ComponentTextStyles.subheading,
  },
  previewProjectPill: {
    backgroundColor: DesignSystem.colors.primary,
    borderRadius: DesignSystem.borderRadius.lg,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
  },
  previewProjectPillText: {
    ...ComponentTextStyles.caption,
    color: DesignSystem.colors.textInverse,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  previewDetails: {
    gap: DesignSystem.spacing.xs,
  },
  previewDetailItem: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.textSecondary,
    lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.relaxed,
  },
  previewPlaceholder: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.textSecondary,
    fontStyle: 'italic',
  },
  saveButton: {
    ...ComponentTokens.button.variants.primary,
    ...ComponentTokens.button.sizes.large,
    margin: DesignSystem.spacing.lg,
    marginTop: DesignSystem.spacing.xl,
    marginBottom: DesignSystem.spacing['2xl'],
  },
  saveButtonDisabled: {
    backgroundColor: DesignSystem.colors.backgroundSecondary,
  },
  saveButtonText: {
    ...ComponentTextStyles.button.primary,
  },
  projectNameContainer: {
    position: 'relative',
  },
  projectNameButton: {
    ...ComponentTokens.button.variants.secondary,
    ...ComponentTokens.button.sizes.medium,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectNameButtonText: {
    ...ComponentTextStyles.button.secondary,
    flex: 1,
    textAlign: 'left',
  },
  projectNamePlaceholder: {
    color: DesignSystem.colors.textSecondary,
  },
  projectNameButtonIcon: {
    ...ComponentTextStyles.caption,
    color: DesignSystem.colors.textSecondary,
    marginLeft: DesignSystem.spacing.sm,
  },
  clearButton: {
    position: 'absolute',
    right: 32,
    top: 12,
    width: 24,
    height: 24,
    borderRadius: DesignSystem.borderRadius.round,
    backgroundColor: DesignSystem.colors.destructive,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    ...ComponentTextStyles.caption,
    color: DesignSystem.colors.textInverse,
    fontWeight: DesignSystem.typography.fontWeight.bold,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border,
  },
  modalCancelButton: {
    ...ComponentTextStyles.label,
    color: DesignSystem.colors.textSecondary,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  modalTitle: {
    ...ComponentTextStyles.subheading,
  },
  modalConfirmButton: {
    ...ComponentTextStyles.label,
    color: DesignSystem.colors.primary,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
  modalConfirmButtonDisabled: {
    color: DesignSystem.colors.textSecondary,
  },
  modalSearchContainer: {
    padding: DesignSystem.spacing.lg,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border,
  },
  modalSearchInput: {
    ...ComponentTokens.input.search,
  },
  modalPresetList: {
    flex: 1,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
  },
  modalPresetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.borderLight,
  },
  modalPresetContent: {
    flex: 1,
  },
  modalPresetName: {
    ...ComponentTextStyles.body,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  modalPresetCategory: {
    ...ComponentTextStyles.caption,
    color: DesignSystem.colors.textSecondary,
    marginTop: DesignSystem.spacing.xs,
  },
  modalPresetArrow: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.textSecondary,
  },
  modalEmptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing['4xl'],
    paddingHorizontal: DesignSystem.spacing['2xl'],
  },
  modalEmptyText: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.textSecondary,
    textAlign: 'center',
    lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.relaxed,
  },
  webDatePicker: {
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderRadius: DesignSystem.borderRadius.md,
    padding: DesignSystem.spacing.md,
    marginTop: DesignSystem.spacing.sm,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border,
  },
  webDateInput: {
    ...ComponentTokens.input.standard,
    backgroundColor: 'transparent',
    borderWidth: 0,
    outlineWidth: 0,
  },
});