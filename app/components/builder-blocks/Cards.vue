<script setup>
import { blockBackgroundStyle } from "./blockStyle";

// `variant` covers the spec's "card library" variety (Food/Coffee/Combo/
// Category/Gallery/Event cards) as layout shapes rather than one near-
// identical block per named use-case - the actual visual difference between
// e.g. a "Food Card" and an "Event Card" is layout (grid vs horizontal vs
// image-overlay), not the underlying `cards` data shape, which stays the same.
const props = defineProps({
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  cards: { type: Array, default: () => [] },
  variant: { type: String, default: "default" }, // default | compact | horizontal | overlay
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

      <!-- horizontal: image left, content right - wide "Event Card" layout -->
      <div v-if="variant === 'horizontal'" class="tw-mt-12 tw-space-y-6">
        <div
          v-for="(card, i) in cards"
          :key="i"
          class="tw-flex tw-flex-col sm:tw-flex-row tw-overflow-hidden tw-rounded-2xl tw-bg-white dark:tw-bg-slate-900 tw-border tw-border-slate-100 dark:tw-border-slate-800 tw-shadow-sm"
        >
          <div v-if="card.imageUrl" class="sm:tw-w-56 tw-aspect-video sm:tw-aspect-auto tw-bg-slate-100 dark:tw-bg-slate-800 tw-shrink-0">
            <img :src="card.imageUrl" alt="" class="tw-h-full tw-w-full tw-object-cover" />
          </div>
          <div class="tw-p-6">
            <h3 class="tw-font-semibold tw-text-slate-900 dark:tw-text-white">{{ card.title }}</h3>
            <p v-if="card.body" class="tw-mt-2 tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">{{ card.body }}</p>
            <a v-if="card.link" :href="card.link" class="tw-mt-4 tw-inline-block tw-text-sm tw-font-medium tw-text-[var(--theme-primary,#6D28D9)] hover:tw-underline">Learn more →</a>
          </div>
        </div>
      </div>

      <!-- overlay: image with text overlaid at the bottom - "Coffee/Combo/Gallery Card" look -->
      <div v-else-if="variant === 'overlay'" class="tw-mt-12 tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6">
        <a
          v-for="(card, i) in cards"
          :key="i"
          :href="card.link || '#'"
          class="tw-group tw-relative tw-block tw-aspect-square tw-rounded-2xl tw-overflow-hidden tw-bg-slate-200 dark:tw-bg-slate-800"
        >
          <img v-if="card.imageUrl" :src="card.imageUrl" alt="" class="tw-h-full tw-w-full tw-object-cover tw-transition group-hover:tw-scale-105" />
          <div class="tw-absolute tw-inset-0 tw-bg-gradient-to-t tw-from-black/70 tw-via-transparent tw-to-transparent tw-flex tw-items-end tw-p-4">
            <div>
              <p class="tw-text-white tw-font-semibold">{{ card.title }}</p>
              <p v-if="card.body" class="tw-text-white/70 tw-text-xs">{{ card.body }}</p>
            </div>
          </div>
        </a>
      </div>

      <!-- compact: small icon-forward tile - "Category Card" look -->
      <div v-else-if="variant === 'compact'" class="tw-mt-12 tw-grid tw-grid-cols-2 sm:tw-grid-cols-3 lg:tw-grid-cols-4 tw-gap-4">
        <a
          v-for="(card, i) in cards"
          :key="i"
          :href="card.link || '#'"
          class="tw-rounded-xl tw-bg-white dark:tw-bg-slate-900 tw-border tw-border-slate-100 dark:tw-border-slate-800 tw-p-4 tw-text-center hover:tw-shadow-md tw-transition"
        >
          <div v-if="card.imageUrl" class="tw-mx-auto tw-h-14 tw-w-14 tw-rounded-full tw-overflow-hidden tw-bg-slate-100 dark:tw-bg-slate-800 tw-mb-2">
            <img :src="card.imageUrl" alt="" class="tw-h-full tw-w-full tw-object-cover" />
          </div>
          <p class="tw-text-sm tw-font-medium tw-text-slate-900 dark:tw-text-white">{{ card.title }}</p>
        </a>
      </div>

      <!-- default: original grid card layout -->
      <div v-else class="tw-mt-12 tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6">
        <div
          v-for="(card, i) in cards"
          :key="i"
          class="tw-rounded-2xl tw-overflow-hidden tw-bg-white dark:tw-bg-slate-900 tw-border tw-border-slate-100 dark:tw-border-slate-800 tw-shadow-sm"
        >
          <div v-if="card.imageUrl" class="tw-aspect-video tw-bg-slate-100 dark:tw-bg-slate-800">
            <img :src="card.imageUrl" alt="" class="tw-h-full tw-w-full tw-object-cover" />
          </div>
          <div class="tw-p-6">
            <h3 class="tw-font-semibold tw-text-slate-900 dark:tw-text-white">{{ card.title }}</h3>
            <p v-if="card.body" class="tw-mt-2 tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">{{ card.body }}</p>
            <a v-if="card.link" :href="card.link" class="tw-mt-4 tw-inline-block tw-text-sm tw-font-medium tw-text-[var(--theme-primary,#6D28D9)] hover:tw-underline">Learn more →</a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
