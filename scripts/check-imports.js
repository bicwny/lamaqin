
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking for problematic imports...');

function scanDirectory(dir, results = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      scanDirectory(fullPath, results);
    } else if (stat.isFile() && /\.(js|jsx|ts|tsx)$/.test(item)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          // Check for problematic import patterns
          if (line.includes('import') && (
            line.includes('undefined') ||
            line.includes('null') ||
            line.match(/from\s+['"]['"]/) ||  // Empty import path
            line.match(/from\s+['"][\s]*['"]/) // Whitespace-only import path
          )) {
            results.push({
              file: fullPath,
              line: index + 1,
              content: line.trim()
            });
          }
        });
      } catch (error) {
        console.warn(`Could not read file: ${fullPath}`);
      }
    }
  }
  
  return results;
}

const problematicImports = scanDirectory('./app');
problematicImports.push(...scanDirectory('./components'));

if (problematicImports.length > 0) {
  console.log('❌ Found problematic imports:');
  problematicImports.forEach(item => {
    console.log(`  ${item.file}:${item.line} - ${item.content}`);
  });
} else {
  console.log('✅ No problematic imports found');
}

// Check for circular dependencies
console.log('\n🔄 Checking for potential circular dependencies...');
// This is a basic check - you might want to use a more sophisticated tool
const importMap = new Map();

function buildImportMap(dir) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      buildImportMap(fullPath);
    } else if (stat.isFile() && /\.(js|jsx|ts|tsx)$/.test(item)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const imports = [];
        const importRegex = /import.*from\s+['"]([^'"]+)['"]/g;
        let match;
        
        while ((match = importRegex.exec(content)) !== null) {
          if (match[1].startsWith('./') || match[1].startsWith('../') || match[1].startsWith('@/')) {
            imports.push(match[1]);
          }
        }
        
        importMap.set(fullPath, imports);
      } catch (error) {
        // Skip files that can't be read
      }
    }
  }
}

buildImportMap('./app');
buildImportMap('./components');

console.log('📊 Import map built successfully');
console.log(`   Total files analyzed: ${importMap.size}`);
