<script setup>
import { blockBackgroundStyle } from "./blockStyle";

const props = defineProps({
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  address: { type: String, default: "" },
  mapEmbedUrl: { type: String, default: "" },
  bgColor: { type: String, default: "" },
  bgImage: { type: String, default: "" },
  bgOverlayOpacity: { type: [Number, String], default: 0 },
});
</script>

<template>
  <section class="tw-bg-slate-50 dark:tw-bg-slate-950 tw-py-16" :style="blockBackgroundStyle(props)">
    <div class="tw-mx-auto tw-max-w-5xl tw-px-6">
      <div class="tw-text-center tw-max-w-2xl tw-mx-auto tw-mb-8">
        <h2 v-if="title" class="tw-text-3xl tw-font-bold tw-text-slate-900 dark:tw-text-white">{{ title }}</h2>
        <p v-if="subtitle" class="tw-mt-3 tw-text-slate-600 dark:tw-text-slate-300">{{ subtitle }}</p>
        <p v-if="address" class="tw-mt-2 tw-text-sm tw-text-slate-500 dark:tw-text-slate-400">{{ address }}</p>
      </div>
      <div class="tw-aspect-[21/9] tw-rounded-2xl tw-overflow-hidden tw-bg-slate-200 dark:tw-bg-slate-800">
        <iframe v-if="mapEmbedUrl" :src="mapEmbedUrl" class="tw-h-full tw-w-full tw-border-0" loading="lazy" />
      </div>
    </div>
  </section>
</template>
