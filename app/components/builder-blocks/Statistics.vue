<script setup>
import { blockBackgroundStyle } from "./blockStyle";

const props = defineProps({
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  stats: { type: Array, default: () => [] },
  bgColor: { type: String, default: "" },
  bgImage: { type: String, default: "" },
  bgOverlayOpacity: { type: [Number, String], default: 0 },
});
</script>

<template>
  <section class="tw-bg-[var(--theme-primary,#6D28D9)] tw-py-16" :style="blockBackgroundStyle(props)">
    <div class="tw-mx-auto tw-max-w-6xl tw-px-6">
      <div v-if="title || subtitle" class="tw-text-center tw-max-w-2xl tw-mx-auto tw-mb-12">
        <h2 v-if="title" class="tw-text-3xl tw-font-bold tw-text-white">{{ title }}</h2>
        <p v-if="subtitle" class="tw-mt-3 tw-text-white/80">{{ subtitle }}</p>
      </div>
      <div class="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-8 tw-text-center">
        <div v-for="(stat, i) in stats" :key="i">
          <div class="tw-text-4xl tw-font-extrabold tw-text-white">{{ stat.value }}</div>
          <div class="tw-mt-2 tw-text-sm tw-text-white/70">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>
