
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Simplify resolver configuration
config.resolver.platforms = ['ios', 'android', 'web'];

// Remove problematic blockList that might interfere with module resolution
// config.resolver.blockList = [];

module.exports = withNativeWind(config, { input: './global.css' });
