
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add more robust module resolution
config.resolver = {
  ...config.resolver,
  platforms: ['ios', 'android', 'web'],
  alias: {
    '@': path.resolve(__dirname, './'),
  },
};

// Add transformer configuration to handle potential issues
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    ...config.transformer.minifierConfig,
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Add serializer configuration with error handling
config.serializer = {
  ...config.serializer,
  customSerializer: undefined, // Reset any custom serializer
};

module.exports = config;
