
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      // Ensure proper module resolution
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@/components': './components',
            '@/lib': './lib',
            '@/types': './types',
            '@/utils': './utils',
            '@/constants': './constants',
            '@/hooks': './hooks',
            '@/contexts': './contexts',
          },
          extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.ts', '.tsx', '.json'],
          cwd: 'babelrc',
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
