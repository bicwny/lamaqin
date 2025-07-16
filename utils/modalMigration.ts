
/**
 * Modal Migration Utilities
 * Helps migrate from old 4-variant modal system to new 2-variant system with size props
 */

import { ComponentTokens, componentHelpers } from './componentTokens';

export const ModalMigration = {
  // Migration mapping for old patterns to new consolidated system
  patterns: {
    // Old ComponentTokens.modal.standard → new dialog with default size
    standard: {
      oldPattern: 'ComponentTokens.modal.standard',
      newPattern: "componentHelpers.getModalStyle('dialog', 'default')",
      component: '<ModalTemplate variant="dialog" size="default" />',
      description: 'Standard modal with default dialog styling',
    },
    
    // Old ComponentTokens.modal.alert → new dialog with compact size
    alert: {
      oldPattern: 'ComponentTokens.modal.alert',
      newPattern: "componentHelpers.getModalStyle('dialog', 'compact')",
      component: '<ModalTemplate variant="dialog" size="compact" />',
      description: 'Alert-style modal with compact dialog styling',
    },
    
    // Old ComponentTokens.modal.fullscreen → unchanged
    fullscreen: {
      oldPattern: 'ComponentTokens.modal.fullscreen',
      newPattern: "componentHelpers.getModalStyle('fullscreen')",
      component: '<ModalTemplate variant="fullscreen" />',
      description: 'Full-screen modal (unchanged)',
    },
    
    // Old ComponentTokens.modal.overlay → new overlay utility
    overlay: {
      oldPattern: 'ComponentTokens.modal.overlay',
      newPattern: 'componentHelpers.getOverlayStyle()',
      component: 'Use as separate overlay utility',
      description: 'Modal overlay background (now separate utility)',
    },
  },

  // Helper to determine appropriate size for migration
  getSizeForLegacyModal: (legacyType: 'standard' | 'alert' | 'fullscreen') => {
    switch (legacyType) {
      case 'alert':
        return 'compact';
      case 'standard':
        return 'default';
      case 'fullscreen':
        return undefined; // No size needed for fullscreen
      default:
        return 'default';
    }
  },

  // Helper to get migrated modal props
  getMigratedProps: (legacyType: 'standard' | 'alert' | 'fullscreen') => {
    switch (legacyType) {
      case 'fullscreen':
        return { variant: 'fullscreen' as const };
      case 'alert':
        return { variant: 'dialog' as const, size: 'compact' as const };
      case 'standard':
      default:
        return { variant: 'dialog' as const, size: 'default' as const };
    }
  },
};

// Component replacement patterns for automated migration
export const modalReplacementPatterns = {
  // Pattern: ComponentTokens.modal.standard
  standard: {
    find: /ComponentTokens\.modal\.standard/g,
    replace: "componentHelpers.getModalStyle('dialog', 'default')",
  },
  
  // Pattern: ComponentTokens.modal.alert
  alert: {
    find: /ComponentTokens\.modal\.alert/g,
    replace: "componentHelpers.getModalStyle('dialog', 'compact')",
  },
  
  // Pattern: ComponentTokens.modal.fullscreen
  fullscreen: {
    find: /ComponentTokens\.modal\.fullscreen/g,
    replace: "componentHelpers.getModalStyle('fullscreen')",
  },
  
  // Pattern: ComponentTokens.modal.overlay
  overlay: {
    find: /ComponentTokens\.modal\.overlay/g,
    replace: "componentHelpers.getOverlayStyle()",
  },
};

export default ModalMigration;
