/**
 * Website Builder ONLY - the rest of the admin app (Vuetify) never sees this
 * config. `prefix` guarantees zero class-name collisions with Vuetify's own
 * classes (`.text-center`, `.rounded`, etc.), and `corePlugins.preflight:false`
 * means Tailwind never resets global element styles (button/input/etc.) that
 * Vuetify pages elsewhere in this same app rely on.
 */
module.exports = {
  prefix: "tw-",
  important: ".wb-root",
  corePlugins: {
    preflight: false,
  },
  darkMode: "class",
  content: [
    "./app/pages/admin/website-builder/**/*.{vue,js,ts}",
    "./app/components/builder/**/*.{vue,js,ts}",
    "./app/components/builder-blocks/**/*.{vue,js,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
