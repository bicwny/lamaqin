
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Keep default asset extensions only
config.resolver.platforms = ['ios', 'android', 'web'];

// Ignore Replit development tools that may cause module resolution issues
config.resolver.blockList = /__replco/;

// Reset transformation cache to prevent stale module issues
config.resetCache = true;

// Ensure proper module resolution
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = withNativeWind(config, { input: './global.css' });
