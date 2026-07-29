<script setup>
import { blockBackgroundStyle } from "./blockStyle";

const props = defineProps({
  title: { type: String, default: "" },
  columns: { type: String, default: "3" },
  images: { type: Array, default: () => [] },
  bgColor: { type: String, default: "" },
  bgImage: { type: String, default: "" },
  bgOverlayOpacity: { type: [Number, String], default: 0 },
});

const colClass = { "2": "sm:tw-grid-cols-2", "3": "sm:tw-grid-cols-3", "4": "sm:tw-grid-cols-4" };
</script>

<template>
  <section class="tw-bg-white dark:tw-bg-slate-900 tw-py-16" :style="blockBackgroundStyle(props)">
    <div class="tw-mx-auto tw-max-w-6xl tw-px-6">
      <h2 v-if="title" class="tw-text-3xl tw-font-bold tw-text-center tw-text-slate-900 dark:tw-text-white tw-mb-10">{{ title }}</h2>
      <div class="tw-grid tw-grid-cols-2" :class="colClass[columns] || colClass['3']">
        <div v-for="(img, i) in images" :key="i" class="tw-aspect-square tw-bg-slate-100 dark:tw-bg-slate-800 tw-overflow-hidden">
          <img v-if="img.url" :src="img.url" alt="" class="tw-h-full tw-w-full tw-object-cover" />
        </div>
      </div>
    </div>
  </section>
</template>
