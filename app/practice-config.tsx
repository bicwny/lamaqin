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
import { Colors } from "@/constants/Colors";
import { ComponentTokens } from '@/utils/componentTokens';
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
      Alert.alert("日期错误", "结束日期不能早于开始日期");
      return;
    }
    setCustomEndDate(date);
    hideCustomDatePicker();
  };

  const renderTimePlanning = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>时间规划</Text>

      {/* Start date - always defaults to today, but editable */}
      <View style={styles.timeInputContainer}>
        <Text style={styles.timeInputLabel}>开始日期</Text>
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

      {/* End date - smart duration input */}
      <View style={styles.timeInputContainer}>
        <Text style={styles.timeInputLabel}>结束日期</Text>

        {/* Smart duration input */}
        <View style={styles.smartDurationContainer}>
          <View style={styles.daysInputContainer}>
            <TextInput
              style={styles.daysInput}
              value={customDays}
              onChangeText={handleDaysInputChange}
              placeholder="天数"
              keyboardType="numeric"
            />
            <Text style={styles.daysInputLabel}>天</Text>
          </View>

          <Text style={styles.durationSeparator}>或</Text>

          <TouchableOpacity
            style={styles.endDatePickerButton}
            onPress={showCustomDatepicker}
          >
            <Text style={styles.endDatePickerButtonText}>
              {formatDate(customEndDate)}
            </Text>
            <Text style={styles.dateButtonIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* Duration display */}
        <View style={styles.durationDisplay}>
          <Text style={styles.durationDisplayText}>
            {formatDate(startDate)} → {formatDate(customEndDate)} (共{" "}
            {calculatedDays} 天)
          </Text>
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
        <View style={styles.previewCard}>
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
        Alert.alert("错误", "请输入有效的座数");
        return;
      }
    } else {
      if (configMode === "total") {
        if (!totalTarget || parseInt(totalTarget) <= 0) {
          Alert.alert("错误", "请输入有效的总目标数量");
          return;
        }
      } else {
        if (!dailyTarget || parseInt(dailyTarget) <= 0) {
          Alert.alert("错误", "请输入有效的每日目标数量");
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
        Alert.alert("成功", "修行项目已更新！", [
          { text: "确定", onPress: () => router.push("/(tabs)/practice") },
        ]);
      } else {
        // Create new project
        const { data, error } = await supabase
          .from("user_practice_projects")
          .insert([projectData])
          .select();

        if (error) throw error;

        console.log("✅ Practice project created:", data);
        Alert.alert("成功", "修行项目已添加！", [
          { text: "确定", onPress: () => router.push("/(tabs)/practice") },
        ]);
      }
    } catch (error) {
      console.error("❌ Error creating practice project:", error);
      Alert.alert("错误", "创建修行项目失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTemplate
      title={isEditMode ? `编辑"${practiceName}"` : `配置"${practiceName}"`}
      showBackButton={true}
      onBackPress={() => router.back()}
      scrollable={true}
      backgroundColor={Colors.background}
      padding={0}
    >
        {/* The problematic empty line that was here has been removed. */}
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
            <ActivityIndicator color="#fff" />
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
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#f1f3f4",
    borderRadius: 8,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  segmentButtonActive: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  segmentButtonTextActive: {
    color: "#333",
  },
  inputContainer: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  inputHelper: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  inputPrefix: {
    fontSize: 16,
    color: "#666",
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: ComponentTokens.input.standard.paddingVertical,
    fontSize: ComponentTokens.input.standard.fontSize,
    color: ComponentTokens.input.standard.color,
  },
  inputUnit: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#333",
  },
  dateButtonIcon: {
    fontSize: 16,
  },
  durationOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f1f3f4",
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  durationButtonActive: {
    backgroundColor: Colors.primary,
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  durationButtonTextActive: {
    color: "white",
  },
  customButton: {
    backgroundColor: "#d4af37",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  customButtonActive: {
    backgroundColor: "#b8941f",
  },
  customButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  customButtonTextActive: {
    color: "white",
  },
  customInputContainer: {
    marginTop: 12,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  customInputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  customDateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  customDateButtonText: {
    fontSize: 16,
    color: "#333",
  },

  summaryContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
    marginBottom: 4,
  },
  summaryHighlight: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primary,
    lineHeight: 22,
    marginTop: 8,
  },
  topicProgressInfo: {
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#4a90e2",
    marginTop: 8,
  },
  topicProgressText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  topicProgressSubtext: {
    fontSize: 14,
    color: "#7f8c8d",
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  specialSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  topicProgressConfig: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  configLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  configDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    textAlign: "center",
    minWidth: 60,
    backgroundColor: "#fff",
  },
  helpText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
  // Simplified count-based config styles
  goalTypeContainer: {
    marginBottom: 20,
  },
  goalInputContainer: {
    marginTop: 8,
  },
  goalInputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  goalInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  goalTextInput: {
    flex: 1,
    paddingVertical: ComponentTokens.input.standard.paddingVertical,
    fontSize: ComponentTokens.input.standard.fontSize,
    color: ComponentTokens.input.standard.color,
  },
  goalInputUnit: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  // Simplified time planning styles
  timeInputContainer: {
    marginBottom: 16,
  },
  timeInputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  simpleDateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  simpleDateButtonText: {
    fontSize: 16,
    color: "#333",
  },
  dateButtonIcon: {
    fontSize: 16,
  },
  quickDurationButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  quickDurationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f1f3f4",
    borderRadius: 20,
  },
  quickDurationButtonActive: {
    backgroundColor: Colors.primary,
  },
  quickDurationButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  quickDurationButtonTextActive: {
    color: "white",
  },
  customDatePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    marginTop: 8,
  },
  customDatePickerButtonActive: {
    backgroundColor: "#e8f4fd",
    borderColor: Colors.primary,
  },
  customDatePickerButtonText: {
    fontSize: 16,
    color: "#333",
  },
  // Smart duration input styles
  smartDurationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  daysInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    flex: 1,
  },
  daysInput: {
    flex: 1,
    paddingVertical: ComponentTokens.input.standard.paddingVertical,
    fontSize: ComponentTokens.input.standard.fontSize,
    color: ComponentTokens.input.standard.color,
    textAlign: "center",
  },
  daysInputLabel: {
    fontSize: 16,
    color: "#666",
    marginLeft: 4,
  },
  durationSeparator: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  endDatePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    flex: 2,
    justifyContent: "space-between",
  },
  endDatePickerButtonText: {
    fontSize: 16,
    color: "#333",
  },
  durationDisplay: {
    backgroundColor: "#f0f8ff",
    borderRadius: 6,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  durationDisplayText: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  // Preview card styles
  previewCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 8,
  },
  previewPracticeName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  previewProjectPill: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  previewProjectPillText: {
    fontSize: 12,
    fontWeight: "500",
    color: "white",
  },
  previewDetails: {
    gap: 6,
  },
  previewDetailItem: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  previewPlaceholder: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  projectNameInput: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  projectNameContainer: {
    position: "relative",
  },
  projectNameButton: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  projectNameButtonText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  projectNamePlaceholder: {
    color: "#999",
  },
  projectNameButtonIcon: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  clearButton: {
    position: "absolute",
    right: 32,
    top: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#dc3545",
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  modalCancelButton: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalConfirmButton: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600",
  },
  modalConfirmButtonDisabled: {
    color: "#ccc",
  },
  modalSearchContainer: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  modalSearchInput: {
    ...ComponentTokens.input.search,
  },
  modalPresetList: {
    flex: 1,
    backgroundColor: "white",
  },
  modalPresetItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  modalPresetContent: {
    flex: 1,
  },
  modalPresetName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  modalPresetCategory: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  modalPresetArrow: {
    fontSize: 16,
    color: "#ccc",
  },
  modalEmptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  modalEmptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  webDatePicker: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  webDateInput: {
    fontSize: ComponentTokens.input.standard.fontSize,
    color: ComponentTokens.input.standard.color,
    backgroundColor: "transparent",
    borderWidth: 0,
    outlineWidth: 0,
  },
});