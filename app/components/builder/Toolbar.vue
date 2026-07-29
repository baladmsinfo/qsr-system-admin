<script setup>
defineProps({
  pageTitle: { type: String, default: '' },
  status: { type: String, default: 'DRAFT' },
  saving: { type: Boolean, default: false },
  dirty: { type: Boolean, default: false },
})

const emit = defineEmits(['undo', 'redo', 'device', 'save', 'publish', 'preview', 'history', 'back'])
</script>

<template>
  <div class="tw-h-14 tw-flex tw-items-center tw-justify-between tw-px-4 tw-border-b tw-border-slate-200 tw-bg-white">
    <div class="tw-flex tw-items-center tw-gap-3">
      <button class="tw-text-slate-500 hover:tw-text-slate-800" @click="emit('back')">
        <i class="mdi mdi-arrow-left" />
      </button>
      <span class="tw-font-semibold tw-text-slate-800 tw-text-sm">{{ pageTitle }}</span>
      <span
        class="tw-text-xs tw-px-2 tw-py-0.5 tw-rounded-full"
        :class="status === 'PUBLISHED' ? 'tw-bg-green-100 tw-text-green-700' : 'tw-bg-slate-100 tw-text-slate-600'"
      >
        {{ status === 'PUBLISHED' ? 'Published' : 'Draft' }}
      </span>
      <span v-if="saving" class="tw-text-xs tw-text-slate-400">Saving…</span>
      <span v-else-if="dirty" class="tw-text-xs tw-text-amber-600">Unsaved changes</span>
      <span v-else class="tw-text-xs tw-text-slate-400">All changes saved</span>
    </div>

    <div class="tw-flex tw-items-center tw-gap-2">
      <button class="wb-icon-btn" title="Undo" @click="emit('undo')"><i class="mdi mdi-undo" /></button>
      <button class="wb-icon-btn" title="Redo" @click="emit('redo')"><i class="mdi mdi-redo" /></button>

      <div class="tw-mx-2 tw-flex tw-rounded-md tw-border tw-border-slate-200 tw-overflow-hidden">
        <button class="wb-device-btn" title="Desktop" @click="emit('device', 'Desktop')"><i class="mdi mdi-monitor" /></button>
        <button class="wb-device-btn" title="Tablet" @click="emit('device', 'Tablet')"><i class="mdi mdi-tablet" /></button>
        <button class="wb-device-btn" title="Mobile" @click="emit('device', 'Mobile')"><i class="mdi mdi-cellphone" /></button>
      </div>

      <button class="wb-icon-btn" title="Version History" @click="emit('history')"><i class="mdi mdi-history" /></button>

      <button
        class="tw-rounded-full tw-border tw-border-slate-300 tw-px-4 tw-py-1.5 tw-text-sm tw-font-medium tw-text-slate-700 hover:tw-bg-slate-50"
        @click="emit('preview')"
      >
        Preview
      </button>
      <button
        class="tw-rounded-full tw-border tw-border-slate-300 tw-px-4 tw-py-1.5 tw-text-sm tw-font-medium tw-text-slate-700 hover:tw-bg-slate-50"
        @click="emit('save')"
      >
        Save
      </button>
      <button
        class="tw-rounded-full tw-bg-violet-700 tw-px-4 tw-py-1.5 tw-text-sm tw-font-medium tw-text-white hover:tw-bg-violet-800"
        @click="emit('publish')"
      >
        Publish
      </button>
    </div>
  </div>
</template>

<style scoped>
.wb-icon-btn {
  @apply tw-h-8 tw-w-8 tw-flex tw-items-center tw-justify-center tw-rounded-md tw-text-slate-500 hover:tw-bg-slate-100 hover:tw-text-slate-800;
}
.wb-device-btn {
  @apply tw-h-8 tw-w-9 tw-flex tw-items-center tw-justify-center tw-text-slate-500 hover:tw-bg-slate-100;
}
</style>
