const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Clear any problematic resolver configurations
config.resolver.platforms = ['ios', 'android', 'web'];

// Simple blockList for Replit
config.resolver.blockList = /__replco/;

// Reset cache to ensure clean state
config.resetCache = true;

// Configure transformer to handle source maps better
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    mangle: {
      keep_fnames: true,
    },
    output: {
      ascii_only: true,
      quote_keys: true,
      wrap_iife: true,
    },
    sourceMap: {
      includeSources: false,
    },
  },
};

// Configure serializer to handle anonymous files better
config.serializer = {
  ...config.serializer,
  customSerializer: undefined,
  getModulesRunBeforeMainModule: () => [],
};

module.exports = withNativeWind(config, { input: './global.css' });