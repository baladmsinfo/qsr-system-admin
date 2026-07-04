export default defineNuxtPlugin(() => {
  /**
   * Load Bucksbox SDK script dynamically
   */
  const loadSDK = () =>
    new Promise<void>((resolve, reject) => {
      if (window.Bucksbox) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "/bucksbox-sdk.js"; // <<< your SDK file path
      script.async = true;

      script.onload = () => resolve();
      script.onerror = () => reject("Failed to load Bucksbox SDK");

      document.head.appendChild(script);
    });

  /**
   * Public API: useBucksbox()
   */
  const useBucksbox = async (config: any = {}) => {
    await loadSDK();

    if (!window.Bucksbox) {
      console.error("Bucksbox SDK not loaded");
      return null;
    }

    return window.Bucksbox(config);
  };

  /**
   * Inject composable globally
   */
  return {
    provide: {
      bucksbox: useBucksbox
    }
  };
});
