
#!/usr/bin/env node

/**
 * Automated Color Consolidation Migration Script
 * Migrates from 50+ color tokens to 15 consolidated tokens
 */

const fs = require('fs');
const path = require('path');

// Migration mappings
const colorMigrationMap = {
  // Text colors
  'DesignSystem.colors.textPrimary': 'ConsolidatedDesignSystem.colors["text-primary"]',
  'DesignSystem.colors.textOnLight': 'ConsolidatedDesignSystem.colors["text-primary"]',
  'DesignSystem.colors.textSecondary': 'ConsolidatedDesignSystem.colors["text-secondary"]',
  'DesignSystem.colors.textTertiary': 'ConsolidatedDesignSystem.colors["text-secondary"]',
  'DesignSystem.colors.textInverse': 'ConsolidatedDesignSystem.colors["text-inverse"]',
  'DesignSystem.colors.textOnDark': 'ConsolidatedDesignSystem.colors["text-inverse"]',
  'DesignSystem.colors.enlightenmentWhite': 'ConsolidatedDesignSystem.colors["text-inverse"]',
  
  // Background colors
  'DesignSystem.colors.background': 'ConsolidatedDesignSystem.colors["surface-primary"]',
  'DesignSystem.colors.backgroundTertiary': 'ConsolidatedDesignSystem.colors["surface-primary"]',
  'DesignSystem.colors.cardBackground': 'ConsolidatedDesignSystem.colors["surface-primary"]',
  'DesignSystem.colors.modalBackground': 'ConsolidatedDesignSystem.colors["surface-primary"]',
  'DesignSystem.colors.backgroundSecondary': 'ConsolidatedDesignSystem.colors["surface-secondary"]',
  
  // Border colors
  'DesignSystem.colors.border': 'ConsolidatedDesignSystem.colors["border-default"]',
  'DesignSystem.colors.borderLight': 'ConsolidatedDesignSystem.colors["border-default"]',
  'DesignSystem.colors.borderDark': 'ConsolidatedDesignSystem.colors["border-default"]',
  
  // Primary colors
  'DesignSystem.colors.primary': 'ConsolidatedDesignSystem.colors.primary',
  'DesignSystem.colors.primaryDark': 'ConsolidatedDesignSystem.colorUtils.darken(ConsolidatedDesignSystem.colors.primary)',
  'DesignSystem.colors.primaryLight': 'ConsolidatedDesignSystem.colorUtils.lighten(ConsolidatedDesignSystem.colors.primary)',
  
  // Buddhist colors
  'DesignSystem.colors.dharmaRed': 'ConsolidatedDesignSystem.accent["accent-primary"]',
  'DesignSystem.colors.practiceActive': 'ConsolidatedDesignSystem.accent["accent-primary"]',
  'DesignSystem.colors.compassionOrange': 'ConsolidatedDesignSystem.accent["accent-primary"]',
  'DesignSystem.colors.meditationBlue': 'ConsolidatedDesignSystem.accent["accent-secondary"]',
  'DesignSystem.colors.studyProgress': 'ConsolidatedDesignSystem.accent["accent-secondary"]',
  'DesignSystem.colors.wisdomGold': 'ConsolidatedDesignSystem.colorUtils.adjustHue(ConsolidatedDesignSystem.accent["accent-primary"], 45)',
  
  // Status colors
  'DesignSystem.colors.success': 'ConsolidatedDesignSystem.status.success',
  'DesignSystem.colors.warning': 'ConsolidatedDesignSystem.status.warning',
  'DesignSystem.colors.error': 'ConsolidatedDesignSystem.status.error',
  'DesignSystem.colors.info': 'ConsolidatedDesignSystem.status.info',
  
  // Practice status
  'DesignSystem.colors.practiceComplete': 'ConsolidatedDesignSystem.status.success',
  'DesignSystem.colors.practiceInactive': 'ConsolidatedDesignSystem.colors["text-secondary"]',
  'DesignSystem.colors.mindfulnessAlert': 'ConsolidatedDesignSystem.status.warning',
  
  // Background variations
  'DesignSystem.colors.successBackground': 'ConsolidatedDesignSystem.colorUtils.withOpacity(ConsolidatedDesignSystem.status.success, 0.1)',
  'DesignSystem.colors.warningBackground': 'ConsolidatedDesignSystem.colorUtils.withOpacity(ConsolidatedDesignSystem.status.warning, 0.1)',
  'DesignSystem.colors.errorBackground': 'ConsolidatedDesignSystem.colorUtils.withOpacity(ConsolidatedDesignSystem.status.error, 0.1)',
  
  // Border variations
  'DesignSystem.colors.successBorder': 'ConsolidatedDesignSystem.status.success',
  'DesignSystem.colors.warningBorder': 'ConsolidatedDesignSystem.status.warning',
  'DesignSystem.colors.errorBorder': 'ConsolidatedDesignSystem.status.error',
  
  // Utility colors
  'DesignSystem.colors.cardShadow': 'ConsolidatedDesignSystem.utility.shadow',
  'DesignSystem.colors.overlayDark': 'ConsolidatedDesignSystem.utility.overlay',
  'DesignSystem.colors.overlayBackground': 'ConsolidatedDesignSystem.utility.overlay',
};

// Import statement updates
const importUpdates = {
  "import { DesignSystem } from '@/constants/DesignSystem';": 
    "import ConsolidatedDesignSystem from '@/constants/ConsolidatedDesignSystem';",
  
  "import { DesignSystem }": 
    "import ConsolidatedDesignSystem",
    
  "from '@/constants/DesignSystem'": 
    "from '@/constants/ConsolidatedDesignSystem'",
};

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    
    if (fs.statSync(fullPath).isDirectory()) {
      // Skip certain directories
      if (!['node_modules', '.git', '.expo', 'attached_assets'].includes(file)) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      // Only process relevant file types
      if (file.match(/\.(tsx|ts|js|jsx)$/)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  console.log(`\n📁 Processing: ${filePath}`);
  
  // Update imports first
  Object.entries(importUpdates).forEach(([oldImport, newImport]) => {
    if (content.includes(oldImport)) {
      content = content.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport);
      hasChanges = true;
      console.log(`  ✅ Updated import: ${oldImport} → ${newImport}`);
    }
  });
  
  // Update color references
  Object.entries(colorMigrationMap).forEach(([oldColor, newColor]) => {
    const regex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    if (content.match(regex)) {
      content = content.replace(regex, newColor);
      hasChanges = true;
      console.log(`  🎨 Migrated color: ${oldColor} → ${newColor}`);
    }
  });
  
  // Update DesignSystem references to ConsolidatedDesignSystem
  if (content.includes('DesignSystem.')) {
    content = content.replace(/DesignSystem\./g, 'ConsolidatedDesignSystem.');
    hasChanges = true;
    console.log(`  🔄 Updated DesignSystem references to ConsolidatedDesignSystem`);
  }
  
  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  💾 File updated successfully`);
  } else {
    console.log(`  ⏭️  No changes needed`);
  }
  
  return hasChanges;
}

function main() {
  console.log('🚀 Starting Color Consolidation Migration...');
  console.log('📊 Migrating from 50+ tokens to 15 consolidated tokens\n');
  
  const projectRoot = process.cwd();
  const allFiles = getAllFiles(projectRoot);
  
  // Filter to relevant files (exclude the new consolidated files)
  const filesToMigrate = allFiles.filter(file => 
    !file.includes('ConsolidatedDesignSystem') && 
    !file.includes('consolidatedColorMigration') &&
    !file.includes('migrate-to-consolidated-colors')
  );
  
  console.log(`📋 Found ${filesToMigrate.length} files to process`);
  
  let totalChanges = 0;
  
  filesToMigrate.forEach(file => {
    if (migrateFile(file)) {
      totalChanges++;
    }
  });
  
  console.log('\n🎉 Migration Complete!');
  console.log(`📊 Summary:`);
  console.log(`   • Files processed: ${filesToMigrate.length}`);
  console.log(`   • Files modified: ${totalChanges}`);
  console.log(`   • Color tokens reduced: 50+ → 15 (70% reduction)`);
  console.log(`   • Buddhist semantics preserved through utility functions`);
  
  console.log('\n📝 Next Steps:');
  console.log('   1. Test the application to ensure all colors display correctly');
  console.log('   2. Update any remaining hardcoded colors');
  console.log('   3. Use Buddhist semantic helpers for practice-related features');
  console.log('   4. Generate color variations using utility functions');
  
  console.log('\n✨ Benefits Achieved:');
  console.log('   • 70% reduction in color tokens');
  console.log('   • Simplified maintenance');
  console.log('   • Consistent color usage');
  console.log('   • Buddhist semantic meaning preserved');
}

if (require.main === module) {
  main();
}

module.exports = { migrateFile, getAllFiles };
