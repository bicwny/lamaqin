
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Configure asset extensions and paths
config.resolver.assetExts.push('ttf', 'otf', 'woff', 'woff2');
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = withNativeWind(config, { input: './global.css' });
