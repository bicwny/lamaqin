const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Enhanced resolver configuration
config.resolver = {
  ...config.resolver,
  platforms: ['ios', 'android', 'native', 'web'],
  alias: {
    '@': path.resolve(__dirname),
    '@/components': path.resolve(__dirname, 'components'),
    '@/lib': path.resolve(__dirname, 'lib'),
    '@/types': path.resolve(__dirname, 'types'),
    '@/utils': path.resolve(__dirname, 'utils'),
    '@/constants': path.resolve(__dirname, 'constants'),
    '@/hooks': path.resolve(__dirname, 'hooks'),
    '@/contexts': path.resolve(__dirname, 'contexts'),
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

// Enhanced serializer configuration to handle undefined paths
config.serializer = {
  ...config.serializer,
  getModulesRunBeforeMainModule: () => [],
  processModuleFilter: (module) => {
    // Filter out modules with undefined paths
    if (!module.path || typeof module.path !== 'string') {
      console.warn('Filtering out module with undefined path:', module);
      return false;
    }
    return true;
  },
};

// Add transformer configuration
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
  minifierPath: 'metro-minify-terser',
  minifierConfig: {
    // Handle undefined paths in minification
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

module.exports = withNativeWind(config, { input: './global.css' });