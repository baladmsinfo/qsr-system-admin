<script setup>
import { blockBackgroundStyle } from "./blockStyle";

const props = defineProps({
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  members: { type: Array, default: () => [] },
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
      <div class="tw-mt-12 tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-8">
        <div v-for="(member, i) in members" :key="i" class="tw-text-center">
          <div class="tw-mx-auto tw-h-28 tw-w-28 tw-rounded-full tw-overflow-hidden tw-bg-slate-200 dark:tw-bg-slate-800">
            <img v-if="member.photoUrl" :src="member.photoUrl" alt="" class="tw-h-full tw-w-full tw-object-cover" />
          </div>
          <h3 class="tw-mt-4 tw-font-semibold tw-text-slate-900 dark:tw-text-white">{{ member.name }}</h3>
          <p class="tw-text-sm tw-text-[var(--theme-primary,#6D28D9)]">{{ member.role }}</p>
          <p v-if="member.bio" class="tw-mt-2 tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">{{ member.bio }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
