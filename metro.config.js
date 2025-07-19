
const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const { withNativeWind } = require('nativewind/metro');

const config = getSentryExpoConfig(__dirname);

// Keep default asset extensions only
config.resolver.platforms = ['ios', 'android', 'web'];

// Ignore Replit development tools that may cause module resolution issues
config.resolver.blacklistRE = /__replco/;

// Apply NativeWind first, then Sentry
const configWithNativeWind = withNativeWind(config, { input: './global.css' });
module.exports = withSentryConfig(configWithNativeWind);
