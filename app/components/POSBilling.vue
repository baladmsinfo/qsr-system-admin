<template>
  <v-container fluid :class="isMobile ? 'pa-0' : 'pa-4 pa-md-6'">
    <v-window v-model="tab">
      <!-- ============ NEW ORDER (counter POS) ============ -->
      <v-window-item value="new">
        <v-row>
          <!-- Menu browser -->
          <v-col cols="12" md="8" lg="8">
              <template v-if="isMobile">
                <div class="mobile-sticky-stack pos-mobile-header-stack">
                  <MobilePageHeader title="POS / Billing" :sticky="false"
                    :subtitle="tab === 'new' ? 'Take a counter order and collect payment' : &quot;Bill orders once they've been served&quot;">
                    <template #action>
                      <MobileBranchPicker v-if="isSuperAdmin" v-model="selectedBranchId" :items="branchOptions" />
                    </template>
                    <div class="d-flex ga-2">
                      <v-chip :color="tab === 'new' ? 'primary' : undefined" :variant="tab === 'new' ? 'flat' : 'tonal'"
                        size="small" class="font-weight-medium" @click="tab = 'new'">
                        New Order
                      </v-chip>
                      <!-- Awaiting Bill tab hidden per request - v-window-item value="bill" kept intact below
                      <v-chip :color="tab === 'bill' ? 'primary' : undefined" :variant="tab === 'bill' ? 'flat' : 'tonal'"
                        size="small" class="font-weight-medium" @click="tab = 'bill'">
                        Awaiting Bill
                        <v-avatar v-if="pos.pendingBills.length" size="16" color="error" class="ms-2 text-caption">
                          {{ pos.pendingBills.length }}
                        </v-avatar>
                      </v-chip>
                      -->
                    </div>
                  </MobilePageHeader>

                  <MobileSearchBar v-model="search" placeholder="Search menu items..." :sticky="false">
                    <template #chips>
                      <v-chip :color="!categoryFilter ? 'primary' : undefined" :variant="!categoryFilter ? 'flat' : 'tonal'"
                        size="small" class="font-weight-medium flex-shrink-0" @click="categoryFilter = null">All</v-chip>
                      <v-chip v-for="cat in menu.categories" :key="cat.id"
                        :color="categoryFilter === cat.id ? 'primary' : undefined"
                        :variant="categoryFilter === cat.id ? 'flat' : 'tonal'" size="small"
                        class="font-weight-medium flex-shrink-0" @click="categoryFilter = cat.id">
                        {{ cat.name }}
                      </v-chip>
                    </template>
                  </MobileSearchBar>
                </div>
              </template>

              <template v-else>
                <div class="app-header-bar d-flex flex-wrap align-center justify-space-between mb-6 px-5 py-4 ga-3">
                  <div>
                    <h1 class="text-h5 font-weight-bold mb-0">POS / Billing</h1>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      {{ tab === 'new' ? 'Take a counter order and collect payment' : "Bill orders once they've been served" }}
                    </p>
                  </div>
                  <v-select v-if="isSuperAdmin" v-model="selectedBranchId" :items="branchOptions" label="Branch"
                    density="compact" hide-details style="max-width: 220px" />
                </div>

                <div class="d-flex flex-wrap ga-2 mb-6">
                  <v-chip :color="tab === 'new' ? 'primary' : undefined" :variant="tab === 'new' ? 'flat' : 'tonal'"
                    class="font-weight-medium" @click="tab = 'new'">
                    New Order
                  </v-chip>
                  <!-- Awaiting Bill tab hidden per request - v-window-item value="bill" kept intact below
                  <v-chip :color="tab === 'bill' ? 'primary' : undefined" :variant="tab === 'bill' ? 'flat' : 'tonal'"
                    class="font-weight-medium" @click="tab = 'bill'">
                    Awaiting Bill
                    <v-avatar v-if="pos.pendingBills.length" size="18" color="error" class="ms-2 text-caption">
                      {{ pos.pendingBills.length }}
                    </v-avatar>
                  </v-chip>
                  -->
                </div>

                <v-text-field v-model="search" placeholder="Search menu items..." prepend-inner-icon="mdi-magnify"
                  density="comfortable" hide-details clearable class="mb-4" />

                <div class="d-flex flex-wrap ga-2 mb-4">
                  <v-chip :color="!categoryFilter ? 'primary' : undefined" :variant="!categoryFilter ? 'flat' : 'tonal'"
                    class="font-weight-medium" @click="categoryFilter = null">All</v-chip>
                  <v-chip v-for="cat in menu.categories" :key="cat.id"
                    :color="categoryFilter === cat.id ? 'primary' : undefined"
                    :variant="categoryFilter === cat.id ? 'flat' : 'tonal'" class="font-weight-medium"
                    @click="categoryFilter = cat.id">
                    {{ cat.name }}
                  </v-chip>
                </div>
              </template>

            <div :class="{ 'px-3 pt-3': isMobile }">
            <v-row>
              <v-col v-for="item in visibleItems" :key="item.id" cols="6" sm="4" lg="3">
                <div class="app-card h-100 d-flex flex-column overflow-hidden pos-item-card"
                  :class="{ 'pos-item-card--disabled': item.availability !== 'AVAILABLE' }"
                  @click="addToCart(item)">
                  <div class="pos-item-image-wrap">
                    <v-img v-if="item.imageUrl" :src="item.imageUrl" height="100" cover />
                    <div v-else class="d-flex align-center justify-center" style="height: 100px; background: #F3EEFF">
                      <v-icon color="primary">mdi-food</v-icon>
                    </div>
                    <v-btn v-if="item.availability === 'AVAILABLE'" icon size="small" color="primary"
                      class="pos-item-add-btn" elevation="2" @click.stop="addToCart(item)">
                      <v-icon size="18">mdi-plus</v-icon>
                    </v-btn>
                  </div>
                  <div class="pa-3 pt-4 d-flex flex-column flex-grow-1">
                    <div class="font-weight-bold text-body-2 mb-1">{{ item.name }}</div>
                    <v-chip v-if="item.availability !== 'AVAILABLE'" size="x-small" color="grey" variant="tonal"
                      class="align-self-start mb-1">
                      {{ item.availability === 'OUT_OF_STOCK' ? 'Out of stock' : 'Hidden' }}
                    </v-chip>
                    <v-spacer />
                    <div class="d-flex align-center justify-space-between mt-2">
                      <span class="font-weight-bold mono-data">{{ $formatPrice(item.price) }}</span>
                      <span v-if="item.unitType" class="text-caption text-medium-emphasis">/{{ unitShortLabel(item) }}</span>
                    </div>
                  </div>
                </div>
              </v-col>

              <v-col v-if="!filteredItems.length" cols="12">
                <div class="app-card pa-10 text-center text-medium-emphasis">
                  {{ menu.loading ? 'Loading menu...' : 'No items found' }}
                </div>
              </v-col>
            </v-row>

            <div v-if="visibleItems.length < filteredItems.length" class="d-flex justify-center mt-4" :class="{ 'mb-20': mobile }">
              <v-btn variant="outlined" class="load-more-btn" @click="itemsShown += 20">View More</v-btn>
            </div>
            </div>
          </v-col>

          <!-- Cart panel: fixed side panel on desktop -->
          <v-col class="pos-cart-box" v-if="!mobile" cols="12" md="4" lg="4">
            <div class="app-card pa-4 pos-cart-panel">
              <POSCartPanel
                ref="cartPanelRef"
                :cart="cart" :table-options="tableOptions" :drafts-list="drafts.drafts"
                :subtotal="subtotal" :tax-amount="taxAmount" :total="total"
                :placing="placing" :place-error="placeError"
                v-model:table-id="selectedTableId" v-model:customer-name="customerName"
                v-model:customer-phone="customerPhone" v-model:notes="notes"
                @update-qty="updateQty" @remove-line="(idx) => cart.splice(idx, 1)"
                @save-draft="openSaveDraft" @load-draft="loadDraft"
                @delete-draft="(id) => drafts.remove(selectedBranchId, id)"
                @confirm-payment="confirmPlaceOrder"
              />
            </div>
          </v-col>
        </v-row>

        <!-- Mobile/tablet: fixed bottom bar + expandable sheet -->
        <template v-if="mobile">
          <div v-if="cart.length" class="pos-mobile-bar d-flex align-center justify-space-between px-4 py-3"
            :class="{ 'pos-mobile-bar--phone': isMobile }" @click="mobileCartOpen = true">
            <div class="text-white">
              <div class="text-caption" style="opacity: 0.85">{{ cartItemCount }} item(s)</div>
              <div class="text-subtitle-1 font-weight-bold mono-data">{{ $formatPrice(total) }}</div>
            </div>
            <v-btn variant="flat" color="white" class="text-primary font-weight-bold">
              View Order <v-icon end>mdi-chevron-up</v-icon>
            </v-btn>
          </div>

          <v-bottom-sheet v-model="mobileCartOpen" inset>
            <v-card class="pos-mobile-sheet" :class="{ 'pos-mobile-sheet--phone': isMobile }">
              <div class="pos-mobile-sheet-header d-flex align-center justify-space-between px-4 pt-3 pb-1">
                <span v-if="isMobile" class="text-subtitle-1 font-weight-bold">Your Order</span>
                <v-spacer v-if="isMobile" />
                <v-btn icon="mdi-close" variant="text" size="small" @click="mobileCartOpen = false" />
              </div>
              <div class="px-4 pb-4">
                <POSCartPanel
                  ref="cartPanelMobileRef"
                  :cart="cart" :table-options="tableOptions" :drafts-list="drafts.drafts"
                  :subtotal="subtotal" :tax-amount="taxAmount" :total="total"
                  :placing="placing" :place-error="placeError"
                  v-model:table-id="selectedTableId" v-model:customer-name="customerName"
                  v-model:customer-phone="customerPhone" v-model:notes="notes"
                  @update-qty="updateQty" @remove-line="(idx) => cart.splice(idx, 1)"
                  @save-draft="openSaveDraft" @load-draft="loadDraft"
                  @delete-draft="(id) => drafts.remove(selectedBranchId, id)"
                  @confirm-payment="confirmPlaceOrder"
                />
              </div>
            </v-card>
          </v-bottom-sheet>
        </template>
      </v-window-item>

      <!-- ============ AWAITING BILL (unchanged post-serve billing) ============ -->
      <v-window-item value="bill">
        <v-row>
          <v-col cols="12" md="5">
            <div class="text-subtitle-2 font-weight-bold text-uppercase mb-3 px-1" style="letter-spacing: 0.04em; color: #5B5566">
              Awaiting Bill
            </div>
            <div v-for="order in pos.pendingBills" :key="order.id" class="app-card mb-3"
              :class="{ 'app-card--active': selectedOrderId === order.id }" style="cursor: pointer" @click="selectOrder(order.id)">
              <div class="pa-4 d-flex justify-space-between align-center">
                <div>
                  <div class="font-weight-bold">{{ order.table?.tableNo || 'Takeaway' }}</div>
                  <div class="text-caption text-medium-emphasis">{{ order.orderItems.length }} items</div>
                </div>
                <span class="font-weight-bold mono-data">{{ $formatPrice(order.totalAmount) }}</span>
              </div>
            </div>
            <div v-if="!pos.pendingBills.length" class="app-card pa-8 text-center text-medium-emphasis">
              No orders awaiting billing
            </div>
          </v-col>

          <v-col cols="12" md="7">
            <div v-if="pos.currentBill" class="app-card pa-5">
              <div class="d-flex justify-space-between align-center mb-3">
                <h3 class="text-h6 font-weight-bold">{{ pos.currentBill.table?.tableNo || 'Takeaway' }}</h3>
                <v-chip size="small" variant="tonal">{{ pos.currentBill.status }}</v-chip>
              </div>

              <v-divider class="mb-3" />

              <div v-for="item in pos.currentBill.orderItems" :key="item.id" class="d-flex justify-space-between text-body-2 mb-1">
                <span>{{ item.quantity }} &times; {{ item.menuItem?.name }}</span>
                <span class="mono-data">{{ $formatPrice(item.total) }}</span>
              </div>

              <v-divider class="my-3" />

              <div class="d-flex justify-space-between text-body-2">
                <span>Subtotal</span><span class="mono-data">{{ $formatPrice(pos.currentBill.subtotal) }}</span>
              </div>
              <div class="d-flex justify-space-between text-body-2">
                <span>Tax</span><span class="mono-data">{{ $formatPrice(pos.currentBill.taxAmount) }}</span>
              </div>
              <div class="d-flex justify-space-between text-h6 font-weight-bold mt-2">
                <span>Total</span><span class="mono-data">{{ $formatPrice(pos.currentBill.totalAmount) }}</span>
              </div>

              <v-divider class="my-4" />

              <v-select v-model="billPaymentMethod" :items="paymentMethods" label="Payment Method" />

              <v-btn block size="large" color="primary" class="mt-2" :loading="pos.loading" @click="payBill">
                Collect {{ $formatPrice(pos.currentBill.totalAmount) }}
              </v-btn>
            </div>

            <div v-else class="app-card pa-10 text-center text-medium-emphasis">
              Select an order to view its bill
            </div>
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>

    <!-- Save Draft dialog -->
    <v-dialog v-model="saveDraftDialog" max-width="420">
      <v-card class="pa-4">
        <h3 class="text-h6 font-weight-bold mb-3">Save as Draft</h3>
        <v-text-field v-model="draftLabel" label="Label (optional)" placeholder="e.g. Window table, walk-in #3" />
        <div class="d-flex justify-end ga-2 mt-2">
          <v-btn variant="text" @click="saveDraftDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="confirmSaveDraft">Save Draft</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Quantity entry for unit-based items (sold by weight/volume/count) -->
    <v-dialog v-model="qtyDialog" max-width="360">
      <v-card class="pa-4" v-if="qtyDialogItem">
        <h3 class="text-h6 font-weight-bold mb-1">{{ qtyDialogItem.name }}</h3>
        <p class="text-caption text-medium-emphasis mb-3">
          {{ $formatPrice(qtyDialogItem.price) }} per {{ unitShortLabel(qtyDialogItem) }}
        </p>
        <v-text-field v-model.number="qtyDialogValue" type="number" :suffix="unitShortLabel(qtyDialogItem)"
          label="Quantity" autofocus min="0" @keyup.enter="confirmQtyDialog" />
        <div class="d-flex justify-space-between align-center mt-2">
          <span class="text-body-2 text-medium-emphasis">Line total</span>
          <span class="text-subtitle-1 font-weight-bold mono-data">{{ $formatPrice(qtyDialogItem.price * (qtyDialogValue || 0)) }}</span>
        </div>
        <div class="d-flex justify-end ga-2 mt-4">
          <v-btn variant="text" @click="qtyDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="confirmQtyDialog">Add to Order</v-btn>
        </div>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { usePOSStore } from '@/stores/pos'
import { useOrdersStore } from '@/stores/orders'
import { useMenuStore } from '@/stores/menu'
import { useTableStore } from '@/stores/tables'
import { useCustomerStore } from '@/stores/customer'
import { usePosDraftsStore } from '@/stores/posDrafts'
import { useBranchSelector } from '@/composables/useBranchSelector'
import { useUnitLabel } from '@/composables/useUnitLabel'
import { useDisplay } from 'vuetify'
import { useDevice } from '@/composables/useDevice'
import POSCartPanel from '@/components/POSCartPanel.vue'

const { unitShortLabel } = useUnitLabel()
// `mobile` (<1280, tablet-or-phone) drives the existing bottom-bar/sheet cart
// layout below and must stay untouched. `isMobile` (<600, true phones only)
// is used only to add extra phone-specific polish inside that same layout.
const { isMobile } = useDevice()

const pos = usePOSStore()
const orders = useOrdersStore()
const menu = useMenuStore()
const tableStore = useTableStore()
const customerStore = useCustomerStore()
const drafts = usePosDraftsStore()
const toast = useToast()
const { $formatPrice } = useNuxtApp()
const { isSuperAdmin, selectedBranchId, branchOptions } = useBranchSelector()
const { mobile } = useDisplay()

const tab = ref('new')
const paymentMethods = ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'OTHER']
const mobileCartOpen = ref(false)
const cartPanelRef = ref(null)
const cartPanelMobileRef = ref(null)

/* ---------------- Menu browsing ---------------- */
const search = ref('')
const categoryFilter = ref(null)
const itemsShown = ref(20)

const filteredItems = computed(() => {
  let list = menu.items
  if (categoryFilter.value) list = list.filter((i) => i.categoryId === categoryFilter.value)
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    list = list.filter((i) => i.name.toLowerCase().includes(q))
  }
  return list
})
const visibleItems = computed(() => filteredItems.value.slice(0, itemsShown.value))

watch([search, categoryFilter], () => { itemsShown.value = 20 })

/* ---------------- Cart ---------------- */
const cart = ref([])
const selectedTableId = ref(null)
const customerName = ref('')
const customerPhone = ref('')
const notes = ref('')
const loadedDraftId = ref(null)

const tableOptions = computed(() => tableStore.tables.map((t) => ({ title: t.tableNo, value: t.id })))

// Quantity-based items (sold by weight/volume/piece-count) need an actual
// amount typed in, not a blind +1 - the dialog below collects that before
// the line is added.
const qtyDialog = ref(false)
const qtyDialogItem = ref(null)
const qtyDialogValue = ref(1)

function addToCart(item) {
  if (item.availability !== 'AVAILABLE') return

  if (item.unitType) {
    qtyDialogItem.value = item
    qtyDialogValue.value = 1
    qtyDialog.value = true
    return
  }

  const existing = cart.value.find((l) => l.menuItemId === item.id && !l.unitType)
  if (existing) existing.quantity += 1
  else cart.value.push({ menuItemId: item.id, name: item.name, price: item.price, quantity: 1, remarks: '', taxRate: item.taxRate?.rate || 0 })
}

function confirmQtyDialog() {
  const item = qtyDialogItem.value
  const qty = Number(qtyDialogValue.value)
  if (!item || !qty || qty <= 0) return

  const existing = cart.value.find((l) => l.menuItemId === item.id)
  if (existing) existing.quantity += qty
  else {
    cart.value.push({
      menuItemId: item.id, name: item.name, price: item.price, quantity: qty, remarks: '',
      taxRate: item.taxRate?.rate || 0, unitType: item.unitType, customUnitLabel: item.customUnitLabel,
    })
  }
  qtyDialog.value = false
}

function updateQty(idx, qty) {
  if (qty <= 0) { cart.value.splice(idx, 1); return }
  cart.value[idx].quantity = qty
}

const subtotal = computed(() => cart.value.reduce((s, l) => s + l.price * l.quantity, 0))
const taxAmount = computed(() => cart.value.reduce((s, l) => s + (l.price * l.quantity * (l.taxRate || 0)) / 100, 0))
const total = computed(() => subtotal.value + taxAmount.value)

function resetCart() {
  cart.value = []
  selectedTableId.value = null
  customerName.value = ''
  customerPhone.value = ''
  notes.value = ''
  loadedDraftId.value = null
}

/* ---------------- Drafts ---------------- */
const saveDraftDialog = ref(false)
const draftLabel = ref('')

function openSaveDraft() {
  if (!cart.value.length) return
  draftLabel.value = ''
  saveDraftDialog.value = true
}

function confirmSaveDraft() {
  drafts.save(selectedBranchId.value, {
    id: loadedDraftId.value,
    label: draftLabel.value,
    items: cart.value,
    customerName: customerName.value,
    customerPhone: customerPhone.value,
    tableId: selectedTableId.value,
    notes: notes.value,
  })
  saveDraftDialog.value = false
  toast.success('Draft saved')
  resetCart()
}

function loadDraft(draft) {
  cart.value = draft.items.map((i) => ({ ...i }))
  customerName.value = draft.customerName || ''
  customerPhone.value = draft.customerPhone || ''
  selectedTableId.value = draft.tableId || null
  notes.value = draft.notes || ''
  loadedDraftId.value = draft.id
}

/* ---------------- Place order & pay (counter/QSR flow) ---------------- */
const placing = ref(false)
const placeError = ref('')
const cartItemCount = computed(() => cart.value.reduce((s, l) => s + l.quantity, 0))

// method is chosen inline in POSCartPanel (Cash / UPI / Credit Card / Debit
// Card all map to the Prisma PaymentMethod enum - both card types record as
// 'CARD' since the schema doesn't distinguish credit vs debit).
async function confirmPlaceOrder(method) {
  placing.value = true
  placeError.value = ''
  try {
    let customerId
    if (customerName.value.trim() || customerPhone.value.trim()) {
      const custRes = await customerStore.createCustomer({
        name: customerName.value.trim() || 'Walk-in Customer',
        phone: customerPhone.value.trim() || undefined,
      })
      customerId = custRes?.data?.id
    }

    const orderRes = await orders.createOrder({
      branchId: selectedBranchId.value,
      tableId: selectedTableId.value || undefined,
      customerId,
      notes: notes.value.trim() || undefined,
      items: cart.value.map((l) => ({ menuItemId: l.menuItemId, quantity: l.quantity, remarks: l.remarks || undefined })),
    })

    if (orderRes.statusCode !== '00') {
      placeError.value = orderRes.message || 'Could not place the order'
      return
    }
    const order = orderRes.data

    // Counter orders skip the manual "Mark Accepted" step in Live Orders -
    // they go straight to the kitchen.
    await orders.updateStatus(order.id, 'ACCEPTED')

    // Pay-at-counter: the customer pays now, the kitchen prepares & serves
    // after. This does not change order.status - Live Orders/Kitchen
    // Display continue driving PREPARING -> READY -> SERVED -> COMPLETED
    // exactly as they do for any other order.
    await pos.createPrepayment(order.id, { amount: total.value, method })

    if (loadedDraftId.value) drafts.remove(selectedBranchId.value, loadedDraftId.value)

    toast.success('Order sent to the kitchen - payment collected')
    mobileCartOpen.value = false
    resetCart()
  } catch (err) {
    placeError.value = err?.response?.data?.message || err.message || 'Something went wrong'
  } finally {
    placing.value = false
  }
}

/* ---------------- Awaiting Bill tab (existing post-serve billing) ---------------- */
const selectedOrderId = ref(null)
const billPaymentMethod = ref('CASH')

async function loadBills() {
  if (!selectedBranchId.value) return
  await pos.fetchPendingBills(selectedBranchId.value)
}

async function selectOrder(id) {
  selectedOrderId.value = id
  await pos.fetchBill(id)
}

async function payBill() {
  try {
    await pos.payOrder(selectedOrderId.value, { amount: pos.currentBill.totalAmount, method: billPaymentMethod.value })
    toast.success('Payment recorded, order completed')
    selectedOrderId.value = null
    await loadBills()
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Payment failed')
  }
}

/* ---------------- Branch data loading ---------------- */
async function loadBranchData() {
  if (!selectedBranchId.value) return
  await Promise.all([
    menu.fetchCategories(),
    menu.fetchItems(selectedBranchId.value),
    tableStore.fetchTables(selectedBranchId.value),
    loadBills(),
  ])
  drafts.load(selectedBranchId.value)
}

onMounted(loadBranchData)
watch(selectedBranchId, (val) => { if (val) loadBranchData() })
</script>

<style scoped>
.pos-item-card {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.pos-item-card:active {
  transform: scale(0.97);
}
.pos-item-card--disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.pos-item-image-wrap {
  position: relative;
}
.pos-item-add-btn {
  position: absolute;
  right: 8px;
  bottom: -16px;
  box-shadow: 0 4px 10px -2px rgba(124, 58, 237, 0.45);
}
/* Cart panel is pinned in place (not scrollable with the page). It scrolls
   internally, and POSCartPanel.vue's own totals/payment footer is
   position:sticky within that scroll so it's always reachable regardless of
   how tall the cart/fields content gets, without the outer page needing to
   scroll further. */

.pos-cart-box {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding: 50px 0;
}

.pos-cart-panel {
  width: fit-content;
  margin: 50px 0;
  position: fixed;
  top: 16px;
  height: calc(100vh - 132px);
  max-height: 780px;
  overflow-y: auto;
}

/* Mobile: cart collapses to a fixed bar at the bottom of the screen; tapping
   it opens the full cart/payment flow in a bottom sheet. */
.pos-mobile-bar {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 12px;
  z-index: 1000;
  cursor: pointer;
  border-radius: 18px;
  background: linear-gradient(135deg, #7C3AED 0%, #DB2777 100%);
  box-shadow: 0 8px 24px -4px rgba(124, 58, 237, 0.45);
}

/* max-height caps how tall the sheet gets, but it is also the scroll
   container itself (overflow-y: auto) rather than relying on exact
   viewport-unit math to fit everything without scrolling - forcing a fixed
   height:100vh previously made the v-bottom-sheet "inset" overlay taller
   than the actual visible area on some mobile browsers/WebViews, clipping
   the footer buttons with no way to reach them. Now, even if the max-height
   guess is imperfect, the sheet itself scrolls so nothing is ever
   unreachable - the header stays pinned via sticky, and POSCartPanel.vue's
   own totals/payment footer is sticky to the bottom of this same scroll. */
.pos-mobile-sheet {
  max-height: 90vh;
  max-height: 90dvh;
  border-radius: 24px 24px 0 0 !important;
  overflow-y: auto;
}

.pos-mobile-sheet-header {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #fff;
}

@media (max-width: 600px) {
  .pos-item-card {
    border-radius: 14px;
  }

  .pos-mobile-bar--phone {
    left: 12px;
    right: 12px;
    bottom: calc(12px + var(--mobile-bottom-nav-height, 64px) + env(safe-area-inset-bottom, 0px));
    border-radius: 16px;
  }

  .pos-mobile-sheet--phone {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
}
</style>
