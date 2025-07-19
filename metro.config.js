
const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const { withNativeWind } = require('nativewind/metro');

const config = getSentryExpoConfig(__dirname);

// Keep default asset extensions only
config.resolver.platforms = ['ios', 'android', 'web'];

// Ignore Replit development tools that may cause module resolution issues
config.resolver.blacklistRE = /__replco/;

// Apply NativeWind and export
module.exports = withNativeWind(config, { input: './global.css' });
