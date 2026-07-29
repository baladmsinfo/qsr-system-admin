<script setup>
import { blockBackgroundStyle } from "./blockStyle";

const props = defineProps({
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  videoUrl: { type: String, default: "" },
  posterUrl: { type: String, default: "" },
  bgColor: { type: String, default: "" },
  bgImage: { type: String, default: "" },
  bgOverlayOpacity: { type: [Number, String], default: 0 },
});
</script>

<template>
  <section class="tw-bg-white dark:tw-bg-slate-900 tw-py-16" :style="blockBackgroundStyle(props)">
    <div class="tw-mx-auto tw-max-w-4xl tw-px-6">
      <div class="tw-text-center tw-max-w-2xl tw-mx-auto tw-mb-10">
        <h2 v-if="title" class="tw-text-3xl tw-font-bold tw-text-slate-900 dark:tw-text-white">{{ title }}</h2>
        <p v-if="subtitle" class="tw-mt-3 tw-text-slate-600 dark:tw-text-slate-300">{{ subtitle }}</p>
      </div>
      <div class="tw-aspect-video tw-rounded-2xl tw-overflow-hidden tw-bg-slate-900 tw-relative">
        <iframe v-if="videoUrl" :src="videoUrl" class="tw-h-full tw-w-full tw-border-0" allowfullscreen loading="lazy" />
        <img v-else-if="posterUrl" :src="posterUrl" alt="" class="tw-h-full tw-w-full tw-object-cover" />
      </div>
    </div>
  </section>
</template>
