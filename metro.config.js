const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Configure for Replit environment
config.resolver.platforms = ['ios', 'android', 'web'];
config.resolver.blockList = /__replco/;

// Reset cache to ensure clean state
config.resetCache = true;

module.exports = withNativeWind(config, { input: './global.css' });