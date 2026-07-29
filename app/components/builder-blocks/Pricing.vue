<script setup>
import { blockBackgroundStyle } from "./blockStyle";

const props = defineProps({
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  plans: { type: Array, default: () => [] },
  bgColor: { type: String, default: "" },
  bgImage: { type: String, default: "" },
  bgOverlayOpacity: { type: [Number, String], default: 0 },
});

// The Properties panel's "select" field always stores a string, so the
// edited value ("true"/"false") has to be compared explicitly rather than
// relied on for truthiness - the string "false" is itself truthy in JS.
function isHighlighted(plan) {
  return plan.highlighted === true || plan.highlighted === "true";
}
</script>

<template>
  <section class="tw-bg-white dark:tw-bg-slate-900 tw-py-16" :style="blockBackgroundStyle(props)">
    <div class="tw-mx-auto tw-max-w-6xl tw-px-6">
      <div class="tw-text-center tw-max-w-2xl tw-mx-auto">
        <h2 v-if="title" class="tw-text-3xl tw-font-bold tw-text-slate-900 dark:tw-text-white">{{ title }}</h2>
        <p v-if="subtitle" class="tw-mt-3 tw-text-slate-600 dark:tw-text-slate-300">{{ subtitle }}</p>
      </div>
      <div class="tw-mt-12 tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-8">
        <div
          v-for="(plan, i) in plans"
          :key="i"
          class="tw-rounded-2xl tw-p-8 tw-border"
          :class="isHighlighted(plan)
            ? 'tw-bg-[var(--theme-primary,#6D28D9)] tw-border-[var(--theme-primary,#6D28D9)] tw-text-white tw-shadow-lg tw-scale-105'
            : 'tw-bg-slate-50 dark:tw-bg-slate-800 tw-border-slate-100 dark:tw-border-slate-700 tw-text-slate-900 dark:tw-text-white'"
        >
          <h3 class="tw-font-semibold tw-text-lg">{{ plan.name }}</h3>
          <div class="tw-mt-3 tw-flex tw-items-baseline tw-gap-1">
            <span class="tw-text-4xl tw-font-extrabold">{{ plan.price }}</span>
            <span v-if="plan.period" class="tw-text-sm tw-opacity-70">/{{ plan.period }}</span>
          </div>
          <ul class="tw-mt-6 tw-space-y-2 tw-text-sm">
            <li v-for="(f, fi) in plan.features" :key="fi" class="tw-flex tw-gap-2">
              <i class="mdi mdi-check" />{{ f.value }}
            </li>
          </ul>
          <a
            v-if="plan.ctaLabel"
            :href="plan.ctaLink"
            class="tw-mt-8 tw-inline-flex tw-w-full tw-justify-center tw-rounded-full tw-px-6 tw-py-3 tw-font-medium tw-transition"
            :class="isHighlighted(plan) ? 'tw-bg-white tw-text-[var(--theme-primary,#6D28D9)] hover:tw-bg-slate-100' : 'tw-bg-[var(--theme-primary,#6D28D9)] tw-text-white hover:tw-bg-[var(--theme-primary-hover,#5b21b6)]'"
          >
            {{ plan.ctaLabel }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
