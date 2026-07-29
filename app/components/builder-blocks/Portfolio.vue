<script setup>
import { blockBackgroundStyle } from "./blockStyle";

const props = defineProps({
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  items: { type: Array, default: () => [] },
  bgColor: { type: String, default: "" },
  bgImage: { type: String, default: "" },
  bgOverlayOpacity: { type: [Number, String], default: 0 },
});
</script>

<template>
  <section class="tw-bg-slate-50 dark:tw-bg-slate-950 tw-py-16" :style="blockBackgroundStyle(props)">
    <div class="tw-mx-auto tw-max-w-6xl tw-px-6">
      <div class="tw-text-center tw-max-w-2xl tw-mx-auto">
        <h2 v-if="title" class="tw-text-3xl tw-font-bold tw-text-slate-900 dark:tw-text-white">{{ title }}</h2>
        <p v-if="subtitle" class="tw-mt-3 tw-text-slate-600 dark:tw-text-slate-300">{{ subtitle }}</p>
      </div>
      <div class="tw-mt-12 tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6">
        <a
          v-for="(item, i) in items"
          :key="i"
          :href="item.link || '#'"
          class="tw-group tw-relative tw-block tw-aspect-square tw-rounded-xl tw-overflow-hidden tw-bg-slate-200 dark:tw-bg-slate-800"
        >
          <img v-if="item.imageUrl" :src="item.imageUrl" alt="" class="tw-h-full tw-w-full tw-object-cover tw-transition group-hover:tw-scale-105" />
          <div class="tw-absolute tw-inset-0 tw-bg-gradient-to-t tw-from-black/70 tw-via-transparent tw-to-transparent tw-flex tw-items-end tw-p-4">
            <div>
              <p class="tw-text-white tw-font-semibold">{{ item.title }}</p>
              <p v-if="item.category" class="tw-text-white/70 tw-text-xs">{{ item.category }}</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>
