<template>
  <div class="d-flex flex-column h-100">
    <!-- Header (fixed within the panel) -->
    <div class="d-flex justify-space-between align-center mb-3 flex-shrink-0">
      <span class="text-subtitle-1 font-weight-bold">Order Summary</span>
      <v-menu v-if="draftsList.length" :close-on-content-click="false">
        <template #activator="{ props }">
          <v-btn size="small" variant="tonal" color="accent" class="drafts-activator-btn" v-bind="props">
            <v-icon start size="16">mdi-content-save-outline</v-icon>
            Drafts
            <span class="drafts-count-badge">{{ draftsList.length }}</span>
          </v-btn>
        </template>

        <div class="drafts-panel">
          <div class="drafts-panel-header px-4 pt-3 pb-2">
            <span class="text-caption text-uppercase font-weight-bold" style="letter-spacing: 0.04em">Saved Drafts</span>
          </div>
          <div class="drafts-panel-list px-2 pb-2">
            <div v-for="(d, idx) in draftsList" :key="d.id" class="draft-row" @click="$emit('load-draft', d)">
              <div class="draft-icon-badge" :style="{ background: draftColor(idx) }">
                <v-icon color="white" size="18">mdi-receipt-text-outline</v-icon>
              </div>
              <div class="flex-grow-1" style="min-width: 0">
                <div class="font-weight-bold text-body-2 text-truncate">{{ d.label || 'Untitled draft' }}</div>
                <div class="d-flex align-center ga-2 mt-1">
                  <span class="draft-count-pill">{{ d.items.length }} item{{ d.items.length === 1 ? '' : 's' }}</span>
                  <span class="text-caption text-medium-emphasis d-flex align-center ga-1">
                    <v-icon size="12">mdi-clock-outline</v-icon>{{ new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                  </span>
                </div>
              </div>
              <v-btn icon="mdi-delete-outline" size="x-small" variant="text" class="draft-delete-btn"
                @click.stop="$emit('delete-draft', d.id)" />
            </div>
          </div>
        </div>
      </v-menu>
    </div>

    <div v-if="!cart.length" class="text-center text-medium-emphasis py-10 flex-grow-1">
      <v-icon size="40" color="grey">mdi-cart-outline</v-icon>
      <p class="mt-2 mb-0 text-body-2">Tap a menu item to add it to the order</p>
    </div>

    <template v-else>
      <!-- Scrollable middle: cart lines + fields (only when on the base 'cart' step) -->
      <div class="flex-grow-1 overflow-y-auto pe-1">
        <div class="cart-lines mb-3">
          <div v-for="(line, idx) in cart" :key="idx" class="d-flex justify-space-between align-center py-2 cart-line">
            <div class="flex-grow-1 pe-2">
              <div class="text-body-2 font-weight-bold cart-item-name">{{ line.name }}</div>
              <div class="text-caption text-medium-emphasis mono-data">{{ $formatPrice(line.price) }} each</div>
            </div>
            <div class="d-flex align-center ga-1">
              <v-btn icon="mdi-minus" size="x-small" variant="tonal" :disabled="step !== 'cart'"
                @click="$emit('update-qty', idx, line.quantity - 1)" />
              <span class="font-weight-bold mono-data text-center" style="min-width: 22px">{{ line.quantity }}</span>
              <v-btn icon="mdi-plus" size="x-small" variant="tonal" :disabled="step !== 'cart'"
                @click="$emit('update-qty', idx, line.quantity + 1)" />
              <v-btn icon="mdi-close" size="x-small" variant="text" color="error" :disabled="step !== 'cart'"
                @click="$emit('remove-line', idx)" />
            </div>
          </div>
        </div>

        <template v-if="step === 'cart'">
          <v-select v-model="tableId" :items="tableOptions" label="Table (optional - blank = takeaway)"
            clearable density="comfortable" class="mb-2" />

          <v-expansion-panels variant="accordion" class="mb-3">
            <v-expansion-panel title="Customer details (optional)">
              <v-expansion-panel-text>
                <v-text-field v-model="customerName" label="Name" density="comfortable" class="mb-2" />
                <v-text-field v-model="customerPhone" label="Phone" density="comfortable" hide-details />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-textarea v-model="notes" label="Notes for the kitchen (optional)" rows="2" density="comfortable"
            class="mb-3" />
        </template>
      </div>

      <!-- Fixed footer: totals + action area, always visible -->
      <div class="flex-shrink-0">
        <v-divider class="mb-3" />
        <div class="d-flex justify-space-between text-body-2 mb-1">
          <span>Subtotal</span><span class="mono-data">{{ $formatPrice(subtotal) }}</span>
        </div>
        <div class="d-flex justify-space-between text-body-2 mb-1">
          <span>Tax</span><span class="mono-data">{{ $formatPrice(taxAmount) }}</span>
        </div>
        <div class="d-flex justify-space-between text-h6 font-weight-bold mb-4">
          <span>Total</span><span class="mono-data">{{ $formatPrice(total) }}</span>
        </div>

        <v-alert v-if="placeError" type="error" variant="tonal" density="comfortable" class="mb-3">{{ placeError }}</v-alert>

        <!-- Step: cart -->
        <template v-if="step === 'cart'">
          <v-btn block variant="tonal" class="mb-2" @click="$emit('save-draft')">Save as Draft</v-btn>
          <v-btn block color="primary" size="large" @click="step = 'method'">Place Order &amp; Pay</v-btn>
        </template>

        <!-- Step: choose payment method -->
        <template v-else-if="step === 'method'">
          <p class="text-caption text-medium-emphasis mb-2 text-uppercase font-weight-medium">Select payment method</p>
          <div class="payment-tile-grid mb-2">
            <div v-for="opt in paymentOptions" :key="opt.label" class="payment-tile"
              :style="{ '--tile-color': opt.color }" @click="chooseMethod(opt.method, opt.label, opt.color)">
              <div class="payment-tile-badge" :style="{ background: opt.color }">
                <v-icon color="white" size="20">{{ opt.icon }}</v-icon>
              </div>
              <div class="text-body-2 font-weight-bold mt-2">{{ opt.label }}</div>
              <div class="text-caption text-medium-emphasis">{{ opt.caption }}</div>
            </div>
          </div>
          <v-btn block variant="text" :disabled="placing" @click="step = 'cart'">Back</v-btn>
        </template>

        <!-- Step: confirm (cash / credit / debit) -->
        <template v-else-if="step === 'confirm'">
          <div class="app-card pa-3 mb-3 text-center" :style="{ background: '#FAFAFC', borderLeft: `4px solid ${selectedColor}` }">
            <div class="text-caption text-medium-emphasis">{{ methodLabel }} &middot; amount due</div>
            <div class="text-h5 font-weight-bold mono-data">{{ $formatPrice(total) }}</div>
          </div>
          <v-btn block color="primary" size="large" class="mb-2" :loading="placing" @click="$emit('confirm-payment', selectedMethod)">
            Confirm &amp; Send to Kitchen
          </v-btn>
          <v-btn block variant="text" :disabled="placing" @click="step = 'method'">Back</v-btn>
        </template>

        <!-- Step: UPI -->
        <template v-else-if="step === 'upi'">
          <template v-if="!qrDataUrl">
            <p class="text-caption text-medium-emphasis mb-2">Generate a QR code for the customer to scan and pay.</p>
            <v-btn block variant="tonal" color="primary" class="mb-2" @click="generateQr(false)">Generate QR</v-btn>
            <v-btn block variant="tonal" color="primary" class="mb-2" @click="generateQr(true)">
              Generate QR with Amount ({{ $formatPrice(total) }})
            </v-btn>
            <v-btn block variant="text" :disabled="placing" @click="step = 'method'">Back</v-btn>
          </template>
          <template v-else>
            <div class="text-center mb-3">
              <img :src="qrDataUrl" width="180" height="180" style="border: 1px solid #EAE3F5; border-radius: 12px" />
              <div class="text-caption text-medium-emphasis mt-2">
                {{ qrHasAmount ? `Scan to pay ${$formatPrice(total)}` : 'Scan and enter amount in the UPI app' }}
              </div>
            </div>
            <v-btn block color="primary" size="large" class="mb-2 wrap-btn-text" :loading="placing" @click="$emit('confirm-payment', 'UPI')">
              Payment Received - Complete Order
            </v-btn>
            <v-btn block variant="text" :disabled="placing" @click="qrDataUrl = ''">Regenerate</v-btn>
            <v-btn block variant="text" :disabled="placing" @click="step = 'method'">Back</v-btn>
          </template>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import QRCode from 'qrcode'

const props = defineProps({
  cart: { type: Array, required: true },
  tableOptions: { type: Array, default: () => [] },
  draftsList: { type: Array, default: () => [] },
  subtotal: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  placing: { type: Boolean, default: false },
  placeError: { type: String, default: '' },
  merchantName: { type: String, default: 'Bucksbox' },
})

defineEmits(['update-qty', 'remove-line', 'save-draft', 'load-draft', 'delete-draft', 'confirm-payment'])

const tableId = defineModel('tableId')
const customerName = defineModel('customerName')
const customerPhone = defineModel('customerPhone')
const notes = defineModel('notes')

const { $formatPrice } = useNuxtApp()

// Cycles through the palette so a list of drafts reads as distinct,
// scannable rows rather than a flat monochrome list.
const DRAFT_COLORS = ['#6D28D9', '#D97706', '#2563EB', '#DB2777', '#16A34A']
function draftColor(idx) {
  return DRAFT_COLORS[idx % DRAFT_COLORS.length]
}

// step: 'cart' -> 'method' -> 'confirm' (cash/card) or 'upi' (UPI QR)
const step = ref('cart')
const selectedMethod = ref('CASH')
const methodLabel = ref('Cash')
const selectedColor = ref('#6D28D9')
const qrDataUrl = ref('')
const qrHasAmount = ref(false)

// Color-as-utility: each payment method gets a distinct badge color so it's
// instantly recognizable at a glance (matches how Cash/UPI/Card are visually
// distinguished on modern QSR POS terminals).
const paymentOptions = [
  { method: 'CASH', label: 'Cash', icon: 'mdi-cash', color: '#D97706', caption: 'Pay at the counter' },
  { method: 'UPI', label: 'UPI', icon: 'mdi-qrcode', color: '#6D28D9', caption: 'Scan & pay instantly' },
  { method: 'CARD', label: 'Credit Card', icon: 'mdi-credit-card', color: '#2563EB', caption: 'Visa, Mastercard & more' },
  { method: 'CARD', label: 'Debit Card', icon: 'mdi-credit-card-outline', color: '#DB2777', caption: 'Debit / ATM card' },
]

function chooseMethod(method, label, color) {
  selectedMethod.value = method
  methodLabel.value = label || (method === 'CASH' ? 'Cash' : method)
  selectedColor.value = color || '#6D28D9'
  qrDataUrl.value = ''
  step.value = method === 'UPI' ? 'upi' : 'confirm'
}

async function generateQr(withAmount) {
  // NOTE: no merchant UPI VPA is configured anywhere in this app yet - this
  // is a placeholder handle. Wire this up to a real branch/company UPI ID
  // once payment-gateway/merchant settings exist.
  const vpa = 'bucksbox@upi'
  const params = new URLSearchParams({ pa: vpa, pn: props.merchantName, cu: 'INR' })
  if (withAmount) params.set('am', props.total.toFixed(2))
  const upiUrl = `upi://pay?${params.toString()}`
  qrDataUrl.value = await QRCode.toDataURL(upiUrl, { width: 220, margin: 1 })
  qrHasAmount.value = withAmount
}

// Reset the payment flow whenever the panel is handed a fresh/cleared cart
// (i.e. after an order is placed) or when the cart becomes non-empty again.
watch(() => props.cart.length, (len) => {
  if (len === 0) {
    step.value = 'cart'
    qrDataUrl.value = ''
  }
})

defineExpose({ resetStep: () => { step.value = 'cart'; qrDataUrl.value = '' } })
</script>

<style scoped>
/* Bounded AND scrollable in its own right - without overflow-y here, content
   taller than max-height visually spills out and overlaps whatever follows
   (the Table select / Customer details fields), instead of scrolling. */
.cart-lines {
  max-height: 260px;
  overflow-y: auto;
}
.cart-line {
  border-top: 1px solid #EAE6F2;
}
.cart-line:first-child {
  border-top: none;
}
.cart-item-name {
  color: #D97706;
}
.wrap-btn-text :deep(.v-btn__content) {
  white-space: normal;
  line-height: 1.2;
  padding: 6px 0;
}

.drafts-activator-btn {
  position: relative;
}
.drafts-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  margin-left: 6px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.18);
  font-size: 11px;
  font-weight: 700;
}

.drafts-panel {
  min-width: 300px;
  max-width: 340px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
}
.drafts-panel-header {
  color: #5B5566;
  border-bottom: 1px solid #EAE6F2;
}
.drafts-panel-list {
  max-height: 320px;
  overflow-y: auto;
}
.draft-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s ease;
}
.draft-row:hover {
  background: #FAF8FF;
}
.draft-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.draft-count-pill {
  background: #F3EEFF;
  color: #6D28D9;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 8px;
  border-radius: 999px;
}
.draft-delete-btn {
  flex-shrink: 0;
  opacity: 0.5;
  transition: opacity 0.15s ease, background 0.15s ease;
}
.draft-delete-btn:hover {
  opacity: 1;
  background: #FEE2E2 !important;
  color: #DC2626 !important;
}

.payment-tile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.payment-tile {
  border: 1px solid #EAE6F2;
  border-radius: 16px;
  padding: 14px 12px;
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;
}
.payment-tile:hover {
  border-color: var(--tile-color);
  box-shadow: 0 4px 14px -6px rgba(0, 0, 0, 0.18);
}
.payment-tile:active {
  transform: scale(0.97);
}
.payment-tile-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
