<script setup>
import { computed, onMounted, reactive, watch } from 'vue'
import { useBuilderStore } from '../../stores/builder'

const emit = defineEmits(['theme-changed'])
const builder = useBuilderStore()

const FONT_OPTIONS = ['Inter', 'Poppins', 'Manrope', 'Playfair Display', 'Montserrat', 'Roboto', 'Lora', 'Work Sans']
const DEFAULT_COLORS = { primary: '#6D28D9', secondary: '#6B6478', accent: '#F59E0B', background: '#FAFAFC', text: '#1F2937' }

const form = reactive({
  colors: { ...DEFAULT_COLORS },
  fontHeading: 'Manrope',
  fontBody: 'Inter',
})

// Reflects the website's own saved theme (or the defaults above, matching
// the seeded "Bucksbox Violet" preset, when no theme has been set yet) into
// the editable form - only when the underlying theme actually changes, so
// typing in a color input doesn't get clobbered by this same watcher.
watch(
  () => builder.website?.theme,
  (theme) => {
    form.colors = { ...DEFAULT_COLORS, ...(theme?.colors || {}) }
    form.fontHeading = theme?.fontHeading || 'Manrope'
    form.fontBody = theme?.fontBody || 'Inter'
  },
  { immediate: true }
)

onMounted(async () => {
  if (!builder.themes.length) await builder.fetchThemes()
})

let saveTimer = null
function scheduleSave() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(save, 500)
}

async function save() {
  const theme = await builder.updateTheme({ colors: { ...form.colors }, fontHeading: form.fontHeading, fontBody: form.fontBody })
  emit('theme-changed', theme)
}

async function applyPreset(themeId) {
  const theme = await builder.applyThemePreset(themeId)
  form.colors = { ...DEFAULT_COLORS, ...(theme.colors || {}) }
  form.fontHeading = theme.fontHeading || 'Manrope'
  form.fontBody = theme.fontBody || 'Inter'
  emit('theme-changed', theme)
}

const colorFields = computed(() => [
  { key: 'primary', label: 'Primary (buttons, links)' },
  { key: 'accent', label: 'Accent (tags, dates)' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'background', label: 'Page Background' },
  { key: 'text', label: 'Page Text' },
])
</script>

<template>
  <div class="tw-p-3 tw-h-full tw-overflow-y-auto tw-space-y-6">
    <div>
      <p class="tw-text-xs tw-font-semibold tw-text-slate-500 tw-uppercase tw-mb-2">Presets</p>
      <div class="tw-grid tw-grid-cols-3 tw-gap-2">
        <button
          v-for="theme in builder.themes"
          :key="theme.id"
          type="button"
          class="tw-rounded-lg tw-border tw-border-slate-200 tw-p-2 tw-text-left hover:tw-border-violet-400"
          @click="applyPreset(theme.id)"
        >
          <div class="tw-flex tw-gap-1 tw-mb-1">
            <span class="tw-h-4 tw-w-4 tw-rounded-full tw-border tw-border-black/10" :style="{ background: theme.colors?.primary }" />
            <span class="tw-h-4 tw-w-4 tw-rounded-full tw-border tw-border-black/10" :style="{ background: theme.colors?.accent }" />
          </div>
          <span class="tw-text-[11px] tw-text-slate-600">{{ theme.name }}</span>
        </button>
      </div>
    </div>

    <div>
      <p class="tw-text-xs tw-font-semibold tw-text-slate-500 tw-uppercase tw-mb-2">Colors</p>
      <div v-for="field in colorFields" :key="field.key" class="tw-mb-3">
        <label class="tw-block tw-text-xs tw-font-medium tw-text-slate-500 tw-mb-1">{{ field.label }}</label>
        <div class="tw-flex tw-items-center tw-gap-2">
          <input v-model="form.colors[field.key]" type="color" class="tw-h-8 tw-w-10 tw-rounded tw-border tw-border-slate-300 tw-p-0.5" @change="scheduleSave" />
          <input v-model="form.colors[field.key]" type="text" class="tw-flex-1 tw-rounded-md tw-border tw-border-slate-300 tw-px-2 tw-py-1.5 tw-text-sm" @input="scheduleSave" />
        </div>
      </div>
    </div>

    <div>
      <p class="tw-text-xs tw-font-semibold tw-text-slate-500 tw-uppercase tw-mb-2">Fonts</p>
      <label class="tw-block tw-text-xs tw-font-medium tw-text-slate-500 tw-mb-1">Headings</label>
      <select v-model="form.fontHeading" class="tw-w-full tw-mb-3 tw-rounded-md tw-border tw-border-slate-300 tw-px-2 tw-py-1.5 tw-text-sm" @change="scheduleSave">
        <option v-for="f in FONT_OPTIONS" :key="f" :value="f">{{ f }}</option>
      </select>
      <label class="tw-block tw-text-xs tw-font-medium tw-text-slate-500 tw-mb-1">Body</label>
      <select v-model="form.fontBody" class="tw-w-full tw-rounded-md tw-border tw-border-slate-300 tw-px-2 tw-py-1.5 tw-text-sm" @change="scheduleSave">
        <option v-for="f in FONT_OPTIONS" :key="f" :value="f">{{ f }}</option>
      </select>
    </div>
  </div>
</template>
