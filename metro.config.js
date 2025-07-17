
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Reset resolver to minimal configuration
config.resolver = {
  ...config.resolver,
  alias: {
    '@': path.resolve(__dirname, './'),
  },
  platforms: ['ios', 'android', 'web'],
  // Add explicit extensions and source extensions
  sourceExts: [...(config.resolver?.sourceExts || []), 'js', 'jsx', 'ts', 'tsx', 'json'],
  assetExts: [...(config.resolver?.assetExts || []), 'png', 'jpg', 'jpeg', 'gif', 'svg'],
};

// Reset serializer to avoid path resolution issues
config.serializer = {
  ...config.serializer,
  // Remove custom serializer options that might cause path issues
  customSerializer: undefined,
};

// Reset transformer to minimal configuration
config.transformer = {
  ...config.transformer,
  // Use default Expo transformer (don't specify babelTransformerPath)
};

module.exports = config;
