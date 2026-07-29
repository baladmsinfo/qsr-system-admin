<script setup>
import { blockBackgroundStyle } from "./blockStyle";

const props = defineProps({
  title: { type: String, default: "" },
  items: { type: Array, default: () => [] },
  bgColor: { type: String, default: "" },
  bgImage: { type: String, default: "" },
  bgOverlayOpacity: { type: [Number, String], default: 0 },
});
</script>

<template>
  <section class="tw-bg-slate-50 dark:tw-bg-slate-950 tw-py-16" :style="blockBackgroundStyle(props)">
    <div class="tw-mx-auto tw-max-w-3xl tw-px-6">
      <h2 v-if="title" class="tw-text-3xl tw-font-bold tw-text-center tw-text-slate-900 dark:tw-text-white">{{ title }}</h2>
      <div class="tw-mt-10 tw-space-y-4">
        <details
          v-for="(item, i) in items"
          :key="i"
          class="tw-group tw-rounded-xl tw-bg-white dark:tw-bg-slate-900 tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-p-4"
        >
          <summary class="tw-cursor-pointer tw-font-medium tw-text-slate-900 dark:tw-text-white tw-list-none tw-flex tw-items-center tw-justify-between">
            {{ item.question }}
            <i class="mdi mdi-chevron-down tw-transition group-open:tw-rotate-180" />
          </summary>
          <p class="tw-mt-3 tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">{{ item.answer }}</p>
        </details>
      </div>
    </div>
  </section>
</template>
