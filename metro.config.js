
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Keep default asset extensions only
config.resolver.platforms = ['ios', 'android', 'web'];

module.exports = withNativeWind(config, { input: './global.css' });
