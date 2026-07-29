// Per-block background override, shared by every block component's root tag
// (:style="blockBackgroundStyle(props)"). Kept in sync byte-for-byte with
// qsr-system-frondend's copy (same "copy both ways" convention as the block
// SFCs themselves) and mirrored in qsr-system-backend/src/utils/blockStyle.js
// for the static site generator's plain-JS render path.
//
// Returns a CSS string (Vue's :style binding accepts a raw string, not just
// an object) - wins over the block's own Tailwind bg-* class via inline-style
// specificity, so no existing class needs to change. The overlay (bgImage +
// bgOverlayOpacity both set) is a solid-color gradient stacked on top of the
// image in the same background-image value - no extra wrapper element
// needed to darken an image for text legibility.
export function blockBackgroundStyle(props) {
  const { bgColor, bgImage, bgOverlayOpacity } = props || {};
  if (!bgColor && !bgImage) return "";
  const parts = [];
  if (bgColor) parts.push(`background-color:${bgColor}`);
  if (bgImage) {
    const opacity = bgOverlayOpacity ? Number(bgOverlayOpacity) : 0;
    const overlay = opacity > 0 ? `linear-gradient(rgba(0,0,0,${opacity}),rgba(0,0,0,${opacity})),` : "";
    parts.push(`background-image:${overlay}url('${bgImage}')`, "background-size:cover", "background-position:center");
  }
  return parts.join(";");
}
