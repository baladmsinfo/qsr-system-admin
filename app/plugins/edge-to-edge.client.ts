import { Capacitor, SystemBars, SystemBarsStyle } from "@capacitor/core";
import { EdgeToEdge } from "@capawesome/capacitor-android-edge-to-edge-support";

// Android 15+ forces edge-to-edge. The plugin insets the WebView so content
// never sits under the system bars (SystemBars' own insets handling is disabled
// in capacitor.config.ts so the two don't double up), and paints the bar areas
// to match the app, with dark icons on both.
const STATUS_BAR_COLOR = "#faf8ff";
const NAVIGATION_BAR_COLOR = "#ffffff";

export default defineNuxtPlugin(() => {
  if (Capacitor.getPlatform() !== "android") return;

  (async () => {
    try {
      await EdgeToEdge.enable();
      await EdgeToEdge.setStatusBarColor({ color: STATUS_BAR_COLOR });
      await EdgeToEdge.setNavigationBarColor({ color: NAVIGATION_BAR_COLOR });
      await SystemBars.setStyle({ style: SystemBarsStyle.Light });
    } catch (err) {
      console.warn("Edge-to-edge not available:", err);
    }
  })();
});
