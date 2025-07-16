
/**
 * Text Style Migration Utilities
 * Helps migrate from old ComponentTextStyles to new consolidated semantic styles
 */

import { ComponentTextStyles } from './componentTokens';

// Migration mapping from old text style paths to new consolidated styles
export const textStyleMigrationMap = {
  // Old button text styles → new button styles
  'ComponentTextStyles.button.primary': 'ComponentTextStyles.button.primary',
  'ComponentTextStyles.button.secondary': 'ComponentTextStyles.button.secondary',
  'ComponentTextStyles.button.small': 'ComponentTextStyles.button.secondary',
  'ComponentTextStyles.button.text': 'ComponentTextStyles.button.secondary',
  'ComponentTextStyles.button.dharma': 'ComponentTextStyles.button.primary',

  // Old card text styles → new semantic styles
  'ComponentTextStyles.card.title': 'ComponentTextStyles.subheading',
  'ComponentTextStyles.card.subtitle': 'ComponentTextStyles.label',
  'ComponentTextStyles.card.body': 'ComponentTextStyles.body',
  'ComponentTextStyles.card.metadata': 'ComponentTextStyles.caption',

  // Old notification text styles → new semantic styles
  'ComponentTextStyles.notification.title': 'ComponentTextStyles.subheading',
  'ComponentTextStyles.notification.message': 'ComponentTextStyles.body',

  // Old header text styles → new semantic styles
  'ComponentTextStyles.header.page': 'ComponentTextStyles.heading',
  'ComponentTextStyles.header.modal': 'ComponentTextStyles.subheading',
  'ComponentTextStyles.header.section': 'ComponentTextStyles.subheading',

  // Old semantic Buddhist styles → new semantic styles
  'ComponentTextStyles.semantic.dharmaTitle': 'ComponentTextStyles.dharma',
  'ComponentTextStyles.semantic.practiceText': 'ComponentTextStyles.practice',
  'ComponentTextStyles.semantic.successText': 'ComponentTextStyles.success',
  'ComponentTextStyles.semantic.accentText': 'ComponentTextStyles.button.primary',

  // Old component-specific styles → new semantic styles
  'Typography.components.practiceDetail.title': 'ComponentTextStyles.heading',
  'Typography.components.practiceDetail.subtitle': 'ComponentTextStyles.subheading',
  'Typography.components.practiceDetail.sectionTitle': 'ComponentTextStyles.subheading',
  'Typography.components.practiceDetail.description': 'ComponentTextStyles.body',
  'Typography.components.practiceDetail.label': 'ComponentTextStyles.label',
  'Typography.components.practiceDetail.value': 'ComponentTextStyles.body',
  'Typography.components.practiceDetail.metadata': 'ComponentTextStyles.caption',
  'Typography.components.practiceDetail.button': 'ComponentTextStyles.button.primary',
  'Typography.components.practiceDetail.secondaryButton': 'ComponentTextStyles.button.secondary',

  'Typography.components.card.title': 'ComponentTextStyles.subheading',
  'Typography.components.card.subtitle': 'ComponentTextStyles.label',
  'Typography.components.card.content': 'ComponentTextStyles.body',
  'Typography.components.card.caption': 'ComponentTextStyles.caption',

  'Typography.components.modal.title': 'ComponentTextStyles.subheading',
  'Typography.components.modal.subtitle': 'ComponentTextStyles.body',
  'Typography.components.modal.content': 'ComponentTextStyles.body',
  'Typography.components.modal.button': 'ComponentTextStyles.button.primary',

  'Typography.components.form.label': 'ComponentTextStyles.label',
  'Typography.components.form.input': 'ComponentTextStyles.input',
  'Typography.components.form.helper': 'ComponentTextStyles.caption',
  'Typography.components.form.error': 'ComponentTextStyles.caption',

  // Typography.styles mapping → new semantic styles
  'Typography.styles.heading()': 'ComponentTextStyles.heading',
  'Typography.styles.subheading()': 'ComponentTextStyles.subheading',
  'Typography.styles.body()': 'ComponentTextStyles.body',
  'Typography.styles.label()': 'ComponentTextStyles.label',
  'Typography.styles.caption()': 'ComponentTextStyles.caption',
  'Typography.styles.dharmaTitle()': 'ComponentTextStyles.dharma',
  'Typography.styles.practiceText()': 'ComponentTextStyles.practice',
  'Typography.styles.buttonText()': 'ComponentTextStyles.button.primary',
  'Typography.styles.linkText()': 'ComponentTextStyles.link',
};

// Text style consolidation examples
export const consolidationExamples = {
  // BEFORE: Multiple similar styles
  old: {
    practiceTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: '#1a1a1a',
      letterSpacing: -0.3,
    },
    dharmaTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: '#1a1a1a',
      letterSpacing: -0.3,
    },
    pageTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: '#1a1a1a',
      letterSpacing: -0.3,
    },
  },

  // AFTER: Single consolidated style
  new: {
    // All three become ComponentTextStyles.heading
    heading: ComponentTextStyles.heading,
  },
};

// Helper function to get the new text style from legacy path
export function migrateTextStyle(oldStylePath: string) {
  const newPath = textStyleMigrationMap[oldStylePath];
  if (!newPath) {
    console.warn(`No migration path found for text style: ${oldStylePath}`);
    return null;
  }

  // Handle nested paths like ComponentTextStyles.button.primary
  if (newPath.includes('.')) {
    const pathParts = newPath.replace('ComponentTextStyles.', '').split('.');
    let result = ComponentTextStyles;
    
    for (const part of pathParts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part];
      } else {
        console.warn(`Invalid text style path: ${newPath}`);
        return null;
      }
    }
    
    return result;
  }

  // Handle direct paths
  const styleName = newPath.replace('ComponentTextStyles.', '');
  return ComponentTextStyles[styleName as keyof typeof ComponentTextStyles];
}

// Common migration patterns
export const migrationPatterns = {
  // Replace component-specific text styles with semantic ones
  replaceComponentSpecific: {
    pattern: /Typography\.components\.\w+\./g,
    replacement: 'ComponentTextStyles.',
    note: 'Replace component-specific typography with semantic text styles'
  },

  // Replace Typography.styles function calls with direct ComponentTextStyles
  replaceTypographyStyles: {
    pattern: /Typography\.styles\.\w+\([^)]*\)/g,
    replacement: 'ComponentTextStyles.',
    note: 'Replace Typography.styles function calls with direct ComponentTextStyles access'
  },

  // Replace nested ComponentTextStyles paths
  replaceNestedPaths: {
    pattern: /ComponentTextStyles\.(card|button|header|notification|semantic)\./g,
    replacement: 'ComponentTextStyles.',
    note: 'Flatten nested ComponentTextStyles to semantic styles'
  },
};

// Validation helper to check if text style exists in new system
export function validateTextStyle(styleName: string): boolean {
  const validStyles = [
    'heading', 'subheading', 'body', 'label', 'caption',
    'button.primary', 'button.secondary', 'link',
    'dharma', 'practice', 'success', 'input'
  ];
  
  return validStyles.includes(styleName);
}

// Get suggested replacement for old text style
export function getSuggestedReplacement(oldStyle: any): string {
  const { fontSize, fontWeight, color } = oldStyle;
  
  // Suggest based on font size and weight patterns
  if (fontSize >= 20 && fontWeight >= '700') {
    return 'ComponentTextStyles.heading';
  } else if (fontSize >= 18 && fontWeight >= '600') {
    return 'ComponentTextStyles.subheading';
  } else if (fontSize >= 16 && fontWeight >= '500') {
    return 'ComponentTextStyles.body';
  } else if (fontSize >= 14) {
    return 'ComponentTextStyles.label';
  } else {
    return 'ComponentTextStyles.caption';
  }
}

export default {
  textStyleMigrationMap,
  consolidationExamples,
  migrateTextStyle,
  migrationPatterns,
  validateTextStyle,
  getSuggestedReplacement,
};
