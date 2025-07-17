
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Minimal configuration to avoid serializer issues
config.resolver.platforms = ['ios', 'android', 'web'];

// Temporarily disable NativeWind to isolate the Metro issue
module.exports = config;
