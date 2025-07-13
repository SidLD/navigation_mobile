// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for GLB or other 3D asset formats
config.resolver.assetExts.push('glb', 'filamat', 'filamesh', 'ktx');

module.exports = config;
