
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ensure stable resolver configuration
config.resolver = {
  ...config.resolver,
  alias: {
    '@': path.resolve(__dirname, './'),
  },
  platforms: ['ios', 'android', 'web'],
};

// Ensure stable transformer configuration
config.transformer = {
  ...config.transformer,
  minifierPath: 'metro-minify-terser',
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

module.exports = config;
