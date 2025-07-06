const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// 1. 获取默认配置
const config = getDefaultConfig(__dirname);

// 2. 在传递给 withNativeWind 之前，直接修改配置对象 (这是关键步骤)
// 强制 Metro 使用更少的 worker 来降低资源消耗
config.maxWorkers = 2;

// 3. 将修改后的配置与 NativeWind 的配置合并
module.exports = withNativeWind(config, {
  input: './global.css',
  configPath: './tailwind.config.js',
});