
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Configure resolver to handle assets properly
config.resolver.assetExts.push('ttf', 'otf', 'woff', 'woff2');

// Configure Metro to only look for assets in the assets directory
config.resolver.platforms = ['ios', 'android', 'web'];
config.resolver.assetResolutions = ['@1x', '@2x', '@3x'];

// Specify explicit asset search paths to avoid scanning non-existent directories
config.resolver.assetExts = [...config.resolver.assetExts, 'ttf', 'otf', 'woff', 'woff2'];

module.exports = withNativeWind(config, { input: './global.css' });
