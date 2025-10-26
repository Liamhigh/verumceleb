import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'foundation.verumglobal.app',
  appName: 'Verum Omnis',
  webDir: 'www',
  server: {
    url: 'https://gitverum.web.app',
    cleartext: false  // Enforce HTTPS for security
  }
};

export default config;