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
      <div class="tw-mt-12 tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-8">
        <div
          v-for="(item, i) in items"
          :key="i"
          class="tw-rounded-2xl tw-bg-white dark:tw-bg-slate-900 tw-p-6 tw-shadow-sm tw-border tw-border-slate-100 dark:tw-border-slate-800"
        >
          <div class="tw-inline-flex tw-h-11 tw-w-11 tw-items-center tw-justify-center tw-rounded-xl tw-bg-violet-100 dark:tw-bg-violet-900/40">
            <i :class="item.icon" class="tw-text-[var(--theme-primary,#6D28D9)] tw-text-xl" />
          </div>
          <h3 class="tw-mt-4 tw-font-semibold tw-text-slate-900 dark:tw-text-white">{{ item.title }}</h3>
          <p class="tw-mt-2 tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">{{ item.body }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
