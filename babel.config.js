
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Add reanimated plugin if needed
      'react-native-reanimated/plugin',
    ],
  };
};
