import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import ConsolidatedDesignSystem from "@/constants/DesignSystem";
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
}: PracticeRecordCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderRecordContent = () => {
    if (practiceType === "time") {
      return (
        <Text style={styles.recordCount}>
          第{record.session_number || 1}座 · {record.duration_minutes}分钟
        </Text>
      );
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
            color={ConsolidatedDesignSystem.colors.destructive}
            size="small"
          />
          <Text style={styles.deletingText}>删除中...</Text>
        </View>
      )}

      <View style={[styles.header, isDeleting && styles.disabledContent]}>
        <Text style={styles.recordDate}>{formatDate(record.record_date)}</Text>
        <Text style={styles.recordTime}>{formatTime(record.created_at)}</Text>
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

      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.editButton, isDeleting && styles.disabledButton]}
            onPress={onEdit}
            disabled={isDeleting}
          >
            <Text
              style={[
                styles.editButtonText,
                isDeleting && styles.disabledButtonText,
              ]}
            >
              编辑
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.editButton, isDeleting && styles.disabledButton]}
            onPress={onDelete}
            disabled={isDeleting}
          >
            <Text
              style={[
                styles.editButtonText,
                isDeleting && styles.disabledButtonText,
              ]}
            >
              删除
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingVertical: ConsolidatedDesignSystem.spacing.md,
  },
  containerWithDivider: {
    borderBottomWidth: ComponentTokens.divider.thickness.thin,
    borderBottomColor: ComponentTokens.divider.colors.light,
    marginBottom: ComponentTokens.divider.spacing.tight,
  },
  containerCard: {
    ...ComponentTokens.card.variants.outlined,
    padding: ConsolidatedDesignSystem.spacing.lg,
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
    borderRadius: ConsolidatedDesignSystem.borderRadius.lg,
    flexDirection: "row",
    gap: ConsolidatedDesignSystem.spacing.sm,
  },
  deletingText: {
    ...ComponentTextStyles.label,
    color: ConsolidatedDesignSystem.colors.destructive,
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.medium,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: ConsolidatedDesignSystem.spacing.sm,
  },
  recordDate: {
    ...ComponentTextStyles.label,
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.normal,
  },
  recordTime: {
    ...ComponentTextStyles.label,
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.normal,
  },
  content: {
    // marginBottom: ConsolidatedDesignSystem.spacing.md,
  },
  recordCount: {
    ...ComponentTextStyles.body,
    color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.medium,
  },
  notesContainer: {
    marginTop: ConsolidatedDesignSystem.spacing.sm,
    padding: ConsolidatedDesignSystem.spacing.md,
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary,
    // borderRadius: ConsolidatedDesignSystem.borderRadius.md,
    borderLeftWidth: 2,
    borderLeftColor: ConsolidatedConsolidatedDesignSystem.colors.primary,
  },
  notesLabel: {
    ...ComponentTextStyles.label,
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold,
    marginBottom: ConsolidatedDesignSystem.spacing.xs,
  },
  notesText: {
    ...ComponentTextStyles.body,
    fontSize: ConsolidatedDesignSystem.typography.fontSize.sm,
    color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
    lineHeight:
      ConsolidatedDesignSystem.typography.fontSize.sm *
      ConsolidatedDesignSystem.typography.lineHeight.relaxed,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: ConsolidatedDesignSystem.spacing.md,
    marginTop: ConsolidatedDesignSystem.spacing.sm,
  },
  editButton: {
    ...ComponentTokens.button.variants.secondary,
    ...ComponentTokens.button.sizes.small,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: ConsolidatedDesignSystem.spacing.md,
  },
  editButtonText: {
    ...ComponentTextStyles.button.secondary,
  },
  deleteButton: {
    ...ComponentTokens.button.variants.destructive,
    ...ComponentTokens.button.sizes.small,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: ConsolidatedDesignSystem.spacing.lg,
  },
  deleteButtonText: {
    ...ComponentTextStyles.button.primary,
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