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
            color={ConsolidatedConsolidatedDesignSystem.colors.destructive}
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
    paddingVertical: ConsolidatedConsolidatedDesignSystem.spacing.md,
  },
  containerWithDivider: {
    borderBottomWidth: ComponentTokens.divider.thickness.thin,
    borderBottomColor: ComponentTokens.divider.colors.light,
    marginBottom: ComponentTokens.divider.spacing.tight,
  },
  containerCard: {
    ...ComponentTokens.card.variants.outlined,
    padding: ConsolidatedConsolidatedDesignSystem.spacing.lg,
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
    borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.lg,
    flexDirection: "row",
    gap: ConsolidatedConsolidatedDesignSystem.spacing.sm,
  },
  deletingText: {
    ...ComponentTextStyles.label,
    color: ConsolidatedConsolidatedDesignSystem.colors.destructive,
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.medium,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: ConsolidatedConsolidatedDesignSystem.spacing.sm,
  },
  recordDate: {
    ...ComponentTextStyles.label,
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.normal,
  },
  recordTime: {
    ...ComponentTextStyles.label,
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.normal,
  },
  content: {
    // marginBottom: ConsolidatedConsolidatedDesignSystem.spacing.md,
  },
  recordCount: {
    ...ComponentTextStyles.body,
    color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.medium,
  },
  notesContainer: {
    marginTop: ConsolidatedConsolidatedDesignSystem.spacing.sm,
    padding: ConsolidatedConsolidatedDesignSystem.spacing.md,
    backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary,
    // borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.md,
    borderLeftWidth: 2,
    borderLeftColor: ConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary,
  },
  notesLabel: {
    ...ComponentTextStyles.label,
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.semibold,
    marginBottom: ConsolidatedConsolidatedDesignSystem.spacing.xs,
  },
  notesText: {
    ...ComponentTextStyles.body,
    fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.sm,
    color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
    lineHeight:
      ConsolidatedConsolidatedDesignSystem.typography.fontSize.sm *
      ConsolidatedConsolidatedDesignSystem.typography.lineHeight.relaxed,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: ConsolidatedConsolidatedDesignSystem.spacing.md,
    marginTop: ConsolidatedConsolidatedDesignSystem.spacing.sm,
  },
  editButton: {
    ...ComponentTokens.button.variants.secondary,
    ...ComponentTokens.button.sizes.small,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: ConsolidatedConsolidatedDesignSystem.spacing.md,
  },
  editButtonText: {
    ...ComponentTextStyles.button.secondary,
  },
  deleteButton: {
    ...ComponentTokens.button.variants.destructive,
    ...ComponentTokens.button.sizes.small,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: ConsolidatedConsolidatedDesignSystem.spacing.lg,
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