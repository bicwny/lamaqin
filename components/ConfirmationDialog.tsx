import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';
import { ComponentTextStyles } from '@/utils/componentTokens';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export default function ConfirmationDialog({
  visible,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmationDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Title */}
          <Text style={styles.title}>{title}</Text>
          
          {/* Message */}
          <Text style={styles.message}>{message}</Text>
          
          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                destructive && styles.destructiveButton,
              ]}
              onPress={onConfirm}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  destructive && styles.destructiveButtonText,
                ]}
              >
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignSystem.spacing.xl,
  },
  dialog: {
    backgroundColor: DesignSystem.colors.whiteTara,
    borderRadius: DesignSystem.borderRadius.xl,
    padding: DesignSystem.spacing.xl,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 400 : '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  title: {
    ...ComponentTextStyles.subheading,
    color: DesignSystem.colors.blackTara,
    marginBottom: DesignSystem.spacing.md,
    textAlign: 'center',
  },
  message: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.blackTaraLight,
    marginBottom: DesignSystem.spacing.xl,
    textAlign: 'center',
    lineHeight: DesignSystem.typography.lineHeight.relaxed * DesignSystem.typography.fontSize.base,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: DesignSystem.colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border,
  },
  cancelButtonText: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.blackTara,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
  confirmButton: {
    backgroundColor: DesignSystem.colors.redTara,
  },
  confirmButtonText: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.whiteTara,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
  destructiveButton: {
    backgroundColor: DesignSystem.colors.error,
  },
  destructiveButtonText: {
    color: DesignSystem.colors.whiteTara,
  },
});
