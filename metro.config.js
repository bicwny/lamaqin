
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Keep default asset extensions only
config.resolver.platforms = ['ios', 'android', 'web'];

// Use blockList instead of deprecated blacklistRE
config.resolver.blockList = [
  /\/__replco\/.*/,
  /\/\.replit$/,
  /\/replit\.nix$/,
];

module.exports = withNativeWind(config, { input: './global.css' });
