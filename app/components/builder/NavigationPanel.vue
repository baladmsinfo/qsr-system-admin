<script setup>
import { onMounted, ref } from 'vue'
import { useNavigationStore } from '../../stores/navigation'
import { useBuilderStore } from '../../stores/builder'

const nav = useNavigationStore()
const builder = useBuilderStore()
let saveTimer = null

onMounted(async () => {
  if (!builder.pages.length) await builder.fetchPages()
  if (!nav.navigation) await nav.fetchNavigation()
})

function scheduleSave() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    if (!nav.navigation) return
    const { style, sticky, transparent, showSearch, showSocial, ctaButton, items } = nav.navigation
    nav.saveNavigation({ style, sticky, transparent, showSearch, showSocial, ctaButton, items })
  }, 800)
}

function patchSettings(fields) {
  nav.navigation = { ...nav.navigation, ...fields }
  scheduleSave()
}

function addRootItem() {
  const items = [...(nav.navigation.items || []), { id: `${Date.now()}`, linkType: 'page', pageId: builder.pages[0]?.id || '' }]
  patchSettings({ items })
}

function updateRootItem(index, updated) {
  const items = [...nav.navigation.items]
  items[index] = updated
  patchSettings({ items })
}

function removeRootItem(index) {
  const items = [...nav.navigation.items]
  items.splice(index, 1)
  patchSettings({ items })
}

function toggleCta(enabled) {
  patchSettings({ ctaButton: enabled ? { label: 'Get Started', link: '#' } : null })
}
</script>

<template>
  <div v-if="nav.navigation" class="tw-p-3 tw-h-full tw-overflow-y-auto tw-space-y-4">
    <div>
      <p class="tw-text-xs tw-font-semibold tw-text-slate-500 tw-uppercase tw-mb-2">Style</p>
      <select
        :value="nav.navigation.style"
        class="tw-w-full tw-rounded tw-border tw-border-slate-300 tw-text-sm tw-py-1.5 tw-mb-2"
        @change="patchSettings({ style: $event.target.value })"
      >
        <option value="horizontal">Horizontal</option>
        <option value="vertical">Vertical</option>
        <option value="mega">Mega Menu</option>
      </select>
      <label class="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-slate-600 tw-mb-1">
        <input type="checkbox" :checked="nav.navigation.sticky" @change="patchSettings({ sticky: $event.target.checked })" /> Sticky header
      </label>
      <label class="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-slate-600 tw-mb-1">
        <input type="checkbox" :checked="nav.navigation.transparent" @change="patchSettings({ transparent: $event.target.checked })" /> Transparent header
      </label>
      <label class="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-slate-600 tw-mb-1">
        <input type="checkbox" :checked="nav.navigation.showSearch" @change="patchSettings({ showSearch: $event.target.checked })" /> Show search icon
      </label>
      <label class="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-slate-600 tw-mb-1">
        <input type="checkbox" :checked="nav.navigation.showSocial" @change="patchSettings({ showSocial: $event.target.checked })" /> Show social icons
      </label>
      <label class="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-slate-600">
        <input type="checkbox" :checked="!!nav.navigation.ctaButton" @change="toggleCta($event.target.checked)" /> CTA button
      </label>
      <div v-if="nav.navigation.ctaButton" class="tw-mt-2 tw-space-y-1">
        <input
          :value="nav.navigation.ctaButton.label"
          placeholder="Button label"
          class="tw-w-full tw-rounded tw-border tw-border-slate-300 tw-text-xs tw-px-2 tw-py-1"
          @input="patchSettings({ ctaButton: { ...nav.navigation.ctaButton, label: $event.target.value } })"
        />
        <input
          :value="nav.navigation.ctaButton.link"
          placeholder="Button link"
          class="tw-w-full tw-rounded tw-border tw-border-slate-300 tw-text-xs tw-px-2 tw-py-1"
          @input="patchSettings({ ctaButton: { ...nav.navigation.ctaButton, link: $event.target.value } })"
        />
      </div>
    </div>

    <div>
      <p class="tw-text-xs tw-font-semibold tw-text-slate-500 tw-uppercase tw-mb-2">Menu Items</p>
      <NavItemEditor
        v-for="(item, i) in nav.navigation.items"
        :key="item.id"
        :item="item"
        :pages="builder.pages"
        :depth="1"
        @update:item="updateRootItem(i, $event)"
        @remove="removeRootItem(i)"
      />
      <button
        class="tw-w-full tw-rounded-lg tw-border tw-border-dashed tw-border-slate-300 tw-p-2 tw-text-xs tw-text-slate-500 hover:tw-border-violet-400"
        @click="addRootItem"
      >
        + Menu Item
      </button>
    </div>

    <p class="tw-text-xs tw-text-slate-400">{{ nav.saving ? 'Saving…' : 'Changes save automatically.' }}</p>
  </div>
</template>
