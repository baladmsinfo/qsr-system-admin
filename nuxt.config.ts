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
      // Must match qsr-system-frondend's own NUXT_PUBLIC_APEX_DOMAIN exactly -
      // used only to build the "Preview" button's tenant-subdomain URL. Left
      // unset in local dev, where CUSTOMER_URL's own host/port + ".localhost"
      // is used instead (see buildPreviewUrl in the website-builder page).
      APEX_DOMAIN: process.env.NUXT_PUBLIC_APEX_DOMAIN || "",
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

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  vite: {
    ssr: {
      noExternal: ["vuetify"],
    },
  },

  css: [],
  buildModules: [["@pinia/nuxt", { disableVuex: true }]],
  modules: ["@nuxt/fonts", "vuetify-nuxt-module", "@pinia/nuxt", "nuxt-toast"],

  // Nuxt's default auto-import prefixes components in nested folders with the
  // folder name (e.g. components/builder/Canvas.vue -> <BuilderCanvas>). The
  // website-builder templates reference these by their bare filenames
  // (<Canvas>, <Toolbar>, ...), so pathPrefix is disabled for these two
  // directories specifically - `~/components` must stay listed after them to
  // keep the existing flat-file auto-import behavior for every other component.
  components: {
    dirs: [
      { path: "~/components/builder", pathPrefix: false },
      { path: "~/components/builder-blocks", pathPrefix: false },
      "~/components",
    ],
  },

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
