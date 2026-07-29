<script setup>
import { ref, onMounted } from "vue";
import { useMenuCart } from "../../composables/useMenuCart";
import { useCheckout } from "../../composables/useCheckout";

// `branchId`/`companyId` are auto-injected by DynamicRenderer (frontend) the
// same way Breadcrumb's `currentLabel` is - not meant to be hand-typed,
// though they stay real props so the canvas/registry contract is uniform.
// Places a REAL pickup/dine-in order via the existing order-creation infra
// (see useCheckout.js) with no scanned-QR table session required - that's
// the actual gap this block closes. "Pay Online" only ever appears when a
// payment gateway is genuinely configured and active for this merchant
// (checked via checkPaymentAvailable) - never a fake button with nothing
// behind it.
const props = defineProps({
  title: { type: String, default: "Checkout" },
  branchId: { type: String, default: "" },
  companyId: { type: String, default: "" },
  trackOrderHref: { type: String, default: "/order-status" },
});

const cart = useMenuCart();
const checkout = useCheckout();

const name = ref("");
const phone = ref("");
const notes = ref("");
const isDineIn = ref(false);
const tableNumber = ref("");
const paymentMethod = ref("counter"); // counter | online
const paymentAvailable = ref(false);
const submitting = ref(false);
const errorMessage = ref("");
const placedOrder = ref(null);

onMounted(async () => {
  if (props.companyId) paymentAvailable.value = await checkout.checkPaymentAvailable(props.companyId);
});

async function submit() {
  errorMessage.value = "";
  if (!name.value || !phone.value) {
    errorMessage.value = "Name and phone are required.";
    return;
  }
  if (!cart.items.value.length) {
    errorMessage.value = "Your cart is empty.";
    return;
  }

  submitting.value = true;
  try {
    const order = await checkout.placeOrder({
      branchId: props.branchId,
      tableNumber: isDineIn.value ? tableNumber.value : "",
      customerName: name.value,
      customerPhone: phone.value,
      notes: notes.value,
    });
    if (!order) {
      errorMessage.value = "Could not place your order. Please try again.";
      return;
    }

    if (paymentMethod.value === "online") {
      const paid = await checkout.payOnline(order, {
        trackOrderHref: props.trackOrderHref,
        onFailure: (msg) => {
          errorMessage.value = msg;
        },
      });
      if (!paid) return;
    }

    placedOrder.value = order;
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <section class="tw-bg-white dark:tw-bg-slate-900 tw-py-16">
    <div class="tw-mx-auto tw-max-w-xl tw-px-6">
      <h2 class="tw-text-3xl tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-8">{{ title }}</h2>

      <div
        v-if="placedOrder"
        class="tw-rounded-2xl tw-bg-green-50 dark:tw-bg-green-900/20 tw-border tw-border-green-200 dark:tw-border-green-800 tw-p-6 tw-text-center"
      >
        <i class="mdi mdi-check-circle tw-text-4xl tw-text-green-600" />
        <p class="tw-mt-2 tw-font-semibold tw-text-slate-900 dark:tw-text-white">Order placed successfully!</p>
        <p class="tw-text-sm tw-text-slate-500 dark:tw-text-slate-400">Order #{{ placedOrder.id?.slice(0, 8) }}</p>
        <a
          :href="`${trackOrderHref}?orderId=${placedOrder.id}`"
          class="tw-mt-3 tw-inline-block tw-text-sm tw-font-medium tw-text-[var(--theme-primary,#6D28D9)] hover:tw-underline"
        >
          Track your order →
        </a>
      </div>

      <template v-else>
        <div class="tw-space-y-3 tw-mb-8">
          <div v-for="(item, i) in cart.items.value" :key="i" class="tw-flex tw-items-center tw-justify-between tw-text-sm">
            <span class="tw-text-slate-700 dark:tw-text-slate-200">{{ item.name }} x{{ item.quantity }}</span>
            <span class="tw-font-medium tw-text-slate-900 dark:tw-text-white">₹{{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
          <div v-if="!cart.items.value.length" class="tw-text-sm tw-text-slate-400 tw-text-center tw-py-4">Your cart is empty.</div>
          <div
            v-if="cart.items.value.length"
            class="tw-flex tw-items-center tw-justify-between tw-pt-3 tw-border-t tw-border-slate-100 dark:tw-border-slate-800 tw-font-semibold tw-text-slate-900 dark:tw-text-white"
          >
            <span>Total</span>
            <span>₹{{ cart.total.value.toFixed(2) }}</span>
          </div>
        </div>

        <div class="tw-space-y-4">
          <input v-model="name" type="text" placeholder="Your Name" class="tw-w-full tw-rounded-lg tw-border tw-border-slate-300 dark:tw-border-slate-700 tw-bg-transparent tw-px-3 tw-py-2 tw-text-sm" />
          <input v-model="phone" type="tel" placeholder="Phone Number" class="tw-w-full tw-rounded-lg tw-border tw-border-slate-300 dark:tw-border-slate-700 tw-bg-transparent tw-px-3 tw-py-2 tw-text-sm" />
          <textarea v-model="notes" placeholder="Order Notes (optional)" rows="2" class="tw-w-full tw-rounded-lg tw-border tw-border-slate-300 dark:tw-border-slate-700 tw-bg-transparent tw-px-3 tw-py-2 tw-text-sm" />

          <div class="tw-flex tw-items-center tw-gap-4 tw-text-sm tw-text-slate-700 dark:tw-text-slate-200">
            <label class="tw-flex tw-items-center tw-gap-2"><input type="radio" :checked="!isDineIn" @change="isDineIn = false" />Pickup</label>
            <label class="tw-flex tw-items-center tw-gap-2"><input type="radio" :checked="isDineIn" @change="isDineIn = true" />I have a table</label>
          </div>
          <input
            v-if="isDineIn"
            v-model="tableNumber"
            type="text"
            placeholder="Table Number"
            class="tw-w-full tw-rounded-lg tw-border tw-border-slate-300 dark:tw-border-slate-700 tw-bg-transparent tw-px-3 tw-py-2 tw-text-sm"
          />

          <div class="tw-space-y-2 tw-text-sm tw-text-slate-700 dark:tw-text-slate-200">
            <label class="tw-flex tw-items-center tw-gap-2"><input type="radio" :checked="paymentMethod === 'counter'" @change="paymentMethod = 'counter'" />Pay at Counter</label>
            <label v-if="paymentAvailable" class="tw-flex tw-items-center tw-gap-2"><input type="radio" :checked="paymentMethod === 'online'" @change="paymentMethod = 'online'" />Pay Online</label>
          </div>

          <p v-if="errorMessage" class="tw-text-sm tw-text-red-600">{{ errorMessage }}</p>

          <button
            type="button"
            :disabled="submitting || checkout.placing.value || !cart.items.value.length"
            class="tw-w-full tw-rounded-full tw-bg-[var(--theme-primary,#6D28D9)] tw-py-3 tw-text-sm tw-font-medium tw-text-white hover:tw-bg-[var(--theme-primary-hover,#5b21b6)] tw-transition disabled:tw-opacity-50"
            @click="submit"
          >
            {{ submitting ? 'Placing Order…' : 'Place Order' }}
          </button>
        </div>
      </template>
    </div>
  </section>
</template>
