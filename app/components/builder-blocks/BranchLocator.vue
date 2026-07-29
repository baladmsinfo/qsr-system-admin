<script setup>
import { blockBackgroundStyle } from "./blockStyle";

// Same `branches` shape as OpeningHours (real, shared dataSource.js mapping)
// - focused on address + a real "Get Directions" link (plain Google Maps
// search URL built from the address text, no Maps API/key needed) instead
// of opening hours.
const props = defineProps({
  title: { type: String, default: "Find Us" },
  subtitle: { type: String, default: "" },
  branches: { type: Array, default: () => [] },
  bgColor: { type: String, default: "" },
  bgImage: { type: String, default: "" },
  bgOverlayOpacity: { type: [Number, String], default: 0 },
});

function directionsUrl(branch) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${branch.name} ${branch.address || ""}`.trim())}`;
}
</script>

<template>
  <section class="tw-bg-white dark:tw-bg-slate-900 tw-py-16" :style="blockBackgroundStyle(props)">
    <div class="tw-mx-auto tw-max-w-5xl tw-px-6">
      <div class="tw-text-center tw-max-w-2xl tw-mx-auto tw-mb-10">
        <h2 v-if="title" class="tw-text-3xl tw-font-bold tw-text-slate-900 dark:tw-text-white">{{ title }}</h2>
        <p v-if="subtitle" class="tw-mt-3 tw-text-slate-600 dark:tw-text-slate-300">{{ subtitle }}</p>
      </div>
      <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6">
        <div
          v-for="(branch, i) in branches"
          :key="i"
          class="tw-rounded-2xl tw-bg-slate-50 dark:tw-bg-slate-800 tw-border tw-border-slate-100 dark:tw-border-slate-700 tw-p-5"
        >
          <h3 class="tw-font-semibold tw-text-slate-900 dark:tw-text-white">{{ branch.name }}</h3>
          <p v-if="branch.address" class="tw-mt-1 tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">{{ branch.address }}</p>
          <p v-if="branch.openingTime || branch.closingTime" class="tw-mt-2 tw-text-xs tw-text-slate-500 dark:tw-text-slate-400">
            {{ branch.openingTime }}<span v-if="branch.openingTime && branch.closingTime"> - </span>{{ branch.closingTime }}
          </p>
          <a
            :href="directionsUrl(branch)"
            target="_blank"
            rel="noopener"
            class="tw-mt-3 tw-inline-flex tw-items-center tw-gap-1 tw-text-sm tw-font-medium tw-text-[var(--theme-primary,#6D28D9)] hover:tw-underline"
          >
            <i class="mdi mdi-directions" />Get Directions
          </a>
        </div>
        <p v-if="!branches.length" class="tw-text-center tw-text-sm tw-text-slate-400 sm:tw-col-span-2 lg:tw-col-span-3">No branches to show yet.</p>
      </div>
    </div>
  </section>
</template>
