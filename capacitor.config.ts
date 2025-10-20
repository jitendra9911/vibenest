import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vibenest.app',
  appName: 'VibeNest',
  webDir: 'dist/public',
  plugins: {
    App: {
      deepLinkingEnabled: true,
      deepLinkingScheme: 'vibenest'
    }
  }
};

export default config;
