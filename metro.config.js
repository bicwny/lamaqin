const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Minimal configuration for EAS compatibility
config.resolver.blockList = /__replco/;

module.exports = withNativeWind(config, { input: './global.css' });