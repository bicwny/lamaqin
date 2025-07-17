import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import ConsolidatedDesignSystem from "@/constants/DesignSystem";
import {
  ComponentTokens,
  ComponentTextStyles,
  componentHelpers,
} from '@/utils/componentTokens';
import PageTemplate from "@/components/PageTemplate";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getCurrentWeekStart } from "@/lib/topic-progress";
import { practiceService, presetProjectNameService } from "@/lib/database";
import ModalDatetimePicker from "react-native-modal-datetime-picker";
import { toastService } from "@/lib/toast";

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
  const [durationMode, setDurationMode] = useState<"持续进行" | "固定时长">(
    isEditMode && !currentEndDate ? "持续进行" : "固定时长"
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
      toastService.error("天数必须大于0");
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
        toastService.error("加载预设项目名称失败");
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
      toastService.error("用户未登录");
      return;
    }

    // Validation
    if (practiceType === "count") {
      if (configMode === "total" && !totalTarget) {
        toastService.error("请输入总目标数量");
        return;
      }
      if (configMode === "daily" && !dailyTarget) {
        toastService.error("请输入每日目标数量");
        return;
      }
    } else {
      if (!sessionsTarget) {
        toastService.error("请输入每周目标座数");
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

        if (durationMode === "持续进行") {
          // Ongoing practice - no end date
          endDate = null;
          finalTotalTarget = 0; // 0 indicates ongoing
        } else {
          // Fixed duration practice
          const days = getDurationInDays();
          endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
          finalTotalTarget = finalDailyTarget * Math.ceil(days / 7);
        }
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

      toastService.success({
        title: "修行项目已添加",
        message: "开始您的修行之路吧！",
        onPress: () => router.replace("/(tabs)/practice")
      });
      
      // Navigate after a short delay to allow user to see the toast
      setTimeout(() => {
        router.replace("/(tabs)/practice");
      }, 1500);
    } catch (error) {
      console.error("Error saving practice project:", error);
      toastService.error({
        title: "保存失败",
        message: "请检查网络连接后重试"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const renderCountBasedConfig = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>目标设置</Text>

      {/* Simple toggle for goal type */}
      <View style={styles.goalTypeContainer}>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              configMode === "total" && styles.segmentButtonActive,
            ]}
            onPress={() => setConfigMode("total")}
          >
            <Text
              style={[
                styles.segmentButtonText,
                configMode === "total" && styles.segmentButtonTextActive,
              ]}
            >
              总数目标
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              configMode === "daily" && styles.segmentButtonActive,
            ]}
            onPress={() => setConfigMode("daily")}
          >
            <Text
              style={[
                styles.segmentButtonText,
                configMode === "daily" && styles.segmentButtonTextActive,
              ]}
            >
              每日目标
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Single input field for goal */}
      <View style={styles.goalInputContainer}>
        {configMode === "total" ? (
          <View>
            <Text style={styles.goalInputLabel}>总目标数量</Text>
            <View style={styles.goalInputRow}>
              <TextInput
                style={styles.goalTextInput}
                value={totalTarget}
                onChangeText={setTotalTarget}
                placeholder="例如: 400000"
                keyboardType="numeric"
              />
              <Text style={styles.goalInputUnit}>{practiceUnit}</Text>
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.goalInputLabel}>每日目标</Text>
            <View style={styles.goalInputRow}>
              <TextInput
                style={styles.goalTextInput}
                value={dailyTarget}
                onChangeText={setDailyTarget}
                placeholder="例如: 1000"
                keyboardType="numeric"
              />
              <Text style={styles.goalInputUnit}>{practiceUnit}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderTimeBasedConfig = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. 设定您的每周目标</Text>
        <View style={styles.inputRow}>
          <Text style={styles.inputPrefix}>每周完成</Text>
          <TextInput
            style={styles.textInput}
            value={sessionsTarget}
            onChangeText={setSessionsTarget}
            placeholder="例如: 4"
            keyboardType="numeric"
          />
          <Text style={styles.inputUnit}>座</Text>
        </View>
      </View>
    </>
  );

  const showStartDatepicker = () => {
    if (Platform.OS === "web") {
      setShowStartDatePicker(true);
    } else {
      setStartDatePickerVisibility(true);
    }
  };

  const hideStartDatePicker = () => {
    setStartDatePickerVisibility(false);
    setShowStartDatePicker(false);
  };

  const showCustomDatepicker = () => {
    if (Platform.OS === "web") {
      setShowCustomDatePicker(true);
    } else {
      setCustomDatePickerVisibility(true);
    }
  };

  const hideCustomDatePicker = () => {
    setCustomDatePickerVisibility(false);
    setShowCustomDatePicker(false);
  };

  const handleStartDateConfirm = (date: Date) => {
    setStartDate(date);
    hideStartDatePicker();
  };

  const handleCustomDateConfirm = (date: Date) => {
    // Ensure end date is not before start date
    const minDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
    if (date < minDate) {
      toastService.error("结束日期不能早于开始日期");
      return;
    }
    setCustomEndDate(date);
    hideCustomDatePicker();
  };

  const renderTimePlanning = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>项目时长</Text>

      {/* Start date - always defaults to today, but editable */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>开始日期</Text>
        <TouchableOpacity
          style={styles.simpleDateButton}
          onPress={showStartDatepicker}
        >
          <Text style={styles.simpleDateButtonText}>
            {formatDate(startDate)}
          </Text>
          <Text style={styles.dateButtonIcon}>📅</Text>
        </TouchableOpacity>

        {/* DateTimePicker Modal */}
        {practiceType === "count" && (
          <ModalDatetimePicker
            isVisible={isStartDatePickerVisible}
            mode="date"
            onConfirm={handleStartDateConfirm}
            onCancel={hideStartDatePicker}
            value={startDate}
          />
        )}

        {showStartDatePicker && Platform.OS !== "web" && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(Platform.OS === "ios");
              if (selectedDate) {
                setStartDate(selectedDate);
              }
            }}
          />
        )}

        {showStartDatePicker && Platform.OS === "web" && (
          <View style={styles.webDatePicker}>
            <TextInput
              style={styles.webDateInput}
              type="date"
              value={startDate.toISOString().split("T")[0]}
              onChange={(event) => {
                const newDate = new Date(event.target.value);
                setStartDate(newDate);
                setShowStartDatePicker(false);
              }}
            />
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>项目时长</Text>

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

        

        {/* DateTimePicker Modal */}
        {practiceType === "count" && (
          <ModalDatetimePicker
            isVisible={isCustomDatePickerVisible}
            mode="date"
            onConfirm={handleCustomDateConfirm}
            onCancel={hideCustomDatePicker}
            value={customEndDate}
            minimumDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)}
          />
        )}

        {showCustomDatePicker && Platform.OS !== "web" && (
          <DateTimePicker
            value={customEndDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)}
            onChange={(event, selectedDate) => {
              setShowCustomDatePicker(Platform.OS === "ios");
              if (selectedDate) {
                handleEndDateChange(selectedDate);
              }
            }}
          />
        )}

        {showCustomDatePicker && Platform.OS === "web" && (
          <View style={styles.webDatePicker}>
            <TextInput
              style={styles.webDateInput}
              type="date"
              value={customEndDate.toISOString().split("T")[0]}
              min={
                new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0]
              }
              onChange={(event) => {
                const newDate = new Date(event.target.value);
                handleEndDateChange(newDate);
                setShowCustomDatePicker(false);
              }}
            />
          </View>
        )}
      </View>
    </View>
  );

  const calculateSummary = () => {
    if (practiceType === "time") {
      // Time-based practice summary
      const weeks = calculateWeeks();
      const totalSessions = parseInt(sessionsTarget) * weeks;
      return {
        duration: `约 ${weeks} 周`,
        weeklyTarget: `每周 ${sessionsTarget} 座`,
        totalSessions: `预计总计完成约 ${totalSessions} 座观修`,
      };
    } else {
      // Count-based practice summary
      if (configMode === "total") {
        const days = calculateDays();
        const dailyAmount = Math.ceil(parseInt(totalTarget) / days);
        return {
          duration: `约 ${days} 天`,
          target: `总计 ${parseInt(totalTarget).toLocaleString()} ${practiceUnit}`,
          daily: `建议每日持诵约 ${dailyAmount.toLocaleString()} ${practiceUnit}`,
        };
      } else {
        const days = calculateDays();
        const totalAmount = parseInt(dailyTarget) * days;
        return {
          duration: `约 ${days} 天`,
          target: `总计 ${totalAmount.toLocaleString()} ${practiceUnit}`,
          daily: `每日 ${parseInt(dailyTarget).toLocaleString()} ${practiceUnit}`,
        };
      }
    }
  };

  const renderSmartSummary = () => {
    const days = calculatedDays;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>项目预览</Text>
        {practiceType === "count" ? (
          <View>
            <View style={styles.previewHeader}>
              <Text style={styles.previewPracticeName}>{practiceName}</Text>
              {projectName && (
                <View style={styles.previewProjectPill}>
                  <Text style={styles.previewProjectPillText}>
                    {projectName}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.previewDetails}>
              <Text style={styles.previewDetailItem}>
                <Text>
                  📅 {formatDate(startDate)} →{" "}
                  {formatDate(
                    durationMode === "自定义"
                      ? customEndDate
                      : new Date(
                          startDate.getTime() +
                            (durationMode === "60天"
                              ? 60
                              : durationMode === "100天"
                                ? 100
                                : durationMode === "1年"
                                  ? 365
                                  : 60) *
                              24 *
                              60 *
                              60 *
                              1000,
                        ),
                  )}{" "}
                  ({days} 天)
                </Text>
              </Text>

              {configMode === "total" && totalTarget ? (
                <View>
                  <Text style={styles.previewDetailItem}>
                    <Text>
                      🎯 总目标: {parseInt(totalTarget).toLocaleString()}{" "}
                      {practiceUnit}
                    </Text>
                  </Text>
                  <Text style={styles.previewDetailItem}>
                    <Text>
                      📊 每日目标: {suggestedDaily.toLocaleString()}{" "}
                      {practiceUnit}
                    </Text>
                  </Text>
                </View>
              ) : configMode === "daily" && dailyTarget ? (
                <View>
                  <Text style={styles.previewDetailItem}>
                    <Text>
                      🎯 每日目标: {parseInt(dailyTarget).toLocaleString()}{" "}
                      {practiceUnit}
                    </Text>
                  </Text>
                  <Text style={styles.previewDetailItem}>
                    <Text>
                      📊 预计总数: {projectedTotal.toLocaleString()}{" "}
                      {practiceUnit}
                    </Text>
                  </Text>
                </View>
              ) : (
                <Text style={styles.previewPlaceholder}>
                  请设置目标以查看详情
                </Text>
              )}
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.previewHeader}>
              <Text style={styles.previewPracticeName}>{practiceName}</Text>
              {projectName && (
                <View style={styles.previewProjectPill}>
                  <Text style={styles.previewProjectPillText}>
                    {projectName}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.previewDetails}>
              <Text style={styles.previewDetailItem}>
                <Text>
                  📅 {formatDate(startDate)} →{" "}
                  {formatDate(
                    durationMode === "自定义"
                      ? customEndDate
                      : new Date(
                          startDate.getTime() +
                            (durationMode === "60天"
                              ? 60
                              : durationMode === "100天"
                                ? 100
                                : durationMode === "1年"
                                  ? 365
                                  : 60) *
                              24 *
                              60 *
                              60 *
                              1000,
                        ),
                  )}{" "}
                  ({days} 天)
                </Text>
              </Text>

              {sessionsTarget ? (
                <Text style={styles.previewDetailItem}>
                  <Text>🎯 每周目标: {sessionsTarget} 座</Text>
                </Text>
              ) : (
                <Text style={styles.previewPlaceholder}>
                  请设置目标以查看详情
                </Text>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  const calculateDays = () => {
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

  const calculateWeeks = () => {
    return Math.ceil(calculateDays() / 7);
  };

  const handleConfirm = async () => {
    if (!user) return;

    // Validation
    if (practiceType === "time") {
      if (!sessionsTarget || parseInt(sessionsTarget) <= 0) {
        toastService.error("请输入有效的座数");
        return;
      }
    } else {
      if (configMode === "total") {
        if (!totalTarget || parseInt(totalTarget) <= 0) {
          toastService.error("请输入有效的总目标数量");
          return;
        }
      } else {
        if (!dailyTarget || parseInt(dailyTarget) <= 0) {
          toastService.error("请输入有效的每日目标数量");
          return;
        }
      }
    }

    setLoading(true);

    try {
      let projectData;

      if (practiceType === "time") {
        // Time-based practice configuration
        const startDateObj = new Date(startDate);
        const weeks = calculateWeeks();
        const endDate = new Date(startDateObj);
        endDate.setDate(startDateObj.getDate() + weeks * 7);
        const targetCount = parseInt(sessionsTarget) * weeks;

        projectData = {
          user_id: user.id,
          practice_id: practiceId,
          target_period: "weekly",
          daily_target: parseInt(sessionsTarget),
          start_date: startDateObj.toISOString().split("T")[0],
          target_end_date: endDate.toISOString().split("T")[0],
          target_count: targetCount,
          current_count: 0,
          status: "active",
          goal_type: configMode,
          preset_project_id: selectedPresetId || null,
          project_name: selectedPresetId ? null : projectName || null,
        };
      } else {
        // Count-based practice configuration
        const startDateObj = new Date(startDate);
        const days = calculateDays();
        const endDate = new Date(startDateObj);
        endDate.setDate(startDateObj.getDate() + days);
        let finalTargetCount, finalDailyTarget;

        if (configMode === "total") {
          finalTargetCount = parseInt(totalTarget);
          finalDailyTarget = Math.ceil(finalTargetCount / days);
        } else {
          finalDailyTarget = parseInt(dailyTarget);
          finalTargetCount = finalDailyTarget * days;
        }

        projectData = {
          user_id: user.id,
          practice_id: practiceId,
          target_count: finalTargetCount,
          daily_target: finalDailyTarget,
          start_date: startDateObj.toISOString().split("T")[0],
          target_end_date: endDate.toISOString().split("T")[0],
          current_count: 0,
          status: "active",
          target_period: "daily",
          goal_type: configMode,
          preset_project_id: selectedPresetId || null,
          project_name: selectedPresetId ? null : projectName || null,
        };
      }

      if (isEditMode && projectId) {
        // Update existing project
        const { data, error } = await supabase
          .from("user_practice_projects")
          .update(projectData)
          .eq('id', projectId)
          .select();

        if (error) throw error;

        console.log("✅ Practice project updated:", data);
        toastService.success({
          title: "修行项目已更新",
          message: "您的修行计划已成功调整",
          onPress: () => router.push("/(tabs)/practice")
        });
        
        setTimeout(() => {
          router.push("/(tabs)/practice");
        }, 1500);
      } else {
        // Create new project
        const { data, error } = await supabase
          .from("user_practice_projects")
          .insert([projectData])
          .select();

        if (error) throw error;

        console.log("✅ Practice project created:", data);
        toastService.success({
          title: "修行项目已添加",
          message: "开始您的修行之路吧！",
          onPress: () => router.push("/(tabs)/practice")
        });
        
        setTimeout(() => {
          router.push("/(tabs)/practice");
        }, 1500);
      }
    } catch (error) {
      console.error("❌ Error creating practice project:", error);
      toastService.error({
        title: "操作失败",
        message: "创建修行项目失败，请检查网络连接后重试"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTemplate
      title={isEditMode ? `编辑${practiceName}` : practiceName}
      showBackButton={true}
      onBackPress={() => router.back()}
      rightAction={{
        text: "保存",
        onPress: handleConfirm,
      }}
      scrollable={true}
      backgroundColor={ConsolidatedConsolidatedDesignSystem.colors["surface-primary"]}
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
  section: componentHelpers.getCardWithBottomMargin(
    'outlined',
    'comfortable',
    'comfortable'
  ),
  sectionTitle: {
    ...ComponentTextStyles.subheading,
    marginBottom: ConsolidatedDesignSystem.spacing.lg,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Tertiary,
    borderRadius: ConsolidatedDesignSystem.borderRadius.md,
    padding: ConsolidatedDesignSystem.spacing.xs,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: ConsolidatedDesignSystem.spacing.md,
    paddingHorizontal: ConsolidatedDesignSystem.spacing.lg,
    borderRadius: ConsolidatedDesignSystem.borderRadius.sm,
    alignItems: "center",
  },
  segmentButtonActive: {
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary,
    ...ConsolidatedDesignSystem.shadow.sm,
  },
  segmentButtonText: {
    ...ComponentTextStyles.label,
    color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
  },
  segmentButtonTextActive: {
    ...ComponentTextStyles.label,
    color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
  },
  inputContainer: {
    marginTop: ConsolidatedDesignSystem.spacing.lg,
  },
  inputLabel: {
    ...ComponentTextStyles.label,
    marginBottom: ConsolidatedDesignSystem.spacing.xs,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Tertiary,
    borderRadius: ConsolidatedDesignSystem.borderRadius.md,
    paddingHorizontal: ConsolidatedDesignSystem.spacing.md,
    borderWidth: 1,
    borderColor: ConsolidatedConsolidatedDesignSystem.colors["border-default"],
  },
  inputPrefix: {
    ...ComponentTextStyles.body,
    marginRight: ConsolidatedDesignSystem.spacing.sm,
  },
  textInput: {
    flex: 1,
    paddingVertical: ConsolidatedDesignSystem.spacing.md,
    fontSize: ConsolidatedDesignSystem.typography.fontSize.base,
    color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
  },
  inputUnit: {
    ...ComponentTextStyles.body,
    marginLeft: ConsolidatedDesignSystem.spacing.sm,
  },
  goalTypeContainer: {
    marginBottom: ConsolidatedDesignSystem.spacing.xl,
  },
  goalInputContainer: {
    marginTop: ConsolidatedDesignSystem.spacing.sm,
  },
  goalInputLabel: {
    ...ComponentTextStyles.subheading,
    marginBottom: ConsolidatedDesignSystem.spacing.sm,
  },
  goalInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Tertiary,
    borderRadius: ConsolidatedDesignSystem.borderRadius.md,
    paddingHorizontal: ConsolidatedDesignSystem.spacing.md,
    borderWidth: 1,
    borderColor: ConsolidatedConsolidatedDesignSystem.colors["border-default"],
  },
  goalTextInput: {
    flex: 1,
    paddingVertical: ConsolidatedDesignSystem.spacing.md,
    fontSize: ConsolidatedDesignSystem.typography.fontSize.base,
    color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
  },
  goalInputUnit: {
    ...ComponentTextStyles.body,
    marginLeft: ConsolidatedDesignSystem.spacing.sm,
  },
  simpleDateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Tertiary,
    borderRadius: ConsolidatedDesignSystem.borderRadius.md,
    paddingHorizontal: ConsolidatedDesignSystem.spacing.md,
    paddingVertical: ConsolidatedDesignSystem.spacing.md,
    borderWidth: 1,
    borderColor: ConsolidatedConsolidatedDesignSystem.colors["border-default"],
  },
  simpleDateButtonText: {
    ...ComponentTextStyles.body,
  },
  dateButtonIcon: {
    ...ComponentTextStyles.body,
  },
  smartDurationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: ConsolidatedDesignSystem.spacing.md,
    marginBottom: ConsolidatedDesignSystem.spacing.md,
  },
  daysInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Tertiary,
    borderRadius: ConsolidatedDesignSystem.borderRadius.md,
    paddingHorizontal: ConsolidatedDesignSystem.spacing.md,
    borderWidth: 1,
    borderColor: ConsolidatedConsolidatedDesignSystem.colors["border-default"],
    flex: 1,
  },
  daysInput: {
    flex: 1,
    paddingVertical: ConsolidatedDesignSystem.spacing.md,
    fontSize: ConsolidatedDesignSystem.typography.fontSize.base,
    color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
    textAlign: "center",
  },
  daysInputLabel: {
    ...ComponentTextStyles.body,
    marginLeft: ConsolidatedDesignSystem.spacing.xs,
  },
  durationSeparator: {
    ...ComponentTextStyles.label,
    color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
  },
  endDatePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Tertiary,
    borderRadius: ConsolidatedDesignSystem.borderRadius.md,
    paddingHorizontal: ConsolidatedDesignSystem.spacing.md,
    paddingVertical: ConsolidatedDesignSystem.spacing.md,
    borderWidth: 1,
    borderColor: ConsolidatedConsolidatedDesignSystem.colors["border-default"],
    flex: 2,
    justifyContent: "space-between",
  },
  endDatePickerButtonText: {
    ...ComponentTextStyles.body,
  },
  durationDisplay: {
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"],
    borderRadius: ConsolidatedDesignSystem.borderRadius.sm,
    padding: ConsolidatedDesignSystem.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: ConsolidatedConsolidatedDesignSystem.colors.primary,
  },
  durationDisplayText: {
    ...ComponentTextStyles.label,
    textAlign: "center",
  },
  
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: ConsolidatedDesignSystem.spacing.md,
    flexWrap: "wrap",
    gap: ConsolidatedDesignSystem.spacing.sm,
  },
  previewPracticeName: {
    ...ComponentTextStyles.subheading,
  },
  previewProjectPill: {
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors.primary,
    borderRadius: ConsolidatedDesignSystem.borderRadius.lg,
    paddingHorizontal: ConsolidatedDesignSystem.spacing.sm,
    paddingVertical: ConsolidatedDesignSystem.spacing.xs,
  },
  previewProjectPillText: {
    ...ComponentTextStyles.caption,
    color: ConsolidatedConsolidatedDesignSystem.colors["text-inverse"],
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.medium,
  },
  previewDetails: {
    gap: ConsolidatedDesignSystem.spacing.xxs,
  },
  previewDetailItem: {
    ...ComponentTextStyles.body,
    lineHeight: ConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedDesignSystem.typography.lineHeight.relaxed,
  },
  previewPlaceholder: {
    ...ComponentTextStyles.body,
    color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
    fontStyle: "italic",
  },
  projectNameContainer: {
    position: "relative",
  },
  projectNameButton: {
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Tertiary,
    borderRadius: ConsolidatedDesignSystem.borderRadius.md,
    paddingHorizontal: ConsolidatedDesignSystem.spacing.md,
    paddingVertical: ConsolidatedDesignSystem.spacing.md,
    borderWidth: 1,
    borderColor: ConsolidatedConsolidatedDesignSystem.colors["border-default"],
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  projectNameButtonText: {
    ...ComponentTextStyles.body,
    flex: 1,
  },
  projectNamePlaceholder: {
    color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
  },
  projectNameButtonIcon: {
    ...ComponentTextStyles.label,
    marginLeft: ConsolidatedDesignSystem.spacing.sm,
  },
  clearButton: {
    position: "absolute",
    right: ConsolidatedDesignSystem.spacing['3xl'],
    top: ConsolidatedDesignSystem.spacing.md,
    width: ConsolidatedDesignSystem.spacing['2xl'],
    height: ConsolidatedDesignSystem.spacing['2xl'],
    borderRadius: ConsolidatedDesignSystem.spacing.md,
    backgroundColor: ConsolidatedConsolidatedDesignSystem.status.error,
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    color: ConsolidatedConsolidatedDesignSystem.colors["text-inverse"],
    fontSize: ConsolidatedDesignSystem.typography.fontSize.xs,
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.bold,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"],
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: ConsolidatedDesignSystem.spacing.lg,
    paddingVertical: ConsolidatedDesignSystem.spacing.md,
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary,
    borderBottomWidth: 1,
    borderBottomColor: ConsolidatedConsolidatedDesignSystem.colors["border-default"],
  },
  modalCancelButton: {
    ...ComponentTextStyles.label,
    color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
  },
  modalTitle: {
    ...ComponentTextStyles.subheading,
  },
  modalConfirmButton: {
    ...ComponentTextStyles.label,
    color: ConsolidatedConsolidatedDesignSystem.colors.primary,
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold,
  },
  modalConfirmButtonDisabled: {
    color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
  },
  modalSearchContainer: {
    padding: ConsolidatedDesignSystem.spacing.lg,
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary,
    borderBottomWidth: 1,
    borderBottomColor: ConsolidatedConsolidatedDesignSystem.colors["border-default"],
  },
  modalSearchInput: {
    borderWidth: 1,
    borderColor: ConsolidatedConsolidatedDesignSystem.colors["border-default"]Light,
    borderRadius: ConsolidatedDesignSystem.borderRadius.lg,
    paddingHorizontal: ConsolidatedDesignSystem.spacing.lg,
    paddingVertical: ConsolidatedDesignSystem.spacing.base,
    fontSize: ConsolidatedDesignSystem.typography.fontSize.base,
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.normal,
    color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"],
    minHeight: 44,
  },
  modalPresetList: {
    flex: 1,
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary,
  },
  modalPresetItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: ConsolidatedDesignSystem.spacing.lg,
    paddingVertical: ConsolidatedDesignSystem.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: ConsolidatedConsolidatedDesignSystem.colors["border-default"]Light,
  },
  modalPresetContent: {
    flex: 1,
  },
  modalPresetName: {
    ...ComponentTextStyles.body,
  },
  modalPresetCategory: {
    ...ComponentTextStyles.caption,
    marginTop: ConsolidatedDesignSystem.spacing.xs,
  },
  modalPresetArrow: {
    ...ComponentTextStyles.body,
    color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
  },
  modalEmptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: ConsolidatedDesignSystem.spacing['5xl'],
    paddingHorizontal: ConsolidatedDesignSystem.spacing['3xl'],
  },
  modalEmptyText: {
    ...ComponentTextStyles.body,
    textAlign: "center",
    lineHeight: ConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedDesignSystem.typography.lineHeight.relaxed,
  },
  
  helpText: {
    ...ComponentTextStyles.caption,
    textAlign: "center",
    fontStyle: "italic",
  },
  webDatePicker: {
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Tertiary,
    borderRadius: ConsolidatedDesignSystem.borderRadius.md,
    padding: ConsolidatedDesignSystem.spacing.md,
    marginTop: ConsolidatedDesignSystem.spacing.sm,
    borderWidth: 1,
    borderColor: ConsolidatedConsolidatedDesignSystem.colors["border-default"],
  },
  webDateInput: {
    fontSize: ConsolidatedDesignSystem.typography.fontSize.base,
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.normal,
    color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: ConsolidatedDesignSystem.spacing.sm,
  },
});