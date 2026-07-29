<script setup>
import { blockBackgroundStyle } from "./blockStyle";

const props = defineProps({
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  ctaLabel: { type: String, default: "" },
  ctaLink: { type: String, default: "#" },
  background: { type: String, default: "primary" },
  bgColor: { type: String, default: "" },
  bgImage: { type: String, default: "" },
  bgOverlayOpacity: { type: [Number, String], default: 0 },
});
</script>

<template>
  <section
    class="tw-py-16"
    :class="{
      'tw-bg-[var(--theme-primary,#6D28D9)]': background === 'primary',
      'tw-bg-slate-900': background === 'dark',
      'tw-bg-slate-50 dark:tw-bg-slate-950': background === 'light',
    }"
    :style="blockBackgroundStyle(props)"
  >
    <div class="tw-mx-auto tw-max-w-3xl tw-px-6 tw-text-center">
      <h2
        class="tw-text-3xl tw-font-bold"
        :class="background === 'light' ? 'tw-text-slate-900 dark:tw-text-white' : 'tw-text-white'"
      >
        {{ title }}
      </h2>
      <p
        v-if="subtitle"
        class="tw-mt-3"
        :class="background === 'light' ? 'tw-text-slate-600 dark:tw-text-slate-300' : 'tw-text-white/80'"
      >
        {{ subtitle }}
      </p>
      <a
        v-if="ctaLabel"
        :href="ctaLink"
        class="tw-mt-8 tw-inline-flex tw-items-center tw-rounded-full tw-px-6 tw-py-3 tw-font-medium tw-transition"
        :class="
          background === 'light'
            ? 'tw-bg-[var(--theme-primary,#6D28D9)] tw-text-white hover:tw-bg-[var(--theme-primary-hover,#5b21b6)]'
            : 'tw-bg-white tw-text-slate-900 hover:tw-bg-slate-100'
        "
      >
        {{ ctaLabel }}
      </a>
    </div>
  </section>
</template>
