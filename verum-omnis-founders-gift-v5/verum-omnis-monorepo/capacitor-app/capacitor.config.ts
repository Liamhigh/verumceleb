import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'foundation.verumglobal.app',
  appName: 'Verum Omnis',
  webDir: 'www',
  server: {
	url: 'https://YOUR_HOST',
	cleartext: false
  }
};

export default config;