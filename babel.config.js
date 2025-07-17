
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Temporarily removed nativewind plugin
    // plugins: ["nativewind/babel"],
  };
};
