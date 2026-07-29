import { createApp, h } from "vue";
import { BLOCK_REGISTRY } from "../builder-blocks/registry";

// Mounts a block's real Vue SFC off-screen and reads back the rendered HTML.
// Used to preview blocks inside the GrapesJS canvas iframe (which has no Vue
// runtime of its own) without maintaining a second HTML-template per block -
// the SFC in builder-blocks/ stays the single source of truth, also used
// directly (via <component :is>) by DynamicRenderer for the live/preview site.
export function renderBlockToHtml(type, props) {
  const def = BLOCK_REGISTRY[type];
  if (!def) return `<div style="padding:24px;color:#b91c1c">Unknown block: ${type}</div>`;

  const host = document.createElement("div");
  const app = createApp({ render: () => h(def.component, props) });
  app.mount(host);
  const html = host.innerHTML;
  app.unmount();
  return html;
}
