<template>
  <div class="designer-root">
    <!-- Toolbar -->
    <v-toolbar flat density="comfortable" class="designer-toolbar">
      <v-btn icon="mdi-arrow-left" variant="text" :to="'/admin/receipt-templates'" />
      <v-text-field
        v-model="store.meta.name"
        placeholder="Template name"
        density="compact"
        hide-details
        variant="outlined"
        style="max-width: 220px"
        class="mx-2"
      />
      <v-select
        v-model="store.meta.type"
        :items="['RECEIPT', 'KOT', 'INVOICE']"
        density="compact"
        hide-details
        variant="outlined"
        style="max-width: 130px"
      />
      <v-switch v-model="store.meta.isDefault" label="Default" density="compact" hide-details class="mx-3" color="primary" />

      <v-spacer />

      <v-btn icon="mdi-undo" variant="text" :disabled="!store.canUndo" @click="store.undo" title="Undo" />
      <v-btn icon="mdi-redo" variant="text" :disabled="!store.canRedo" @click="store.redo" title="Redo" />
      <v-divider vertical class="mx-2" />
      <v-btn icon="mdi-magnify-minus-outline" variant="text" @click="store.setZoom(store.zoom - 0.1)" title="Zoom out" />
      <span class="text-caption mx-1" style="min-width: 40px; text-align: center">{{ Math.round(store.zoom * 100) }}%</span>
      <v-btn icon="mdi-magnify-plus-outline" variant="text" @click="store.setZoom(store.zoom + 0.1)" title="Zoom in" />
      <v-divider vertical class="mx-2" />
      <v-btn color="primary" prepend-icon="mdi-content-save" :loading="store.saving" @click="save">Save</v-btn>
    </v-toolbar>

    <div class="designer-body">
      <!-- Block Library ("Navigation Drawer" panel - implemented as a plain
           Vuetify sheet/list rather than <v-navigation-drawer> so it doesn't
           compete with the app's own persistent left SideNav, which already
           occupies that side of the layout. -->
      <v-sheet class="designer-col designer-library" elevation="1">
        <div class="pa-3 text-subtitle-2 font-weight-bold">Blocks</div>
        <v-divider />
        <div v-for="category in BLOCK_CATEGORIES" :key="category">
          <v-list-subheader>{{ category }}</v-list-subheader>
          <v-list density="compact" nav>
            <v-list-item
              v-for="type in typesByCategory[category]"
              :key="type"
              :prepend-icon="BLOCK_META[type].icon"
              :title="BLOCK_META[type].label"
              @click="store.addBlock(type)"
            />
          </v-list>
        </div>
      </v-sheet>

      <!-- Canvas -->
      <div class="designer-col designer-canvas-wrap">
        <div class="canvas-scroll">
          <div class="canvas-paper" :style="{ width: paperWidthPx + 'px', transform: `scale(${store.zoom})` }">
            <v-alert v-if="!store.blocks.length" type="info" variant="tonal" density="compact">
              No blocks yet - click a block on the left to add it.
            </v-alert>

            <div
              v-for="(block, index) in store.blocks"
              :key="block.id"
              class="canvas-block"
              :class="{ selected: store.selectedId === block.id, hidden: block.hidden, locked: block.locked }"
              draggable="true"
              @click="store.selectBlock(block.id)"
              @dragstart="onDragStart(index)"
              @dragover.prevent
              @drop="onDrop(index)"
            >
              <div class="canvas-block-header">
                <v-icon size="16" class="me-1">{{ BLOCK_META[block.type]?.icon }}</v-icon>
                <span class="text-caption font-weight-medium">{{ BLOCK_META[block.type]?.label || block.type }}</span>
                <v-spacer />
                <v-btn icon="mdi-content-copy" size="x-small" variant="text" @click.stop="store.duplicateBlock(block.id)" title="Duplicate" />
                <v-btn
                  :icon="block.hidden ? 'mdi-eye-off' : 'mdi-eye'"
                  size="x-small"
                  variant="text"
                  @click.stop="store.toggleHidden(block.id)"
                  title="Hide/Show"
                />
                <v-btn
                  :icon="block.locked ? 'mdi-lock' : 'mdi-lock-open-outline'"
                  size="x-small"
                  variant="text"
                  @click.stop="store.toggleLocked(block.id)"
                  title="Lock/Unlock"
                />
                <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click.stop="store.removeBlock(block.id)" title="Delete" />
              </div>
              <div class="canvas-block-body text-caption text-medium-emphasis">
                {{ blockSummary(block) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Properties / Live Preview -->
      <v-navigation-drawer permanent location="right" width="380" class="designer-right">
        <v-tabs v-model="rightTab" density="compact" grow>
          <v-tab value="properties">Properties</v-tab>
          <v-tab value="preview">Live Preview</v-tab>
        </v-tabs>
        <v-divider />

        <v-window v-model="rightTab" class="designer-right-window">
          <v-window-item value="properties">
            <div v-if="store.selectedBlock" class="pa-4">
              <BlockPropertiesForm :block="store.selectedBlock" @update="(patch) => store.updateBlockProps(store.selectedBlock.id, patch)" />
            </div>
            <div v-else class="pa-8 text-center text-medium-emphasis text-body-2">
              Select a block on the canvas to edit its properties.
            </div>
          </v-window-item>

          <v-window-item value="preview">
            <div v-if="store.previewLoading" class="d-flex justify-center pa-6"><v-progress-circular indeterminate /></div>
            <v-alert v-else-if="store.previewError" type="error" density="compact" variant="tonal" class="ma-3">{{ store.previewError }}</v-alert>
            <iframe v-else :srcdoc="store.previewHtml" class="preview-frame" />
          </v-window-item>
        </v-window>
      </v-navigation-drawer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDesignerStore } from '@/stores/designer'
import { useReceiptTemplateStore } from '@/stores/receiptTemplates'
import { BLOCK_META, BLOCK_CATEGORIES, BLOCK_TYPES } from '@/composables/receiptBlocks'
import BlockPropertiesForm from '@/components/BlockPropertiesForm.vue'

definePageMeta({
  layout: 'sidenav',
})

const route = useRoute()
const router = useRouter()
const store = useDesignerStore()
const templateStore = useReceiptTemplateStore()

const rightTab = ref('properties')
let dragFromIndex = null

const typesByCategory = computed(() => {
  const map = {}
  for (const cat of BLOCK_CATEGORIES) map[cat] = BLOCK_TYPES.filter((t) => BLOCK_META[t].category === cat)
  return map
})

const paperWidthPx = computed(() => 320) // ~80mm receipt at screen scale, before zoom transform

function blockSummary(block) {
  const props = block.props || {}
  if (props.text) return props.text
  if (props.data) return `Data: ${props.data}`
  if (props.code) return `Code: ${props.code}`
  return ''
}

function onDragStart(index) {
  dragFromIndex = index
}

function onDrop(index) {
  if (dragFromIndex == null) return
  store.reorder(dragFromIndex, index)
  dragFromIndex = null
}

async function save() {
  try {
    await store.save()
    router.push('/admin/receipt-templates')
  } catch (err) {
    alert(err.message || 'Failed to save template')
  }
}

onMounted(async () => {
  const id = route.query.id
  if (id) {
    const template = await templateStore.fetchTemplate(id)
    store.loadTemplate(template)
  } else {
    store.loadBlank(route.query.type || 'RECEIPT')
  }
})
</script>

<style scoped>
.designer-root {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 16px);
}
.designer-toolbar {
  flex-shrink: 0;
}
.designer-body {
  display: flex;
  flex: 1;
  min-height: 0;
}
.designer-col {
  height: 100%;
  overflow-y: auto;
}
.designer-library {
  width: 240px;
  flex-shrink: 0;
}
.designer-canvas-wrap {
  flex: 1;
  background: #e8e8ec;
}
.canvas-scroll {
  padding: 24px;
  display: flex;
  justify-content: center;
}
.canvas-paper {
  background: #fff;
  transform-origin: top center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 12px;
  min-height: 300px;
}
.canvas-block {
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 6px 8px;
  margin-bottom: 4px;
  cursor: grab;
}
.canvas-block:hover {
  background: #f5f5f7;
}
.canvas-block.selected {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.06);
}
.canvas-block.hidden {
  opacity: 0.4;
}
.canvas-block.locked {
  cursor: not-allowed;
}
.canvas-block-header {
  display: flex;
  align-items: center;
}
.designer-right-window {
  height: calc(100% - 48px);
  overflow-y: auto;
}
.preview-frame {
  width: 100%;
  height: 100%;
  min-height: 600px;
  border: 0;
}
</style>
