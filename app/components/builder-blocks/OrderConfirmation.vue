<script setup>
import { ref, onMounted } from "vue";
import { useOrderTracking } from "../../composables/useOrderTracking";

// Real order status (PLACED/ACCEPTED/PREPARING/READY/SERVED/COMPLETED/
// CANCELLED - the actual 7 OrderStatus enum values, not fictional ones like
// "Out for Delivery"/"Delivered" which don't exist in this system), read via
// the URL's `?orderId=` (set by CheckoutForm's "Track your order" link).
defineProps({
  title: { type: String, default: "Order Status" },
});

const STATUS_STEPS = ["PLACED", "ACCEPTED", "PREPARING", "READY", "SERVED", "COMPLETED"];
const STATUS_LABELS = {
  PLACED: "Order Placed",
  ACCEPTED: "Accepted",
  PREPARING: "Preparing",
  READY: "Ready",
  SERVED: "Served",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const route = useRoute();
const tracking = useOrderTracking();
const order = ref(null);
const loading = ref(false);

async function load() {
  const orderId = route.query.orderId;
  if (!orderId) return;
  loading.value = true;
  order.value = await tracking.fetchOrder(orderId);
  loading.value = false;
}

onMounted(load);
</script>

<template>
  <section class="tw-bg-white dark:tw-bg-slate-900 tw-py-16">
    <div class="tw-mx-auto tw-max-w-xl tw-px-6 tw-text-center">
      <h2 class="tw-text-3xl tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-8">{{ title }}</h2>

      <div v-if="!order && !loading" class="tw-text-sm tw-text-slate-400">No order to track yet.</div>
      <div v-else-if="loading" class="tw-text-sm tw-text-slate-400">Loading order status…</div>
      <div v-else>
        <p class="tw-text-sm tw-text-slate-500 dark:tw-text-slate-400 tw-mb-6">Order #{{ order.id?.slice(0, 8) }}</p>

        <div v-if="order.status === 'CANCELLED'" class="tw-text-red-600 tw-font-semibold tw-mb-6">Order Cancelled</div>
        <div v-else class="tw-flex tw-items-center tw-justify-between tw-mb-8">
          <div v-for="(step, i) in STATUS_STEPS" :key="step" class="tw-flex-1 tw-flex tw-flex-col tw-items-center">
            <div
              class="tw-h-8 tw-w-8 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-xs tw-font-bold"
              :class="STATUS_STEPS.indexOf(order.status) >= i ? 'tw-bg-[var(--theme-primary,#6D28D9)] tw-text-white' : 'tw-bg-slate-200 dark:tw-bg-slate-700 tw-text-slate-500'"
            >
              {{ i + 1 }}
            </div>
            <span class="tw-mt-1 tw-text-[10px] tw-text-slate-500 dark:tw-text-slate-400 tw-text-center">{{ STATUS_LABELS[step] }}</span>
          </div>
        </div>

        <button type="button" class="tw-text-sm tw-font-medium tw-text-[var(--theme-primary,#6D28D9)] hover:tw-underline" @click="load">
          <i class="mdi mdi-refresh" /> Refresh Status
        </button>
      </div>
    </div>
  </section>
</template>
