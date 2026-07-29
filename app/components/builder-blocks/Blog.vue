<script setup>
import { blockBackgroundStyle } from "./blockStyle";

const props = defineProps({
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  posts: { type: Array, default: () => [] },
  bgColor: { type: String, default: "" },
  bgImage: { type: String, default: "" },
  bgOverlayOpacity: { type: [Number, String], default: 0 },
});
</script>

<template>
  <section class="tw-bg-white dark:tw-bg-slate-900 tw-py-16" :style="blockBackgroundStyle(props)">
    <div class="tw-mx-auto tw-max-w-6xl tw-px-6">
      <div class="tw-text-center tw-max-w-2xl tw-mx-auto">
        <h2 v-if="title" class="tw-text-3xl tw-font-bold tw-text-slate-900 dark:tw-text-white">{{ title }}</h2>
        <p v-if="subtitle" class="tw-mt-3 tw-text-slate-600 dark:tw-text-slate-300">{{ subtitle }}</p>
      </div>
      <div class="tw-mt-12 tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-8">
        <a
          v-for="(post, i) in posts"
          :key="i"
          :href="post.link || '#'"
          class="tw-block tw-rounded-2xl tw-overflow-hidden tw-border tw-border-slate-100 dark:tw-border-slate-800 hover:tw-shadow-lg tw-transition"
        >
          <div class="tw-aspect-video tw-bg-slate-100 dark:tw-bg-slate-800">
            <img v-if="post.imageUrl" :src="post.imageUrl" alt="" class="tw-h-full tw-w-full tw-object-cover" />
          </div>
          <div class="tw-p-5">
            <span v-if="post.date" class="tw-text-xs tw-uppercase tw-tracking-wide tw-text-[var(--theme-accent,#F59E0B)]">{{ post.date }}</span>
            <h3 class="tw-mt-2 tw-font-semibold tw-text-slate-900 dark:tw-text-white">{{ post.title }}</h3>
            <p v-if="post.excerpt" class="tw-mt-2 tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">{{ post.excerpt }}</p>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>
