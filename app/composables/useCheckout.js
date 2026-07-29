// Canvas-preview-only mock, same reasoning as this app's useMenuCart.js -
// the admin app has no real order/payment flow of its own; this just lets
// CheckoutForm's submit button visually resolve to a fake order id while
// editing, without pretending a real order gets placed from the builder.
import { ref, computed } from "vue";
import { useMenuCart } from "./useMenuCart";

export function useCheckout() {
  const cart = useMenuCart();
  const placing = ref(false);

  async function placeOrder() {
    placing.value = true;
    await new Promise((resolve) => setTimeout(resolve, 400));
    placing.value = false;
    cart.clear();
    return { id: "preview-order", status: "PLACED", totalAmount: 0 };
  }

  async function payOnline() {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return true;
  }

  // Always true in the canvas preview (not a real check) so an editor can
  // see and lay out the "Pay Online" option while designing the page -
  // harmless since payOnline() above never makes a real payment either.
  async function checkPaymentAvailable() {
    return true;
  }

  // computed()/ref-shaped return, matching qsr-system-frondend's real
  // useCheckout.js exactly, so CheckoutForm.vue's template (identical in
  // both apps) can use `checkout.placing.value` uniformly either way.
  return { placeOrder, payOnline, checkPaymentAvailable, placing: computed(() => placing.value), initiating: computed(() => false), verifying: computed(() => false) };
}
