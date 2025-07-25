
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Cleaning build artifacts...');

// Directories to clean
const dirsToClean = [
  '.expo',
  'node_modules/.cache',
  '/tmp/metro-cache-*',
  '/tmp/haste-map-*',
  '/tmp/react-*'
];

// Clean directories
dirsToClean.forEach(dir => {
  try {
    if (dir.includes('*')) {
      execSync(`rm -rf ${dir}`, { stdio: 'inherit' });
    } else if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✅ Cleaned ${dir}`);
    }
  } catch (error) {
    console.warn(`⚠️ Could not clean ${dir}:`, error.message);
  }
});

// Clear npm cache
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ Cleared npm cache');
} catch (error) {
  console.warn('⚠️ Could not clear npm cache:', error.message);
}

console.log('🎉 Cleanup complete!');
