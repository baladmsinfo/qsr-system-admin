import { defineVuetifyConfiguration } from "vuetify-nuxt-module/custom-configuration";

// Bucksbox Signature design system - a vivid violet + warm amber palette
// shared identically with the CUSTOMER app, tonal surfaces instead of
// shadows, card-based layouts throughout.
export default defineVuetifyConfiguration({
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          primary: "#6D28D9", // Bucksbox violet - buttons, active nav, links, headline accents
          "primary-darken-1": "#5B21B6",
          secondary: "#6B6478", // purple-tinted slate for secondary text/icons
          accent: "#F59E0B", // warm amber - highlights, badges, secondary CTAs
          success: "#16A34A",
          warning: "#D97706",
          error: "#DC2626",
          info: "#4A6FA5",
          background: "#FAFAFC",
          surface: "#FFFFFF",
          "surface-variant": "#F3EEFF",
          "on-surface-variant": "#5B5566",
        },
      },
    },
  },
  defaults: {
    VBtn: { rounded: "pill", class: "text-none font-weight-medium" },
    VCard: { rounded: "lg" },
    VTextField: { variant: "outlined", density: "comfortable", color: "primary" },
    VSelect: { variant: "outlined", density: "comfortable", color: "primary" },
    VTextarea: { variant: "outlined", density: "comfortable", color: "primary" },
    VAutocomplete: { variant: "outlined", density: "comfortable", color: "primary" },
    VChip: { rounded: "pill" },
  },
});
