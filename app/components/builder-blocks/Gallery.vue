<script setup>
import { blockBackgroundStyle } from "./blockStyle";

const props = defineProps({
  title: { type: String, default: "" },
  images: { type: Array, default: () => [] },
  bgColor: { type: String, default: "" },
  bgImage: { type: String, default: "" },
  bgOverlayOpacity: { type: [Number, String], default: 0 },
});
</script>

<template>
  <section class="tw-bg-slate-50 dark:tw-bg-slate-950 tw-py-16" :style="blockBackgroundStyle(props)">
    <div class="tw-mx-auto tw-max-w-6xl tw-px-6">
      <h2 v-if="title" class="tw-text-3xl tw-font-bold tw-text-center tw-text-slate-900 dark:tw-text-white">{{ title }}</h2>
      <div class="tw-mt-10 tw-grid tw-grid-cols-2 md:tw-grid-cols-3 tw-gap-4">
        <div
          v-for="(img, i) in images"
          :key="i"
          class="tw-relative tw-aspect-square tw-rounded-xl tw-overflow-hidden tw-bg-slate-200 dark:tw-bg-slate-800"
        >
          <img v-if="img.url" :src="img.url" :alt="img.caption || ''" class="tw-h-full tw-w-full tw-object-cover" />
          <span
            v-if="img.caption"
            class="tw-absolute tw-bottom-0 tw-inset-x-0 tw-bg-black/50 tw-text-white tw-text-xs tw-px-2 tw-py-1"
          >
            {{ img.caption }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
