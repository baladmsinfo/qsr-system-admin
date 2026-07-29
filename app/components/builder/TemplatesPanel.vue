<script setup>
import { onMounted } from 'vue'
import { useBuilderStore } from '../../stores/builder'
import DynamicRenderer from '../builder-blocks/DynamicRenderer.vue'

const emit = defineEmits(['apply'])
const builder = useBuilderStore()

onMounted(() => {
  if (!builder.templates.length) builder.fetchTemplates()
})

// The preview renders the template's real blocks at their natural (desktop)
// width, then scales the whole thing down to fit a small card - an accurate
// live preview rather than a static generic thumbnail image, with no extra
// server-side rendering infrastructure needed.
const PREVIEW_DESIGN_WIDTH = 1200
const PREVIEW_SCALE = 220 / PREVIEW_DESIGN_WIDTH
</script>

<template>
  <div class="tw-p-3 tw-space-y-3 tw-overflow-y-auto tw-h-full">
    <p class="tw-text-xs tw-text-slate-400">Applying a template replaces the current page's content.</p>
    <button
      v-for="tpl in builder.templates"
      :key="tpl.id"
      class="tw-w-full tw-text-left tw-rounded-lg tw-border tw-border-slate-200 tw-overflow-hidden hover:tw-border-violet-400"
      @click="emit('apply', tpl.id)"
    >
      <div class="tw-h-32 tw-overflow-hidden tw-bg-white tw-pointer-events-none tw-border-b tw-border-slate-100">
        <div
          :style="{ width: `${PREVIEW_DESIGN_WIDTH}px`, transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left' }"
        >
          <DynamicRenderer :blocks="tpl.blocks?.blocks || []" />
        </div>
      </div>
      <div class="tw-p-3">
        <div class="tw-font-medium tw-text-sm tw-text-slate-800">{{ tpl.name }}</div>
        <div class="tw-text-xs tw-text-slate-400">{{ tpl.category }}</div>
      </div>
    </button>
  </div>
</template>
