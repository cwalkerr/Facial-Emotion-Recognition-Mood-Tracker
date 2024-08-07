/* eslint-env node */
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

module.exports = (() => {
  let config = getDefaultConfig(__dirname);

  // Apply withNativeWind configuration
  config = withNativeWind(config, { input: './global.css' });

  // Destructure transformer and resolver from the config
  const { transformer, resolver } = config;

  // Modify transformer and resolver settings
  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
  };
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
  };

  return config;
})();
