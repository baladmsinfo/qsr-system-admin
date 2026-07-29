// Site theme CSS custom properties - shared by grapesEditor.js (injected into
// the GrapesJS canvas iframe doc) and ThemePanel.vue (font picker list).
// Mirrors qsr-system-backend/src/utils/blockStyle.js's buildThemeStyle/
// googleFontsHref/GOOGLE_FONTS exactly, and qsr-system-frondend's copy used
// by DynamicRenderer.vue - same "copy both ways" convention as the blocks.

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function darkenHex(hex, amount) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return hex;
  const num = parseInt(m[1], 16);
  const factor = 1 - clamp(amount, 0, 100) / 100;
  const r = clamp(Math.round(((num >> 16) & 0xff) * factor), 0, 255);
  const g = clamp(Math.round(((num >> 8) & 0xff) * factor), 0, 255);
  const b = clamp(Math.round((num & 0xff) * factor), 0, 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// Falls back to the seeded "Bucksbox Violet" preset's exact values when no
// theme is set, so a site/canvas with no theme renders unchanged.
export function buildThemeVars(theme) {
  const colors = theme?.colors || {};
  const primary = colors.primary || "#6D28D9";
  const accent = colors.accent || "#F59E0B";
  const background = colors.background || "#FAFAFC";
  const text = colors.text || "#1F2937";
  const fontHeading = theme?.fontHeading || "Manrope";
  const fontBody = theme?.fontBody || "Inter";
  return {
    "--theme-primary": primary,
    "--theme-primary-hover": darkenHex(primary, 12),
    "--theme-accent": accent,
    "--theme-background": background,
    "--theme-text": text,
    "--theme-font-heading": `'${fontHeading}'`,
    "--theme-font-body": `'${fontBody}'`,
  };
}

export function buildThemeStyleString(theme) {
  const vars = buildThemeVars(theme);
  return Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
}

export const GOOGLE_FONTS = {
  Inter: "Inter:wght@400;500;600;700",
  Poppins: "Poppins:wght@400;500;600;700",
  Manrope: "Manrope:wght@400;500;600;700",
  "Playfair Display": "Playfair+Display:wght@400;600;700",
  Montserrat: "Montserrat:wght@400;500;600;700",
  Roboto: "Roboto:wght@400;500;700",
  Lora: "Lora:wght@400;500;600;700",
  "Work Sans": "Work+Sans:wght@400;500;600;700",
};

export function googleFontsHref(theme) {
  const families = [...new Set([theme?.fontHeading, theme?.fontBody].filter((f) => f && GOOGLE_FONTS[f]))];
  if (!families.length) return null;
  const familyParams = families.map((f) => `family=${GOOGLE_FONTS[f]}`).join("&");
  return `https://fonts.googleapis.com/css2?${familyParams}&display=swap`;
}
