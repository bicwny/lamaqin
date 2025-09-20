const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Use regular expression for blockList without exclusionList
config.resolver.blockList = /__replco.*/;

// Sanitize resolver arrays to prevent undefined entries that crash production bundler
config.resolver.sourceExts = Array.from(new Set(
  (config.resolver.sourceExts || []).filter(Boolean).concat(['cjs'])
));
config.resolver.assetExts = (config.resolver.assetExts || []).filter(Boolean);

// Restore NativeWind integration with SDK 54
module.exports = withNativeWind(config, { input: './global.css' });