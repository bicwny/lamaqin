
/**
 * Buddhist Component Simplification Migration
 * Provides mapping from old Buddhist-specific components to semantic system
 */

import { ComponentTokens, componentHelpers } from './componentTokens';

// Migration mapping for Buddhist components
export const BuddhistMigration = {
  // Old dharmaCard → card.standard + semantic.dharma
  dharmaCard: () => componentHelpers.getCardWithAccent('standard', 'dharma'),
  
  // Old meditationCard → card.standard + semantic.meditation (with border instead of left accent)
  meditationCard: () => ({
    ...componentHelpers.getCardStyle('standard'),
    borderWidth: 2,
    borderColor: componentHelpers.getSemanticColor('meditation'),
    shadowColor: componentHelpers.getSemanticColor('meditation'),
    shadowOpacity: 0.15,
  }),
  
  // Old wisdomBadge → badge.small + semantic.wisdom
  wisdomBadge: () => componentHelpers.getBadgeStyle('small', 'wisdom'),
  
  // Old completionBadge → badge.small + semantic.success (with background and border)
  completionBadge: () => ({
    ...componentHelpers.getBadgeStyle('small', 'success'),
    backgroundColor: 'rgba(46, 125, 50, 0.1)', // Light success background
    borderWidth: 1,
    borderColor: componentHelpers.getSemanticColor('success'),
    shadowOpacity: 0.1, // Reduce shadow for subtle completion style
  }),
};

// Text style migration
export const BuddhistTextMigration = {
  // Old dharmaTitle → semantic.dharmaTitle
  dharmaTitle: () => componentHelpers.getSemanticTextStyle('dharmaTitle'),
  
  // Old practiceText → semantic.practiceText
  practiceText: () => componentHelpers.getSemanticTextStyle('practiceText'),
  
  // Old completionText → semantic.successText
  completionText: () => componentHelpers.getSemanticTextStyle('successText'),
  
  // Old wisdomText → semantic.accentText
  wisdomText: () => componentHelpers.getSemanticTextStyle('accentText'),
};

// Usage examples for migration
export const BuddhistMigrationExamples = {
  // Before: ComponentTokens.buddhist.dharmaCard
  // After: BuddhistMigration.dharmaCard()
  
  // Before: ComponentTokens.buddhist.meditationCard
  // After: BuddhistMigration.meditationCard()
  
  // Before: ComponentTokens.buddhist.wisdomBadge
  // After: BuddhistMigration.wisdomBadge()
  
  // Before: ComponentTokens.buddhist.completionBadge
  // After: BuddhistMigration.completionBadge()
};

export default BuddhistMigration;
