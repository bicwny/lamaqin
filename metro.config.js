
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Enhanced resolver configuration for Replit
config.resolver.platforms = ['ios', 'android', 'web'];
config.resolver.alias = {
  '@': path.resolve(__dirname, './'),
};

// More comprehensive blacklist for Replit
config.resolver.blockList = [
  /\/__tests__\/.*/,
  /\/android\/app\/build\/.*/,
  /\/ios\/build\/.*/,
  /\/.expo\/.*/,
  /node_modules\/.*\/node_modules\/react-native\/.*/,
  /__replco/,
  /\.replit$/,
  /replit\.nix$/,
];

// Fix for path resolution issues
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'jsx', 'ts', 'tsx'];

// Enhanced transformer configuration
config.transformer = {
  ...config.transformer,
  minifierPath: require.resolve('metro-minify-terser'),
  minifierConfig: {
    ecma: 8,
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Serializer configuration to fix bundling issues
config.serializer = {
  ...config.serializer,
  createModuleIdFactory: function() {
    return function(path) {
      // Ensure path is always a string
      if (typeof path !== 'string') {
        console.warn('Invalid path detected:', path);
        return path || 'unknown';
      }
      return path;
    };
  },
};

// Enhanced watcher configuration for Replit
config.watchFolders = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, 'app'),
  path.resolve(__dirname, 'components'),
  path.resolve(__dirname, 'contexts'),
  path.resolve(__dirname, 'lib'),
  path.resolve(__dirname, 'hooks'),
  path.resolve(__dirname, 'constants'),
  path.resolve(__dirname, 'types'),
  path.resolve(__dirname, 'utils'),
];

module.exports = withNativeWind(config, { input: './global.css' });
