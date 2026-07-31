import { defineVuetifyConfiguration } from "vuetify-nuxt-module/custom-configuration";

// Bucksbox "Soft Premium" design system - a purple-to-pink gradient accent
// (used sparingly for primary actions/active states) over soft off-white
// layered surfaces, shared identically with the CUSTOMER app.
export default defineVuetifyConfiguration({
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          primary: "#7C3AED", // Bucksbox purple - buttons, active nav, links, headline accents
          "primary-darken-1": "#6D28D9",
          secondary: "#DB2777", // pink - gradient end-stop, secondary highlights
          accent: "#F59E0B", // warm amber - status highlights, badges (semantic, keep)
          success: "#16A34A",
          warning: "#D97706",
          error: "#DC2626",
          info: "#4A6FA5",
          background: "#F8F6FC",
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
    VDialog: { rounded: "lg" },
    VSheet: { rounded: "lg" },
    VBottomSheet: { rounded: "t-lg" },
    VTextField: { variant: "outlined", density: "comfortable", color: "primary", rounded: "lg" },
    VSelect: { variant: "outlined", density: "comfortable", color: "primary", rounded: "lg" },
    VTextarea: { variant: "outlined", density: "comfortable", color: "primary", rounded: "lg" },
    VAutocomplete: { variant: "outlined", density: "comfortable", color: "primary", rounded: "lg" },
    VChip: { rounded: "pill" },
  },
});
