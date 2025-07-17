
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Enable CSS support
config.isCSSEnabled = true;

// Basic resolver configuration
config.resolver = {
  ...config.resolver,
  alias: {
    '@': path.resolve(__dirname, './'),
  },
  platforms: ['ios', 'android', 'web'],
};

// Reset transformer to default
config.transformer = {
  ...config.transformer,
  // Remove any custom transformers that might be causing issues
};

// Reset serializer to default
config.serializer = {
  ...config.serializer,
  // Remove custom serializer to fix path issues
};

module.exports = config;
