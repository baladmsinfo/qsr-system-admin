<script setup>
import { ref } from 'vue'

const emit = defineEmits(['apply-template', 'select-page', 'theme-changed'])
const tabs = [
  { key: 'blocks', label: 'Blocks', icon: 'mdi-view-grid-plus' },
  { key: 'pages', label: 'Pages', icon: 'mdi-file-multiple-outline' },
  { key: 'navigation', label: 'Nav', icon: 'mdi-menu' },
  { key: 'templates', label: 'Templates', icon: 'mdi-view-dashboard' },
  { key: 'assets', label: 'Assets', icon: 'mdi-image-multiple' },
  { key: 'layers', label: 'Layers', icon: 'mdi-layers' },
  { key: 'theme', label: 'Theme', icon: 'mdi-palette' },
  { key: 'publish', label: 'Publish', icon: 'mdi-cloud-upload-outline' },
]
const active = ref('blocks')

// Handed to Canvas.init() by the parent page once both components have
// mounted - see the comment in Canvas.vue for why this isn't a Teleport.
const blocksTargetEl = ref(null)
const layersTargetEl = ref(null)

defineExpose({ blocksTargetEl, layersTargetEl, active })
</script>

<template>
  <div class="tw-w-64 tw-h-full tw-flex tw-flex-col tw-border-r tw-border-slate-200 tw-bg-white">
    <div class="tw-grid tw-grid-cols-3 tw-border-b tw-border-slate-200">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tw-flex tw-flex-col tw-items-center tw-gap-1 tw-py-2 tw-text-[11px]"
        :class="active === tab.key ? 'tw-text-violet-700 tw-border-b-2 tw-border-violet-700' : 'tw-text-slate-400'"
        @click="active = tab.key"
      >
        <i :class="tab.icon" class="tw-text-lg" />
        {{ tab.label }}
      </button>
    </div>

    <div class="tw-flex-1 tw-min-h-0">
      <div v-show="active === 'blocks'" ref="blocksTargetEl" class="tw-h-full tw-overflow-y-auto tw-p-2" />
      <PagesPanel v-show="active === 'pages'" @select="emit('select-page', $event)" />
      <NavigationPanel v-show="active === 'navigation'" />
      <TemplatesPanel v-show="active === 'templates'" @apply="emit('apply-template', $event)" />
      <AssetsPanel v-show="active === 'assets'" />
      <div v-show="active === 'layers'" ref="layersTargetEl" class="tw-h-full tw-overflow-y-auto" />
      <ThemePanel v-show="active === 'theme'" @theme-changed="emit('theme-changed', $event)" />
      <PublishPanel v-show="active === 'publish'" />
    </div>
  </div>
</template>
