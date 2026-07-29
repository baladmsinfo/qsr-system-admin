<script setup>
import { blockBackgroundStyle } from "./blockStyle";

const props = defineProps({
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  categories: { type: Array, default: () => [] },
  bgColor: { type: String, default: "" },
  bgImage: { type: String, default: "" },
  bgOverlayOpacity: { type: [Number, String], default: 0 },
});
</script>

<template>
  <section id="menu" class="tw-bg-white dark:tw-bg-slate-900 tw-py-16" :style="blockBackgroundStyle(props)">
    <div class="tw-mx-auto tw-max-w-5xl tw-px-6">
      <div class="tw-text-center tw-max-w-2xl tw-mx-auto">
        <h2 v-if="title" class="tw-text-3xl tw-font-bold tw-text-slate-900 dark:tw-text-white">{{ title }}</h2>
        <p v-if="subtitle" class="tw-mt-3 tw-text-slate-600 dark:tw-text-slate-300">{{ subtitle }}</p>
      </div>
      <div class="tw-mt-12 tw-space-y-12">
        <div v-for="(cat, ci) in categories" :key="ci">
          <h3 class="tw-text-xl tw-font-semibold tw-text-[var(--theme-accent,#F59E0B)] tw-mb-6">{{ cat.name }}</h3>
          <div class="tw-grid sm:tw-grid-cols-2 tw-gap-6">
            <div v-for="(item, ii) in cat.items" :key="ii" class="tw-flex tw-gap-4">
              <div v-if="item.imageUrl" class="tw-h-16 tw-w-16 tw-shrink-0 tw-rounded-lg tw-overflow-hidden tw-bg-slate-100 dark:tw-bg-slate-800">
                <img :src="item.imageUrl" alt="" class="tw-h-full tw-w-full tw-object-cover" />
              </div>
              <div class="tw-flex-1">
                <div class="tw-flex tw-items-baseline tw-justify-between tw-gap-4">
                  <h4 class="tw-font-medium tw-text-slate-900 dark:tw-text-white">{{ item.name }}</h4>
                  <span v-if="item.price" class="tw-font-semibold tw-text-[var(--theme-primary,#6D28D9)] tw-whitespace-nowrap">₹{{ item.price }}</span>
                </div>
                <p v-if="item.description" class="tw-mt-1 tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
