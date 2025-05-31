const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclou mòduls que depenen de Node.js
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  ws: require.resolve('./shims/empty.js'), // crea aquest fitxer com a shim buit
};

module.exports = config;
