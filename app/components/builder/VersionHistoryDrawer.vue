<script setup>
import { useBuilderStore } from '../../stores/builder'

const props = defineProps({
  open: { type: Boolean, default: false },
  pageId: { type: String, default: null },
})
const emit = defineEmits(['close', 'restored'])
const builder = useBuilderStore()

async function restore(versionId) {
  await builder.restoreVersion(props.pageId, versionId)
  emit('restored')
  emit('close')
}

function fmt(date) {
  return new Date(date).toLocaleString()
}
</script>

<template>
  <div v-if="open" class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-justify-end">
    <div class="tw-absolute tw-inset-0 tw-bg-black/30" @click="emit('close')" />
    <div class="tw-relative tw-w-80 tw-h-full tw-bg-white tw-shadow-xl tw-p-4 tw-overflow-y-auto">
      <div class="tw-flex tw-items-center tw-justify-between tw-mb-4">
        <h3 class="tw-font-semibold tw-text-slate-800">Version History</h3>
        <button class="tw-text-slate-400 hover:tw-text-slate-700" @click="emit('close')">✕</button>
      </div>
      <div v-if="!builder.versions.length" class="tw-text-sm tw-text-slate-400">No versions yet.</div>
      <div v-for="version in builder.versions" :key="version.id" class="tw-flex tw-items-center tw-justify-between tw-py-2 tw-border-b tw-border-slate-100">
        <div>
          <div class="tw-text-sm tw-font-medium tw-text-slate-700">{{ version.label || 'Snapshot' }}</div>
          <div class="tw-text-xs tw-text-slate-400">{{ fmt(version.createdAt) }}</div>
        </div>
        <button class="tw-text-xs tw-font-medium tw-text-violet-700 hover:tw-text-violet-900" @click="restore(version.id)">
          Restore
        </button>
      </div>
    </div>
  </div>
</template>
