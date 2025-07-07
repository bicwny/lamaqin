
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Configure resolver to handle assets properly
config.resolver.assetExts.push('ttf', 'otf', 'woff', 'woff2');

// Configure Metro to ignore the fonts directory if it exists
config.resolver.blacklistRE = /fonts\//;

module.exports = withNativeWind(config, { input: './global.css' });
