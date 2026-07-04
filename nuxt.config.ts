// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  ssr: false,

  runtimeConfig: {
    public: {
      API_ENDPOINT: process.env.NUXT_PUBLIC_API_URL,
      CUSTOMER_URL: process.env.NUXT_PUBLIC_CUSTOMER_URL || "http://localhost:3001",
    },
  },

  // when enabling ssr option you need to disable inlineStyles and maybe devLogs
  features: {
    inlineStyles: false,
    devLogs: false,
  },

  build: {
    transpile: ["vuetify"],
  },

  vite: {
    ssr: {
      noExternal: ["vuetify"],
    },
  },

  css: [],
  buildModules: [["@pinia/nuxt", { disableVuex: true }]],
  modules: ["@nuxt/fonts", "vuetify-nuxt-module", "@pinia/nuxt", "nuxt-toast"],

  fonts: {
    families: [
      { name: "Inter", provider: "google", weights: [400, 500, 600] },
      { name: "Manrope", provider: "google", weights: [600, 700, 800] },
      { name: "JetBrains Mono", provider: "google", weights: [500, 600] },
    ],
  },

  vuetify: {
    moduleOptions: {
      // check https://nuxt.vuetifyjs.com/guide/server-side-rendering.html
      ssrClientHints: {
        reloadOnFirstRequest: false,
        viewportSize: true,
        prefersColorScheme: false,

        prefersColorSchemeOptions: {
          useBrowserThemeOnly: false,
        },
      },
      vuetifyOptions: "./vuetify.config.ts", // <== you can omit it
      // /* If customizing sass global variables ($utilities, $reset, $color-pack, $body-font-family, etc) */
      // disableVuetifyStyles: true,
      styles: {
        configFile: "assets/settings.scss",
      },
    },
  },
});
