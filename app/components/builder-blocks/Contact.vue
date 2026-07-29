<script setup>
import { blockBackgroundStyle } from "./blockStyle";

const props = defineProps({
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  address: { type: String, default: "" },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  mapEmbedUrl: { type: String, default: "" },
  bgColor: { type: String, default: "" },
  bgImage: { type: String, default: "" },
  bgOverlayOpacity: { type: [Number, String], default: 0 },
});
</script>

<template>
  <section id="contact" class="tw-bg-white dark:tw-bg-slate-900 tw-py-16" :style="blockBackgroundStyle(props)">
    <div class="tw-mx-auto tw-max-w-5xl tw-px-6 tw-grid md:tw-grid-cols-2 tw-gap-10 tw-items-start">
      <div>
        <h2 v-if="title" class="tw-text-3xl tw-font-bold tw-text-slate-900 dark:tw-text-white">{{ title }}</h2>
        <p v-if="subtitle" class="tw-mt-3 tw-text-slate-600 dark:tw-text-slate-300">{{ subtitle }}</p>
        <ul class="tw-mt-6 tw-space-y-3 tw-text-sm tw-text-slate-700 dark:tw-text-slate-200">
          <li v-if="address" class="tw-flex tw-gap-2"><i class="mdi mdi-map-marker tw-text-[var(--theme-primary,#6D28D9)]" />{{ address }}</li>
          <li v-if="phone" class="tw-flex tw-gap-2"><i class="mdi mdi-phone tw-text-[var(--theme-primary,#6D28D9)]" />{{ phone }}</li>
          <li v-if="email" class="tw-flex tw-gap-2"><i class="mdi mdi-email tw-text-[var(--theme-primary,#6D28D9)]" />{{ email }}</li>
        </ul>
      </div>
      <div class="tw-aspect-video tw-rounded-2xl tw-overflow-hidden tw-bg-slate-100 dark:tw-bg-slate-800">
        <iframe v-if="mapEmbedUrl" :src="mapEmbedUrl" class="tw-h-full tw-w-full tw-border-0" loading="lazy" />
      </div>
    </div>
  </section>
</template>
