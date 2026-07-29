<script setup>
import { computed } from 'vue'
import { BLOCK_REGISTRY } from '../builder-blocks/registry'
import { resolveBlockDataSource } from '../builder-blocks/dataSource'
import { useBuilderStore } from '../../stores/builder'

const props = defineProps({
  selected: { type: Object, default: null },
})

const builder = useBuilderStore()

// Only blocks with a matching GlobalComponent key can be made global.
const GLOBAL_KEY_BY_BLOCK_TYPE = {
  Navbar: 'HEADER',
  Footer: 'FOOTER',
  Newsletter: 'NEWSLETTER',
  Contact: 'CONTACT_FORM',
  AnnouncementBar: 'ANNOUNCEMENT_BAR',
  CookieBanner: 'COOKIE_BANNER',
}

const schema = computed(() => (props.selected ? BLOCK_REGISTRY[props.selected.blockType]?.propsSchema || [] : []))

// Shown for every block regardless of type - background is a cross-cutting
// concern (any section can have a custom color/image), not a per-block-type
// prop, so it isn't added to each of the 20 registry propsSchema entries.
const BACKGROUND_FIELDS = [
  { key: 'bgColor', label: 'Background Color', type: 'color' },
  { key: 'bgImage', label: 'Background Image', type: 'image' },
  { key: 'bgOverlayOpacity', label: 'Image Overlay Darkness', type: 'range', min: 0, max: 0.8, step: 0.05 },
]
const globalKeyForType = computed(() => GLOBAL_KEY_BY_BLOCK_TYPE[props.selected?.blockType])

// Only blocks that declare apiSchema (MenuShowcase/OpeningHours/BranchLocator)
// can bind to live data - everything else stays purely static, no change.
const apiSchema = computed(() => (props.selected ? BLOCK_REGISTRY[props.selected.blockType]?.apiSchema : null))
const dataSource = computed(() => props.selected?.blockProps?._dataSource || { mode: 'static' })
const menuCategoryOptions = computed(() => builder.liveData.menuCategories.map((c) => ({ value: c.id, label: c.name })))

let globalSaveTimer = null

function updateField(key, value) {
  if (!props.selected) return
  const updated = { ...props.selected.blockProps, [key]: value }
  props.selected.setProps(updated)

  if (props.selected.isGlobalRef) {
    clearTimeout(globalSaveTimer)
    const { globalKey, blockType } = props.selected
    globalSaveTimer = setTimeout(() => {
      builder.saveGlobalComponent(globalKey, blockType, updated)
    }, 800)
  }
}

// `_dataSource` is a reserved control prop, not real block content, so it's
// handled separately from the generic schema-driven updateField() above -
// changing it needs to immediately re-resolve the block's actual content
// prop (e.g. `categories`) against already-fetched live data, not just wait
// for the next canvas reload.
function updateDataSource(patch) {
  if (!props.selected) return
  const merged = { ...dataSource.value, ...patch }
  const updated = { ...props.selected.blockProps, _dataSource: merged }
  const resolved = resolveBlockDataSource({ type: props.selected.blockType, props: updated }, builder.liveData)
  props.selected.setProps(resolved.props)
}

async function makeGlobal() {
  const key = globalKeyForType.value
  if (!key) return
  await builder.saveGlobalComponent(key, props.selected.blockType, props.selected.blockProps)
  props.selected.makeGlobal(key)
}

function unlinkGlobal() {
  props.selected.unlinkGlobal()
}
</script>

<template>
  <div class="tw-h-full tw-overflow-y-auto tw-p-4">
    <div v-if="!selected" class="tw-text-sm tw-text-slate-400 tw-text-center tw-mt-8">
      Select a block on the canvas to edit its properties.
    </div>
    <div v-else>
      <div class="tw-flex tw-items-center tw-justify-between tw-mb-4">
        <h3 class="tw-text-sm tw-font-semibold tw-text-slate-700">
          {{ BLOCK_REGISTRY[selected.blockType]?.label }}
        </h3>
        <button
          v-if="!selected.isGlobalRef && globalKeyForType"
          class="tw-text-xs tw-font-medium tw-text-violet-700 hover:tw-text-violet-900"
          @click="makeGlobal"
        >
          Make Global
        </button>
      </div>

      <div v-if="selected.isGlobalRef" class="tw-mb-4 tw-rounded-lg tw-bg-amber-50 tw-border tw-border-amber-200 tw-p-3 tw-text-xs tw-text-amber-800">
        <p class="tw-font-medium">Global Component</p>
        <p class="tw-mt-1">Edits here apply to every page using this {{ BLOCK_REGISTRY[selected.blockType]?.label }}.</p>
        <button class="tw-mt-2 tw-font-medium tw-text-amber-900 hover:tw-underline" @click="unlinkGlobal">
          Unlink (make page-only)
        </button>
      </div>

      <PropField
        v-for="field in schema"
        :key="field.key"
        :field="field"
        :model-value="selected.blockProps[field.key]"
        @update:model-value="updateField(field.key, $event)"
      />

      <div v-if="apiSchema" class="tw-mt-2 tw-pt-4 tw-border-t tw-border-slate-100">
        <p class="tw-text-xs tw-font-semibold tw-text-slate-500 tw-uppercase tw-mb-2">Data Source</p>
        <label class="tw-block tw-text-xs tw-font-medium tw-text-slate-500 tw-mb-1">Mode</label>
        <select
          :value="dataSource.mode"
          class="tw-w-full tw-mb-3 tw-rounded-md tw-border tw-border-slate-300 tw-px-2 tw-py-1.5 tw-text-sm"
          @change="updateDataSource({ mode: $event.target.value })"
        >
          <option value="static">Static (manually entered)</option>
          <option value="dynamic">Dynamic (live from menu)</option>
        </select>
        <template v-if="dataSource.mode === 'dynamic' && apiSchema.source === 'menu'">
          <label class="tw-block tw-text-xs tw-font-medium tw-text-slate-500 tw-mb-1">Menu Category</label>
          <select
            :value="dataSource.categoryId || ''"
            class="tw-w-full tw-rounded-md tw-border tw-border-slate-300 tw-px-2 tw-py-1.5 tw-text-sm"
            @change="updateDataSource({ categoryId: $event.target.value || undefined })"
          >
            <option value="">All categories</option>
            <option v-for="opt in menuCategoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <p v-if="!menuCategoryOptions.length" class="tw-mt-1 tw-text-xs tw-text-amber-600">
            No menu items found for this branch yet.
          </p>
        </template>
        <p v-if="dataSource.mode === 'dynamic'" class="tw-mt-2 tw-text-xs tw-text-slate-400">
          Content below is read-only preview of live data - edit it from Menu Management.
        </p>
      </div>

      <div class="tw-mt-2 tw-pt-4 tw-border-t tw-border-slate-100">
        <p class="tw-text-xs tw-font-semibold tw-text-slate-500 tw-uppercase tw-mb-2">Background</p>
        <PropField
          v-for="field in BACKGROUND_FIELDS"
          :key="field.key"
          :field="field"
          :model-value="selected.blockProps[field.key]"
          @update:model-value="updateField(field.key, $event)"
        />
      </div>
    </div>
  </div>
</template>
