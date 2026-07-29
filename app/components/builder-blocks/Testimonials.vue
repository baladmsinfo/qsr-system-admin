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
  <section class="tw-bg-white dark:tw-bg-slate-900 tw-py-16" :style="blockBackgroundStyle(props)">
    <div class="tw-mx-auto tw-max-w-5xl tw-px-6">
      <h2 v-if="title" class="tw-text-3xl tw-font-bold tw-text-center tw-text-slate-900 dark:tw-text-white">{{ title }}</h2>
      <div class="tw-mt-12 tw-grid sm:tw-grid-cols-2 tw-gap-6">
        <blockquote
          v-for="(item, i) in items"
          :key="i"
          class="tw-rounded-2xl tw-bg-slate-50 dark:tw-bg-slate-800 tw-p-6"
        >
          <i class="mdi mdi-format-quote-open tw-text-amber-500 tw-text-2xl" />
          <p class="tw-mt-2 tw-text-slate-700 dark:tw-text-slate-200 tw-italic">{{ item.quote }}</p>
          <footer class="tw-mt-4 tw-text-sm tw-font-semibold tw-text-slate-900 dark:tw-text-white">
            {{ item.author }}
            <span v-if="item.role" class="tw-font-normal tw-text-slate-500 dark:tw-text-slate-400"> — {{ item.role }}</span>
          </footer>
        </blockquote>
      </div>
    </div>
  </section>
</template>
