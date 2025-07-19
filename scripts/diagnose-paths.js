
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnosing path issues...');
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Node version:', process.version);

// Check critical files
const criticalFiles = [
  'package.json',
  'app/_layout.tsx',
  'metro.config.js',
  'babel.config.js',
  'tsconfig.json',
  'node_modules/expo-router/entry.js'
];

criticalFiles.forEach(file => {
  const fullPath = path.resolve(file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file} exists at ${fullPath}`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

// Check environment variables
console.log('\n📋 Environment variables:');
console.log('EXPO_PACKAGER_PROXY_URL:', process.env.EXPO_PACKAGER_PROXY_URL);
console.log('REACT_NATIVE_PACKAGER_HOSTNAME:', process.env.REACT_NATIVE_PACKAGER_HOSTNAME);
console.log('REPLIT_DEV_DOMAIN:', process.env.REPLIT_DEV_DOMAIN);

// Check for common problematic patterns
const appDir = path.resolve('app');
if (fs.existsSync(appDir)) {
  const files = fs.readdirSync(appDir, { recursive: true });
  const problematicFiles = files.filter(file => 
    file.includes('undefined') || 
    file.includes('null') || 
    typeof file !== 'string'
  );
  
  if (problematicFiles.length > 0) {
    console.log('⚠️ Found problematic files:', problematicFiles);
  } else {
    console.log('✅ No problematic file names detected');
  }
}

console.log('🎯 Diagnosis complete!');
