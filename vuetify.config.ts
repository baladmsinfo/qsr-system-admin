import { defineVuetifyConfiguration } from "vuetify-nuxt-module/custom-configuration";

// Bucksbox "Artisanal Operations" design system - subtle purple brand tone,
// tonal surfaces instead of shadows, card-based layouts throughout.
export default defineVuetifyConfiguration({
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          primary: "#4A3B78", // Bucksbox purple - buttons, active nav, links, headline accents
          "primary-darken-1": "#392C5E",
          secondary: "#6B6478", // purple-tinted slate for secondary text/icons
          accent: "#7C6BA8",
          success: "#2E7D5B",
          warning: "#B8860B",
          error: "#B3261E",
          info: "#4A6FA5",
          background: "#FAF9FC",
          surface: "#FFFFFF",
          "surface-variant": "#F3F1F8",
          "on-surface-variant": "#5B5566",
        },
      },
    },
  },
  defaults: {
    VBtn: { rounded: "lg", class: "text-none font-weight-medium" },
    VCard: { rounded: "lg" },
    VTextField: { variant: "outlined", density: "comfortable", color: "primary" },
    VSelect: { variant: "outlined", density: "comfortable", color: "primary" },
    VTextarea: { variant: "outlined", density: "comfortable", color: "primary" },
    VAutocomplete: { variant: "outlined", density: "comfortable", color: "primary" },
    VChip: { rounded: "pill" },
  },
});
