<script setup>
import { blockBackgroundStyle } from "./blockStyle";

// Static/marketing only, by design: there's no bundled-order/cart backend to
// bind "combo" pricing to, so this is a showcase layout (Meal Combo/Family
// Combo/Kids Meal-style cards), not a functional customization flow. See the
// plan's "QSR components" section for why the interactive builders
// (Burger/Pizza Builder, upgrades) aren't built at all rather than faked.
const props = defineProps({
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  combos: { type: Array, default: () => [] },
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
      <div class="tw-mt-12 tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6">
        <div
          v-for="(combo, i) in combos"
          :key="i"
          class="tw-rounded-2xl tw-overflow-hidden tw-bg-white dark:tw-bg-slate-900 tw-border tw-border-slate-100 dark:tw-border-slate-800 tw-shadow-sm"
        >
          <div v-if="combo.imageUrl" class="tw-aspect-video tw-bg-slate-100 dark:tw-bg-slate-800">
            <img :src="combo.imageUrl" alt="" class="tw-h-full tw-w-full tw-object-cover" />
          </div>
          <div class="tw-p-5">
            <div class="tw-flex tw-items-baseline tw-justify-between tw-gap-2">
              <h3 class="tw-font-semibold tw-text-slate-900 dark:tw-text-white">{{ combo.name }}</h3>
              <span v-if="combo.price" class="tw-font-semibold tw-text-[var(--theme-primary,#6D28D9)] tw-whitespace-nowrap">₹{{ combo.price }}</span>
            </div>
            <p v-if="combo.description" class="tw-mt-2 tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">{{ combo.description }}</p>
            <ul v-if="combo.includes?.length" class="tw-mt-3 tw-space-y-1 tw-text-xs tw-text-slate-500 dark:tw-text-slate-400">
              <li v-for="(inc, ii) in combo.includes" :key="ii" class="tw-flex tw-gap-1.5">
                <i class="mdi mdi-check tw-text-[var(--theme-primary,#6D28D9)]" />{{ inc.value }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
