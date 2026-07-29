<script setup>
import { blockBackgroundStyle } from "./blockStyle";

const props = defineProps({
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  placeholder: { type: String, default: "Enter your email" },
  ctaLabel: { type: String, default: "Subscribe" },
  bgColor: { type: String, default: "" },
  bgImage: { type: String, default: "" },
  bgOverlayOpacity: { type: [Number, String], default: 0 },
});
</script>

<template>
  <section class="tw-bg-[var(--theme-primary,#6D28D9)] tw-py-16" :style="blockBackgroundStyle(props)">
    <div class="tw-mx-auto tw-max-w-2xl tw-px-6 tw-text-center">
      <h2 v-if="title" class="tw-text-3xl tw-font-bold tw-text-white">{{ title }}</h2>
      <p v-if="subtitle" class="tw-mt-3 tw-text-white/80">{{ subtitle }}</p>
      <form class="tw-mt-8 tw-flex tw-flex-col sm:tw-flex-row tw-gap-3 tw-max-w-md tw-mx-auto" @submit.prevent>
        <input
          type="email"
          :placeholder="placeholder"
          class="tw-flex-1 tw-rounded-full tw-px-5 tw-py-3 tw-text-sm tw-border-0 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-white"
        />
        <button type="submit" class="tw-rounded-full tw-bg-white tw-px-6 tw-py-3 tw-text-sm tw-font-medium tw-text-[var(--theme-primary,#6D28D9)] hover:tw-bg-slate-100 tw-transition">
          {{ ctaLabel }}
        </button>
      </form>
    </div>
  </section>
</template>
