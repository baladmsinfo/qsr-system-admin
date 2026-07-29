<script setup>
import { blockBackgroundStyle } from "./blockStyle";
import { useMenuCart } from "../../composables/useMenuCart";

// `categories` has the same shape as RestaurantMenu's - this block is its
// live-data-capable sibling (see dataSource.js's resolveBlockDataSource),
// not a replacement. In dynamic mode, `categories` is overwritten at
// load/render time with real menu data before this component ever sees it -
// the component itself stays a pure function of props either way.
const props = defineProps({
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  categories: { type: Array, default: () => [] },
  variant: { type: String, default: "list" }, // list | grid
  filter: { type: String, default: "all" }, // all | recommended | popular (dynamic mode only)
  // Add to Cart only works for items that carry a real `id` (dynamic-mode
  // items do; hand-typed static-mode items don't) - the button is hidden
  // per-item rather than shown-but-broken for a static entry with nothing
  // real behind it.
  enableCart: { type: [Boolean, String], default: false },
  bgColor: { type: String, default: "" },
  bgImage: { type: String, default: "" },
  bgOverlayOpacity: { type: [Number, String], default: 0 },
});

const cart = useMenuCart();
const cartEnabled = props.enableCart === true || props.enableCart === "true";

function addToCart(item) {
  if (!item.id) return;
  cart.addItem(item);
}
</script>

<template>
  <section class="tw-bg-white dark:tw-bg-slate-900 tw-py-16" :style="blockBackgroundStyle(props)">
    <div class="tw-mx-auto tw-max-w-6xl tw-px-6">
      <div class="tw-text-center tw-max-w-2xl tw-mx-auto">
        <h2 v-if="title" class="tw-text-3xl tw-font-bold tw-text-slate-900 dark:tw-text-white">{{ title }}</h2>
        <p v-if="subtitle" class="tw-mt-3 tw-text-slate-600 dark:tw-text-slate-300">{{ subtitle }}</p>
      </div>

      <div class="tw-mt-12 tw-space-y-12">
        <div v-for="(cat, ci) in categories" :key="ci">
          <h3 class="tw-text-xl tw-font-semibold tw-text-[var(--theme-accent,#F59E0B)] tw-mb-6">{{ cat.name }}</h3>

          <div v-if="variant === 'grid'" class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6">
            <div
              v-for="(item, ii) in cat.items"
              :key="ii"
              class="tw-rounded-2xl tw-overflow-hidden tw-bg-slate-50 dark:tw-bg-slate-800 tw-border tw-border-slate-100 dark:tw-border-slate-700"
            >
              <div v-if="item.imageUrl" class="tw-aspect-video tw-bg-slate-100 dark:tw-bg-slate-700">
                <img :src="item.imageUrl" alt="" class="tw-h-full tw-w-full tw-object-cover" />
              </div>
              <div class="tw-p-4">
                <div class="tw-flex tw-items-baseline tw-justify-between tw-gap-2">
                  <h4 class="tw-font-medium tw-text-slate-900 dark:tw-text-white">
                    <span v-if="item.isVeg === true" class="tw-inline-block tw-h-2.5 tw-w-2.5 tw-rounded-full tw-bg-green-600 tw-mr-1.5" />
                    <span v-else-if="item.isVeg === false" class="tw-inline-block tw-h-2.5 tw-w-2.5 tw-rounded-full tw-bg-red-600 tw-mr-1.5" />
                    {{ item.name }}
                  </h4>
                  <span v-if="item.price" class="tw-font-semibold tw-text-[var(--theme-primary,#6D28D9)] tw-whitespace-nowrap">₹{{ item.price }}</span>
                </div>
                <p v-if="item.description" class="tw-mt-1 tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">{{ item.description }}</p>
                <button
                  v-if="cartEnabled && item.id"
                  type="button"
                  class="tw-mt-3 tw-w-full tw-rounded-full tw-bg-[var(--theme-primary,#6D28D9)] tw-px-4 tw-py-1.5 tw-text-sm tw-font-medium tw-text-white hover:tw-bg-[var(--theme-primary-hover,#5b21b6)] tw-transition"
                  @click="addToCart(item)"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>

          <div v-else class="tw-grid sm:tw-grid-cols-2 tw-gap-6">
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
                <button
                  v-if="cartEnabled && item.id"
                  type="button"
                  class="tw-mt-2 tw-rounded-full tw-border tw-border-[var(--theme-primary,#6D28D9)] tw-px-3 tw-py-1 tw-text-xs tw-font-medium tw-text-[var(--theme-primary,#6D28D9)] hover:tw-bg-[var(--theme-primary,#6D28D9)] hover:tw-text-white tw-transition"
                  @click="addToCart(item)"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>

        <p v-if="!categories.length" class="tw-text-center tw-text-sm tw-text-slate-400">No menu items to show yet.</p>
      </div>
    </div>
  </section>
</template>
