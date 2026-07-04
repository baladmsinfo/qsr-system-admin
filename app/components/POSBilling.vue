<template>
  <v-container fluid class="pa-6">
    <v-sheet elevation="0" class="d-flex align-center justify-space-between mb-6 px-4 py-3 bg-surface rounded-lg">
      <div>
        <h2 class="text-h5 font-weight-bold mb-0">POS / Billing</h2>
        <p class="text-body-2 text-medium-emphasis">Bill orders once they've been served</p>
      </div>
      <v-select v-if="isSuperAdmin" v-model="selectedBranchId" :items="branchOptions" label="Branch"
        density="compact" variant="outlined" hide-details style="max-width: 220px" />
    </v-sheet>

    <v-row>
      <v-col cols="12" md="5">
        <v-card class="rounded-lg" elevation="1">
          <v-card-title class="text-subtitle-1 font-weight-bold">Awaiting Bill</v-card-title>
          <v-divider />
          <v-list>
            <v-list-item v-for="order in pos.pendingBills" :key="order.id" :active="selectedOrderId === order.id"
              @click="selectOrder(order.id)">
              <v-list-item-title>{{ order.table?.tableNo || 'Takeaway' }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ order.orderItems.length }} items &middot; {{ $formatPrice(order.totalAmount) }}
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="!pos.pendingBills.length">
              <v-list-item-title class="text-medium-emphasis">No orders awaiting billing</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="7">
        <v-card v-if="pos.currentBill" class="rounded-lg pa-4" elevation="2">
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
            <span>Total</span><span>{{ $formatPrice(pos.currentBill.totalAmount) }}</span>
          </div>

          <v-divider class="my-4" />

          <v-select v-model="paymentMethod" :items="['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'OTHER']" label="Payment Method" />

          <v-btn block size="large" color="primary" class="mt-2" :loading="pos.loading" @click="pay">
            Collect {{ $formatPrice(pos.currentBill.totalAmount) }}
          </v-btn>
        </v-card>

        <v-card v-else class="rounded-lg pa-10 text-center text-medium-emphasis" elevation="0">
          Select an order to view its bill
        </v-card>
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
