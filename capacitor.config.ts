/// <reference types="@capawesome/capacitor-android-edge-to-edge-support" />
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.billx.in',
  appName: 'KollectQSR',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  // server: {
  //     url: 'http://192.168.31.83:3100',
  //     cleartext: true
  // },
  plugins: {
    // The edge-to-edge plugin owns WebView insets; letting SystemBars apply
    // them as well would pad the content twice.
    SystemBars: {
      insetsHandling: 'disable'
    },
    EdgeToEdge: {
      statusBarColor: '#faf8ff',
      navigationBarColor: '#ffffff'
    }
  }
};

export default config;
