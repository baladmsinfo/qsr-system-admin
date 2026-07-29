<script setup>
import { onBeforeUnmount, ref } from "vue";
import { createBuilderEditor } from "./grapesEditor";
import "grapesjs/dist/css/grapes.min.css";

// Initialization is driven explicitly by the parent (via `init()`, called
// from the page's onMounted) instead of this component's own onMounted -
// GrapesJS's blockManager/layerManager need real, already-mounted DOM
// elements owned by the sibling LeftSidebar component, and sibling mount
// order/Teleport-target timing across components isn't reliable enough to
// depend on (confirmed: Teleport to a sibling-owned id intermittently fails
// with "Failed to locate Teleport target"). The parent waits for both
// children to mount, then hands their real elements to us directly.
const emit = defineEmits(["change", "select"]);

const canvasEl = ref(null);

let bridge = null;
let resizeObserver = null;

function syncCanvasSize() {
  const wrapper = canvasEl.value?.parentElement;
  if (!wrapper) return;
  canvasEl.value.style.width = `${wrapper.clientWidth}px`;
  canvasEl.value.style.height = `${wrapper.clientHeight}px`;
}

function init(blocksPanelEl, layersPanelEl) {
  syncCanvasSize();

  bridge = createBuilderEditor({
    container: canvasEl.value,
    blocksPanelEl,
    layersPanelEl,
  });

  resizeObserver = new ResizeObserver(syncCanvasSize);
  resizeObserver.observe(canvasEl.value.parentElement);

  bridge.onChange(() => emit("change", bridge.exportBlocks()));
  bridge.onSelect((component) => {
    if (!component) return emit("select", null);
    emit("select", {
      id: component.cid,
      blockType: component.get("blockType"),
      blockProps: component.get("blockProps"),
      isGlobalRef: component.get("isGlobalRef"),
      globalKey: component.get("globalKey"),
      setProps: (props) => component.set("blockProps", { ...props }),
      // GrapesJS only fires "component:update:blockProps" for prop changes -
      // isGlobalRef/globalKey changes don't match any event onChange listens
      // for, so the page-level autosave never ran and the page's own stored
      // block never actually flipped into/out of being a GlobalComponentRef.
      // Trigger the save explicitly instead of relying on GrapesJS's events.
      makeGlobal: (key) => {
        component.set({ isGlobalRef: true, globalKey: key });
        emit("change", bridge.exportBlocks());
      },
      unlinkGlobal: () => {
        component.set({ isGlobalRef: false, globalKey: null });
        emit("change", bridge.exportBlocks());
      },
    });
  });
}

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  bridge?.destroy();
});

defineExpose({
  init,
  loadBlocks: (blocks, globalContext) => bridge?.loadBlocks(blocks, globalContext),
  exportBlocks: () => bridge?.exportBlocks(),
  addBlock: (type) => bridge?.addBlock(type),
  setDevice: (name) => bridge?.setDevice(name),
  undo: () => bridge?.undo(),
  redo: () => bridge?.redo(),
  applyTheme: (theme) => bridge?.applyTheme(theme),
});
</script>

<template>
  <div ref="canvasEl" class="tw-overflow-hidden" />
</template>
