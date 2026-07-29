<script setup>
import { blockBackgroundStyle } from "./blockStyle";

// `branches` matches the shape dataSource.js's mapBranches() produces in
// dynamic mode (name/address/openingTime/closingTime) - in static mode the
// tenant enters the same fields manually via the Properties panel, same
// pattern as every other block's list-type props.
const props = defineProps({
  title: { type: String, default: "Opening Hours" },
  subtitle: { type: String, default: "" },
  branches: { type: Array, default: () => [] },
  bgColor: { type: String, default: "" },
  bgImage: { type: String, default: "" },
  bgOverlayOpacity: { type: [Number, String], default: 0 },
});
</script>

<template>
  <section class="tw-bg-slate-50 dark:tw-bg-slate-950 tw-py-16" :style="blockBackgroundStyle(props)">
    <div class="tw-mx-auto tw-max-w-3xl tw-px-6">
      <div class="tw-text-center tw-max-w-2xl tw-mx-auto tw-mb-8">
        <h2 v-if="title" class="tw-text-3xl tw-font-bold tw-text-slate-900 dark:tw-text-white">{{ title }}</h2>
        <p v-if="subtitle" class="tw-mt-3 tw-text-slate-600 dark:tw-text-slate-300">{{ subtitle }}</p>
      </div>
      <div class="tw-space-y-4">
        <div
          v-for="(branch, i) in branches"
          :key="i"
          class="tw-rounded-xl tw-bg-white dark:tw-bg-slate-900 tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-p-4 tw-flex tw-items-center tw-justify-between tw-gap-4"
        >
          <div>
            <h3 class="tw-font-medium tw-text-slate-900 dark:tw-text-white">{{ branch.name }}</h3>
            <p v-if="branch.address" class="tw-text-sm tw-text-slate-500 dark:tw-text-slate-400">{{ branch.address }}</p>
          </div>
          <div v-if="branch.openingTime || branch.closingTime" class="tw-text-sm tw-font-medium tw-text-[var(--theme-primary,#6D28D9)] tw-whitespace-nowrap">
            {{ branch.openingTime }}<span v-if="branch.openingTime && branch.closingTime"> - </span>{{ branch.closingTime }}
          </div>
        </div>
        <p v-if="!branches.length" class="tw-text-center tw-text-sm tw-text-slate-400">No branches to show yet.</p>
      </div>
    </div>
  </section>
</template>
