import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DesignSystem } from "@/constants/DesignSystem";
import { ComponentTokens, ComponentTextStyles } from "@/utils/componentTokens";

interface PracticeRecordCardProps {
  record: {
    id: string;
    record_date: string;
    created_at: string;
    count?: number;
    duration_minutes?: number;
    session_number?: number;
    notes?: string;
  };
  practiceUnit?: string;
  practiceType?: "time" | "count";
  isLast?: boolean;
  isDeleting?: boolean;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  hasTopics?: boolean;
}

export default function PracticeRecordCard({
  record,
  practiceUnit = "次",
  practiceType = "count",
  isLast = false,
  isDeleting = false,
  onPress,
  onEdit,
  onDelete,
  showActions = false,
  hasTopics = false,
}: PracticeRecordCardProps) {
  const formatDateTime = (dateString: string, timeString: string) => {
    const dateObj = new Date(dateString);
    const timeObj = new Date(timeString);
    
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const weekday = dateObj.toLocaleDateString("zh-CN", { weekday: "short" });
    const hour = String(timeObj.getHours()).padStart(2, "0");
    const minute = String(timeObj.getMinutes()).padStart(2, "0");
    
    return `${year}年${month}月${day}日 · ${weekday} · ${hour}:${minute}`;
  };

  const renderRecordContent = () => {
    if (practiceType === "time") {
      if (hasTopics) {
        return (
          <Text style={styles.recordCount}>
            第{record.session_number || 1}座 · {record.duration_minutes}分钟
          </Text>
        );
      } else {
        return (
          <Text style={styles.recordCount}>
            {record.duration_minutes}分钟
          </Text>
        );
      }
    } else {
      return (
        <Text style={styles.recordCount}>
          +{record.count?.toLocaleString()} {practiceUnit}
        </Text>
      );
    }
  };

  const containerStyle = [
    styles.container,
    !isLast && styles.containerWithDivider,
    isDeleting && styles.containerDeleting,
    showActions && styles.containerCard,
  ];

  const content = (
    <>
      {isDeleting && (
        <View style={styles.deletingOverlay}>
          <ActivityIndicator
            color={DesignSystem.colors.error} // Using standard error color for destructive actions
            size="small"
          />
          <Text style={styles.deletingText}>删除中...</Text>
        </View>
      )}

      <View style={[styles.header, isDeleting && styles.disabledContent]}>
        <View style={styles.headerLeft}>
          <Text style={styles.recordDate}>{formatDateTime(record.record_date, record.created_at)}</Text>
        </View>
        {showActions && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.iconButton, styles.editIconButton, isDeleting && styles.disabledButton]}
              onPress={onEdit}
              disabled={isDeleting}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={DesignSystem.colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, styles.deleteIconButton, isDeleting && styles.disabledButton]}
              onPress={onDelete}
              disabled={isDeleting}
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color={DesignSystem.colors.error}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={[styles.content, isDeleting && styles.disabledContent]}>
        {renderRecordContent()}

        {record.notes && (
          <View style={styles.notesContainer}>

            <Text style={styles.notesText} numberOfLines={showActions ? 3 : 2}>
              {record.notes}
            </Text>
          </View>
        )}
      </View>
    </>
  );

  if (onPress && !showActions) {
    return (
      <TouchableOpacity style={containerStyle} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: DesignSystem.spacing.md,
  },
  containerWithDivider: {
    borderBottomWidth: ComponentTokens.divider.thickness.thin,
    borderBottomColor: ComponentTokens.divider.colors.light,
    marginBottom: ComponentTokens.divider.spacing.tight,
  },
  containerCard: {
    ...ComponentTokens.card.variants.outlined,
    padding: DesignSystem.spacing.lg,
  },
  containerDeleting: {
    opacity: 0.6,
    position: "relative",
  },
  deletingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: DesignSystem.borderRadius.lg,
    flexDirection: "row",
    gap: DesignSystem.spacing.sm,
  },
  deletingText: {
    ...ComponentTextStyles.label,
    color: DesignSystem.colors.error, // Standard error color for destructive actions
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: DesignSystem.spacing.xs,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: DesignSystem.spacing.xs,
  },
  recordDate: {
    ...ComponentTextStyles.label,
    fontWeight: DesignSystem.typography.fontWeight.normal,
    color: DesignSystem.colors.textSecondary,
  },
  content: {
    // marginBottom: DesignSystem.spacing.md,
  },
  recordCount: {
    fontSize: DesignSystem.typography.fontSize.lg,
    color: DesignSystem.colors.textPrimary,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
  notesContainer: {
    marginTop: DesignSystem.spacing.sm,
    padding: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderRadius: DesignSystem.borderRadius.md,
    borderLeftWidth: 2,
    borderLeftColor: DesignSystem.colors.redTara, // Red Tara for practice energy and notes
  },
  notesLabel: {
    ...ComponentTextStyles.label,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    marginBottom: DesignSystem.spacing.xs,
  },
  notesText: {
    ...ComponentTextStyles.body,
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.textSecondary,
    lineHeight:
      DesignSystem.typography.fontSize.sm *
      DesignSystem.typography.lineHeight.relaxed,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: DesignSystem.spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  editIconButton: {
    borderColor: DesignSystem.colors.textTertiary,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
  },
  deleteIconButton: {
    borderColor: DesignSystem.colors.error,
    backgroundColor: "rgba(211, 47, 47, 0.08)",
  },
  disabledContent: {
    opacity: 0.5,
  },
  disabledButton: {
    opacity: 0.3,
  },
  disabledButtonText: {
    opacity: 0.5,
  },
});