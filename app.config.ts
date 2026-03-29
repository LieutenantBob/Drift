export default {
  expo: {
    name: 'Drift',
    slug: 'drift',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'drift',
    userInterfaceStyle: 'dark',
    splash: { backgroundColor: '#0A090F' },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.drift.journal',
    },
    android: {
      package: 'com.drift.journal',
      adaptiveIcon: { backgroundColor: '#0A090F' },
    },
    plugins: [
      'expo-router',
    ],
  },
};
