
/**
 * Header Migration Utilities
 * Helps migrate from old header patterns to new consolidated Header component
 */

import { ComponentTokens } from './componentTokens';

export const HeaderMigration = {
  // Migration mapping for old patterns to new Header component
  patterns: {
    // Old PageHeader usage
    pageHeader: {
      component: 'PageHeader',
      newComponent: 'Header',
      props: {
        context: 'page' as const,
      },
      example: {
        old: `<PageHeader title="Title" showBackButton onBackPress={...} />`,
        new: `<Header title="Title" context="page" showBackButton onBackPress={...} />`,
      },
    },
    
    // Old modal header patterns
    modalHeader: {
      component: 'ModalHeader', // If it existed
      newComponent: 'Header',
      props: {
        context: 'modal' as const,
      },
      example: {
        old: `<ModalHeader title="Title" />`,
        new: `<Header title="Title" context="modal" />`,
      },
    },
    
    // Old section header patterns
    sectionHeader: {
      component: 'SectionHeader', // If it existed
      newComponent: 'Header',
      props: {
        context: 'section' as const,
      },
      example: {
        old: `<SectionHeader title="Title" />`,
        new: `<Header title="Title" context="section" />`,
      },
    },
  },

  // Helper to get appropriate context for migration
  getContextForUse: (usage: 'page' | 'modal' | 'section') => {
    return ComponentTokens.header[usage];
  },

  // Validation that all contexts are properly mapped
  validateMigration: () => {
    const contexts = ['page', 'modal', 'section'] as const;
    const missingContexts = contexts.filter(
      context => !ComponentTokens.header[context]
    );
    
    if (missingContexts.length > 0) {
      console.warn('Missing header contexts:', missingContexts);
      return false;
    }
    
    return true;
  },
};

// Export for use in migration scripts
export default HeaderMigration;
