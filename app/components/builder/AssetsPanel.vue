<script setup>
import { onMounted } from 'vue'
import { useBuilderStore } from '../../stores/builder'

const builder = useBuilderStore()

onMounted(() => {
  if (!builder.assets.length) builder.fetchAssets()
})

async function onUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const formData = new FormData()
  formData.append('file', file)
  await builder.uploadAsset(formData)
  e.target.value = ''
}

async function onDelete(id) {
  await builder.deleteAsset(id)
}
</script>

<template>
  <div class="tw-p-3 tw-h-full tw-overflow-y-auto">
    <label class="tw-block tw-mb-3 tw-cursor-pointer tw-rounded-lg tw-border tw-border-dashed tw-border-slate-300 tw-p-4 tw-text-center tw-text-xs tw-text-slate-500 hover:tw-border-violet-400">
      + Upload Asset
      <input type="file" accept="image/*" class="tw-hidden" @change="onUpload" />
    </label>
    <div class="tw-grid tw-grid-cols-2 tw-gap-2">
      <div v-for="asset in builder.assets" :key="asset.id" class="tw-relative tw-group tw-rounded tw-overflow-hidden tw-bg-slate-100 tw-aspect-square">
        <img :src="asset.url" alt="" class="tw-h-full tw-w-full tw-object-cover" />
        <button
          class="tw-absolute tw-top-1 tw-right-1 tw-h-5 tw-w-5 tw-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-black/60 tw-text-white tw-text-xs tw-opacity-0 group-hover:tw-opacity-100"
          @click="onDelete(asset.id)"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>
