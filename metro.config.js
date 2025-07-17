const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Clear any problematic resolver configurations
config.resolver.platforms = ['ios', 'android', 'web'];

// Simple blockList for Replit
config.resolver.blockList = /__replco/;

// Reset cache to ensure clean state
config.resetCache = true;

// Remove complex serializer configurations that might cause issues
delete config.serializer;

module.exports = withNativeWind(config, { input: './global.css' });