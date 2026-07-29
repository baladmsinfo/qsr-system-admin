<script setup>
import { ref } from "vue";
import { useMenuCart } from "../../composables/useMenuCart";

// Reads the SAME cart useMenuCart() wraps for MenuShowcase's Add to Cart
// button - a builder-block face on the existing cart, not a second cart.
defineProps({
  checkoutHref: { type: String, default: "/checkout" },
});

const cart = useMenuCart();
const open = ref(false);
</script>

<template>
  <div>
    <button
      type="button"
      class="tw-fixed tw-bottom-6 tw-right-6 tw-z-40 tw-h-14 tw-w-14 tw-rounded-full tw-bg-[var(--theme-primary,#6D28D9)] tw-text-white tw-flex tw-items-center tw-justify-center tw-shadow-lg tw-text-2xl tw-relative"
      aria-label="View cart"
      @click="open = !open"
    >
      <i class="mdi mdi-cart-outline" />
      <span
        v-if="cart.itemCount.value > 0"
        class="tw-absolute -tw-top-1 -tw-right-1 tw-h-5 tw-min-w-5 tw-px-1 tw-rounded-full tw-bg-white tw-text-[var(--theme-primary,#6D28D9)] tw-text-xs tw-font-bold tw-flex tw-items-center tw-justify-center"
      >
        {{ cart.itemCount.value }}
      </span>
    </button>

    <div v-if="open" class="tw-fixed tw-inset-0 tw-z-40 tw-bg-black/30" @click="open = false" />
    <div
      v-if="open"
      class="tw-fixed tw-top-0 tw-right-0 tw-h-full tw-w-full sm:tw-w-96 tw-z-50 tw-bg-white dark:tw-bg-slate-900 tw-shadow-xl tw-flex tw-flex-col"
    >
      <div class="tw-flex tw-items-center tw-justify-between tw-p-4 tw-border-b tw-border-slate-100 dark:tw-border-slate-800">
        <h3 class="tw-font-semibold tw-text-slate-900 dark:tw-text-white">Your Cart</h3>
        <button type="button" class="tw-text-slate-400 hover:tw-text-slate-700 dark:hover:tw-text-slate-200" @click="open = false">
          <i class="mdi mdi-close tw-text-xl" />
        </button>
      </div>

      <div class="tw-flex-1 tw-overflow-y-auto tw-p-4 tw-space-y-4">
        <div v-for="(item, i) in cart.items.value" :key="i" class="tw-flex tw-gap-3">
          <div v-if="item.imageUrl" class="tw-h-14 tw-w-14 tw-shrink-0 tw-rounded-lg tw-overflow-hidden tw-bg-slate-100 dark:tw-bg-slate-800">
            <img :src="item.imageUrl" alt="" class="tw-h-full tw-w-full tw-object-cover" />
          </div>
          <div class="tw-flex-1">
            <p class="tw-text-sm tw-font-medium tw-text-slate-900 dark:tw-text-white">{{ item.name }}</p>
            <p class="tw-text-xs tw-text-slate-500 dark:tw-text-slate-400">₹{{ item.price }}</p>
            <div class="tw-mt-1 tw-flex tw-items-center tw-gap-2">
              <button type="button" class="tw-h-6 tw-w-6 tw-rounded-full tw-border tw-border-slate-300 dark:tw-border-slate-600 tw-text-xs" @click="cart.updateQuantity(i, item.quantity - 1)">-</button>
              <span class="tw-text-sm">{{ item.quantity }}</span>
              <button type="button" class="tw-h-6 tw-w-6 tw-rounded-full tw-border tw-border-slate-300 dark:tw-border-slate-600 tw-text-xs" @click="cart.updateQuantity(i, item.quantity + 1)">+</button>
              <button type="button" class="tw-ml-auto tw-text-xs tw-text-red-600" @click="cart.removeItem(i)">Remove</button>
            </div>
          </div>
        </div>
        <p v-if="!cart.items.value.length" class="tw-text-center tw-text-sm tw-text-slate-400 tw-py-8">Your cart is empty.</p>
      </div>

      <div v-if="cart.items.value.length" class="tw-border-t tw-border-slate-100 dark:tw-border-slate-800 tw-p-4">
        <div class="tw-flex tw-items-center tw-justify-between tw-text-sm tw-mb-3">
          <span class="tw-text-slate-500 dark:tw-text-slate-400">Total</span>
          <span class="tw-font-semibold tw-text-slate-900 dark:tw-text-white">₹{{ cart.total.value.toFixed(2) }}</span>
        </div>
        <a
          :href="checkoutHref"
          class="tw-block tw-w-full tw-text-center tw-rounded-full tw-bg-[var(--theme-primary,#6D28D9)] tw-py-2.5 tw-text-sm tw-font-medium tw-text-white hover:tw-bg-[var(--theme-primary-hover,#5b21b6)] tw-transition"
        >
          Checkout
        </a>
      </div>
    </div>
  </div>
</template>
