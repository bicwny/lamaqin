
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Basic resolver configuration
config.resolver = {
  ...config.resolver,
  alias: {
    '@': path.resolve(__dirname, './'),
  },
  platforms: ['ios', 'android', 'web'],
};

module.exports = config;
