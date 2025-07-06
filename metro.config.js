
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Enable CSS support for web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ensure CSS files are processed
config.resolver.assetExts.push('css');

module.exports = withNativeWind(config, { 
  input: './global.css',
  configPath: './tailwind.config.js'
});
