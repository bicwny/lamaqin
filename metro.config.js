
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Keep default asset extensions only
config.resolver.platforms = ['ios', 'android', 'web'];

// Ignore Replit development tools that may cause module resolution issues
config.resolver.blockList = /__replco/;

// Add better module resolution
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// Reset transformation cache to prevent stale module issues
config.resetCache = true;

// Add serializer configuration to handle undefined paths
config.serializer = {
  ...config.serializer,
  getModulesRunBeforeMainModule: () => [
    require.resolve('react-native/Libraries/Core/InitializeCore'),
  ],
  createModuleIdFactory: () => (path) => {
    if (!path || typeof path !== 'string') {
      console.warn('Metro: Invalid module path detected:', path);
      return '';
    }
    return path;
  },
};

// Add transformer options
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

module.exports = withNativeWind(config, { input: './global.css' });
