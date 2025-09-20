const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Minimal configuration for EAS compatibility
config.resolver.blockList = /__replco/;

// Add more robust path handling to prevent undefined errors
config.resolver.platforms = ['ios', 'android', 'web'];
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Try to prevent module resolution issues
config.resolver.unstable_enablePackageExports = false;
config.resolver.unstable_conditionNames = ['react-native', 'browser', 'require'];

module.exports = withNativeWind(config, { input: './global.css' });