const { getDefaultConfig } = require('expo/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const config = getDefaultConfig(__dirname);

// Use proper exclusionList for blockList
config.resolver.blockList = exclusionList([/__replco.*/]);

// Sanitize resolver arrays to prevent undefined entries that crash production bundler
config.resolver.sourceExts = Array.from(new Set(
  (config.resolver.sourceExts || []).filter(Boolean).concat(['cjs'])
));
config.resolver.assetExts = (config.resolver.assetExts || []).filter(Boolean);

// Temporarily remove NativeWind to isolate the undefined module issue
module.exports = config;