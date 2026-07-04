<template>
  <v-container fluid class="pa-6">
    <div class="app-header-bar d-flex flex-wrap align-center justify-space-between mb-6 px-5 py-4 ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-0">POS / Billing</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">Bill orders once they've been served</p>
      </div>
      <v-select v-if="isSuperAdmin" v-model="selectedBranchId" :items="branchOptions" label="Branch"
        density="compact" hide-details style="max-width: 220px" />
    </div>

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
            <span>{{ $formatPrice(item.total) }}</span>
          </div>

          <v-divider class="my-3" />

          <div class="d-flex justify-space-between text-body-2">
            <span>Subtotal</span><span>{{ $formatPrice(pos.currentBill.subtotal) }}</span>
          </div>
          <div class="d-flex justify-space-between text-body-2">
            <span>Tax</span><span>{{ $formatPrice(pos.currentBill.taxAmount) }}</span>
          </div>
          <div class="d-flex justify-space-between text-h6 font-weight-bold mt-2">
            <span>Total</span><span class="mono-data">{{ $formatPrice(pos.currentBill.totalAmount) }}</span>
          </div>

          <v-divider class="my-4" />

          <v-select v-model="paymentMethod" :items="['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'OTHER']" label="Payment Method" />

          <v-btn block size="large" color="primary" class="mt-2" :loading="pos.loading" @click="pay">
            Collect {{ $formatPrice(pos.currentBill.totalAmount) }}
          </v-btn>
        </div>

        <div v-else class="app-card pa-10 text-center text-medium-emphasis">
          Select an order to view its bill
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { usePOSStore } from '@/stores/pos'
import { useBranchSelector } from '@/composables/useBranchSelector'

const pos = usePOSStore()
const toast = useToast()
const { isSuperAdmin, selectedBranchId, branchOptions } = useBranchSelector()

const selectedOrderId = ref(null)
const paymentMethod = ref('CASH')

async function load() {
  if (!selectedBranchId.value) return
  await pos.fetchPendingBills(selectedBranchId.value)
}

async function selectOrder(id) {
  selectedOrderId.value = id
  await pos.fetchBill(id)
}

async function pay() {
  try {
    await pos.payOrder(selectedOrderId.value, { amount: pos.currentBill.totalAmount, method: paymentMethod.value })
    toast.success('Payment recorded, order completed')
    selectedOrderId.value = null
    await load()
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Payment failed')
  }
}

onMounted(load)
watch(selectedBranchId, (val) => { if (val) load() })
</script>
