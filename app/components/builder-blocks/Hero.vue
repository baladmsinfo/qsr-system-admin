<script setup>
import { blockBackgroundStyle } from "./blockStyle";

const props = defineProps({
  tag: { type: String, default: "" },
  headline: { type: String, default: "" },
  subtext: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  ctaLabel: { type: String, default: "" },
  ctaLink: { type: String, default: "#" },
  align: { type: String, default: "left" },
  bgColor: { type: String, default: "" },
  bgImage: { type: String, default: "" },
  bgOverlayOpacity: { type: [Number, String], default: 0 },
});
</script>

<template>
  <section class="tw-relative tw-overflow-hidden tw-bg-white dark:tw-bg-slate-900" :style="blockBackgroundStyle(props)">
    <div
      class="tw-mx-auto tw-max-w-6xl tw-px-6 tw-py-20 md:tw-py-28 tw-grid md:tw-grid-cols-2 tw-gap-12 tw-items-center"
      :class="align === 'center' ? 'tw-text-center md:tw-text-center' : ''"
    >
      <div :class="align === 'center' ? 'md:tw-col-span-2 tw-mx-auto tw-max-w-2xl' : ''">
        <p v-if="tag" class="tw-text-sm tw-font-semibold tw-uppercase tw-tracking-wide tw-text-[var(--theme-accent,#F59E0B)]">
          {{ tag }}
        </p>
        <h1 class="tw-mt-3 tw-text-4xl md:tw-text-5xl tw-font-extrabold tw-tracking-tight tw-text-slate-900 dark:tw-text-white">
          {{ headline }}
        </h1>
        <p v-if="subtext" class="tw-mt-5 tw-text-lg tw-text-slate-600 dark:tw-text-slate-300">
          {{ subtext }}
        </p>
        <a
          v-if="ctaLabel"
          :href="ctaLink"
          class="tw-mt-8 tw-inline-flex tw-items-center tw-rounded-full tw-bg-[var(--theme-primary,#6D28D9)] tw-px-6 tw-py-3 tw-text-white tw-font-medium tw-shadow hover:tw-bg-[var(--theme-primary-hover,#5b21b6)] tw-transition"
        >
          {{ ctaLabel }}
        </a>
      </div>
      <div v-if="align !== 'center'" class="tw-relative tw-aspect-[4/3] tw-rounded-2xl tw-overflow-hidden tw-bg-slate-100 dark:tw-bg-slate-800">
        <img v-if="imageUrl" :src="imageUrl" alt="" class="tw-h-full tw-w-full tw-object-cover" />
      </div>
    </div>
  </section>
</template>
