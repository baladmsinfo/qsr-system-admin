// Canvas-preview-only mock cart - the admin app has no real ordering/payment
// flow of its own (that's qsr-system-frondend's job, via its own useMenuCart
// wrapping the real stores/cart.js); this just gives MenuShowcase/
// FloatingCart/CheckoutForm's Add to Cart UI something to visually react to
// while editing, without pretending a real cart/checkout exists in the admin
// app. Module-level state (not per-component) so the cart icon badge and the
// menu's Add to Cart buttons stay in sync across the canvas, same as a real
// cart would.
import { ref, computed } from "vue";

const items = ref([]);

export function useMenuCart() {
  const itemCount = computed(() => items.value.reduce((s, i) => s + i.quantity, 0));
  const subtotal = computed(() => items.value.reduce((s, i) => s + i.price * i.quantity, 0));

  function addItem(item) {
    const existing = items.value.find((i) => i.menuItemId === item.id);
    if (existing) existing.quantity += 1;
    else items.value.push({ menuItemId: item.id, name: item.name, price: Number(item.price) || 0, imageUrl: item.imageUrl, quantity: 1 });
  }
  function updateQuantity(index, quantity) {
    if (quantity <= 0) items.value.splice(index, 1);
    else items.value[index].quantity = quantity;
  }
  function removeItem(index) {
    items.value.splice(index, 1);
  }
  function clear() {
    items.value = [];
  }

  return { items, itemCount, subtotal, total: subtotal, addItem, updateQuantity, removeItem, clear };
}
