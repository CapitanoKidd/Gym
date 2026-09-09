module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // Reanimated 4 sposta il plugin del babel worklet in react-native-worklets
    plugins: ["react-native-worklets/plugin"],
  };
};
