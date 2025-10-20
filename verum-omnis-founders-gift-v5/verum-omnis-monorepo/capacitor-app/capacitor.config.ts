import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'foundation.verumglobal.app',
  appName: 'Verum Omnis',
  webDir: 'www',
  server: {
    // TODO: Replace with your production Firebase Hosting URL after deployment
    // Examples:
    //   - 'https://gitverum.web.app'
    //   - 'https://your-project.firebaseapp.com'
    //   - 'https://your-custom-domain.com'
    url: 'https://YOUR_HOSTING_DOMAIN',
    cleartext: false  // Enforce HTTPS for security
  }
};

export default config;