import grapesjs from "grapesjs";
import builderCss from "../../assets/builder.css?inline";
import { BLOCK_REGISTRY, BLOCK_TYPES, createBlock } from "../builder-blocks/registry";
import { renderBlockToHtml } from "./renderBlockToHtml";
import { buildThemeStyleString, googleFontsHref } from "./themeStyle";
import { resolveBlockDataSource } from "../builder-blocks/dataSource";

const DEVICES = [
  { id: "Desktop", name: "Desktop", width: "" },
  { id: "Tablet", name: "Tablet", width: "768px", widthMedia: "992px" },
  { id: "Mobile", name: "Mobile", width: "375px", widthMedia: "480px" },
];

// One custom GrapesJS component type ("qsr-block") shared by every block -
// its `blockType`/`blockProps` model attributes are the single generic
// mechanism the Right Sidebar Properties panel and the save/export step both
// read from, instead of one bespoke GrapesJS component per block.
function registerBlockComponentType(editor) {
  editor.DomComponents.addType("qsr-block", {
    model: {
      defaults: {
        tagName: "div",
        draggable: true,
        droppable: false,
        removable: true,
        copyable: true,
        editable: false,
        highlightable: true,
        resizable: { tl: 0, tc: 0, tr: 0, cl: 0, cr: 0, bl: 0, br: 0 },
        blockType: "",
        blockProps: {},
        // When true, this instance is a GlobalComponentRef - blockProps came
        // from (and edits are saved back to) GlobalComponent, not this page's
        // own draftBlocks. See exportBlocks()/PropertiesPanel.vue.
        isGlobalRef: false,
        globalKey: null,
      },
      init() {
        this.on("change:blockProps change:blockType", this.renderBlock);
      },
      renderBlock() {
        const view = this.view;
        if (view) view.renderContent();
      },
    },
    view: {
      onRender() {
        this.renderContent();
      },
      renderContent() {
        const { blockType, blockProps } = this.model.attributes;
        this.el.innerHTML = renderBlockToHtml(blockType, blockProps);
      },
    },
  });
}

// Recursively preserves nested children (Navigation.items is stored as a
// real 3-level tree, resolved server-side already - see
// routes/builder.js's withResolvedLabels) instead of flattening to a single
// level, which is the actual bug this Navbar upgrade fixes.
function mapNavItems(items) {
  return (items || []).map((item) => ({
    label: item.resolvedLabel ?? item.label,
    href: item.resolvedHref ?? item.url,
    children: item.children?.length ? mapNavItems(item.children) : undefined,
  }));
}

function mergeHeaderProps(sourceProps, globalContext) {
  const nav = globalContext?.navigation;
  if (!nav) return sourceProps;
  return {
    ...sourceProps,
    links: mapNavItems(nav.items),
    style: nav.style,
    sticky: nav.sticky,
    transparent: nav.transparent,
  };
}

function registerBlocks(editor) {
  for (const type of BLOCK_TYPES) {
    const def = BLOCK_REGISTRY[type];
    editor.BlockManager.add(type, {
      label: `<div style="text-align:center"><i class="${def.icon}" style="font-size:20px"></i><div style="font-size:11px;margin-top:4px">${def.label}</div></div>`,
      category: def.category || "Common",
      content: { type: "qsr-block", blockType: type, blockProps: def.defaultProps },
    });
  }
}

// container: element to mount the GrapesJS editor UI into.
// blocksPanelEl / layersPanelEl: elements GrapesJS renders its Block/Layer UI into.
export function createBuilderEditor({ container, blocksPanelEl, layersPanelEl }) {
  const editor = grapesjs.init({
    container,
    fromElement: false,
    height: "100%",
    width: "100%",
    storageManager: false,
    dragMode: "translate",
    blockManager: { appendTo: blocksPanelEl },
    layerManager: { appendTo: layersPanelEl },
    deviceManager: { devices: DEVICES },
    panels: { defaults: [] },
    canvas: { styles: [] },
  });

  registerBlockComponentType(editor);
  registerBlocks(editor);

// Cached across the "load" event boundary: the page may call applyTheme()
  // (after its own async fetchWebsite() resolves) before or after GrapesJS's
  // canvas iframe has actually finished loading - whichever happens last
  // does the real write, so theme application never silently no-ops.
  let pendingTheme;
  let canvasLoaded = false;

  // Tailwind (builder-scoped) CSS has to be injected into the canvas iframe's
  // own document - it has no relation to the host page's stylesheet.
  editor.on("load", () => {
    const doc = editor.Canvas.getDocument();
    const style = doc.createElement("style");
    style.textContent = builderCss;
    doc.head.appendChild(style);
    doc.body.classList.add("wb-root");
    canvasLoaded = true;
    if (pendingTheme !== undefined) applyTheme(pendingTheme);
  });

  // Site theme CSS variables (primary/accent/fonts) - every block's
  // tw-bg-[var(--theme-primary,...)] classes resolve against whatever this
  // writes to :root inside the canvas iframe doc. Called once after the
  // website loads and again whenever the Theme panel saves, so canvas
  // preview updates live without a reload.
  function applyTheme(theme) {
    pendingTheme = theme;
    if (!canvasLoaded) return;
    const doc = editor.Canvas.getDocument();
    if (!doc) return;
    let styleTag = doc.getElementById("theme-vars");
    if (!styleTag) {
      styleTag = doc.createElement("style");
      styleTag.id = "theme-vars";
      doc.head.appendChild(styleTag);
    }
    styleTag.textContent = `:root{${buildThemeStyleString(theme)}}`;

    const fontHref = googleFontsHref(theme);
    let fontLink = doc.getElementById("theme-font-link");
    if (fontHref) {
      if (!fontLink) {
        fontLink = doc.createElement("link");
        fontLink.id = "theme-font-link";
        fontLink.rel = "stylesheet";
        doc.head.appendChild(fontLink);
      }
      fontLink.href = fontHref;
    } else if (fontLink) {
      fontLink.remove();
    }
  }

  // setComponents/append below fire the same component:add/remove events as
  // real user edits - without these guards, any onChange firing before a real
  // loadBlocks() call has completed (including with zero blocks, e.g. while
  // data hasn't arrived yet, or a dev-mode HMR remount that skipped it) would
  // trigger the autosave in Canvas.vue's onChange and silently overwrite the
  // page's real draft content. `hasLoadedOnce` additionally blocks onChange
  // until a real loadBlocks() has actually completed at least once on THIS
  // editor instance - not just "not mid-load right now".
  let isLoadingBlocks = false;
  let hasLoadedOnce = false;

  // `globalContext` (optional): { componentsByKey: Map<key, {blockType, props}>,
  // navigationLinks: [{label, href}] }. A "GlobalComponentRef" block entry
  // resolves to the referenced GlobalComponent's current blockType/props (with
  // HEADER additionally getting live Navigation links merged in) rather than
  // storing its own copy - editing it anywhere updates every page that
  // references the same key. See PropertiesPanel.vue for the edit-time save path.
  function loadBlocks(blocks, globalContext) {
    isLoadingBlocks = true;
    editor.setComponents([]);
    for (const rawBlock of blocks || []) {
      // Dynamic-mode blocks (MenuShowcase/OpeningHours/BranchLocator) get
      // their real content-bearing prop resolved from already-fetched live
      // data (globalContext.liveData) here, before the block is ever
      // instantiated - the block's own render stays a pure function of
      // props, same as every other block; static-mode blocks pass through
      // completely unchanged.
      const block = resolveBlockDataSource(rawBlock, globalContext?.liveData);
      if (block.type === "GlobalComponentRef") {
        const source = globalContext?.componentsByKey?.get(block.key);
        if (!source) continue; // not configured yet - nothing to render
        const props = block.key === "HEADER" ? mergeHeaderProps(source.props, globalContext) : source.props;
        editor.getWrapper().append({
          type: "qsr-block",
          blockType: source.blockType,
          blockProps: props,
          isGlobalRef: true,
          globalKey: block.key,
        });
        continue;
      }
      editor.getWrapper().append({
        type: "qsr-block",
        blockType: block.type,
        blockProps: block.props,
      });
    }
    isLoadingBlocks = false;
    hasLoadedOnce = true;
  }

  function exportBlocks() {
    return editor
      .getWrapper()
      .components()
      .map((c) =>
        c.get("isGlobalRef")
          ? { type: "GlobalComponentRef", key: c.get("globalKey") }
          : { type: c.get("blockType"), props: c.get("blockProps") }
      );
  }

  function addBlock(type) {
    const block = createBlock(type);
    editor.getWrapper().append({ type: "qsr-block", blockType: block.type, blockProps: block.props });
  }

  function onChange(cb) {
    editor.on("component:add component:remove component:update component:update:blockProps", () => {
      if (isLoadingBlocks || !hasLoadedOnce) return;
      cb();
    });
  }

  function onSelect(cb) {
    editor.on("component:selected", (component) => cb(component));
    editor.on("component:deselected", () => cb(null));
  }

  function setDevice(name) {
    editor.setDevice(name);
  }

  function undo() {
    editor.UndoManager.undo();
  }

  function redo() {
    editor.UndoManager.redo();
  }

  function destroy() {
    editor.destroy();
  }

  return { editor, loadBlocks, exportBlocks, addBlock, onChange, onSelect, setDevice, undo, redo, destroy, applyTheme };
}
