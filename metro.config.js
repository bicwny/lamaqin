const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Use regular expression for blockList without exclusionList
// Exclude __replco internals and the .local directory (used by agent tooling
// for transient files that would otherwise crash Metro's watcher with ENOENT).
//
// The pattern is anchored so it matches the `.local` directory itself
// (e.g. "/home/runner/workspace/.local") in addition to anything inside it.
// This is required because Metro's FallbackWatcher feeds the walker the FULL
// absolute directory path, and the walker's filterDir is what decides whether
// to descend (and therefore call fs.watch). If the regex only matches paths
// strictly INSIDE .local, the walker still descends into .local itself, sets
// up an fs.watch() on it, and then walks into transient subdirectories that
// agent tooling deletes, producing ENOENT. We also accept either an absolute
// path separator OR the start of the string before `.local`, because the same
// pattern is reused with relative paths (e.g. ".local/skills") in the
// watcher's _processChange path.
config.resolver.blockList = /(__replco.*|(?:^|[\\/])\.local(?:[\\/].*)?$)/;

// Sanitize resolver arrays to prevent undefined entries that crash production bundler
config.resolver.sourceExts = Array.from(new Set(
  (config.resolver.sourceExts || []).filter(Boolean).concat(['cjs'])
));
config.resolver.assetExts = (config.resolver.assetExts || []).filter(Boolean);

// Restore NativeWind integration with SDK 54
module.exports = withNativeWind(config, { input: './global.css' });