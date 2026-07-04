<template>
  <v-container fluid class="pa-4 pa-md-8">
    <div class="app-header-bar d-flex flex-wrap align-center justify-space-between mb-6 px-5 py-4 ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-0">Live Orders</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">Real-time dine-in order monitoring</p>
      </div>
      <v-select v-if="isSuperAdmin" v-model="selectedBranchId" :items="branchOptions" label="Branch"
        density="compact" hide-details style="max-width: 220px" />
    </div>

    <div class="d-flex flex-wrap ga-2 mb-6">
      <v-chip v-for="tab in statusTabs" :key="tab.value" :color="statusFilter === tab.value ? 'primary' : undefined"
        :variant="statusFilter === tab.value ? 'flat' : 'tonal'" class="font-weight-medium" @click="statusFilter = tab.value">
        {{ tab.label }}
      </v-chip>
    </div>

    <v-row>
      <v-col v-for="order in filteredOrders" :key="order.id" cols="12" sm="6" md="4">
        <div class="app-card">
          <div class="pa-5">
            <div class="d-flex justify-space-between align-start mb-2">
              <div>
                <div class="font-weight-bold">{{ order.table?.tableNo || 'Takeaway' }}</div>
                <div class="text-caption text-medium-emphasis">{{ order.source }} &middot; {{ new Date(order.createdAt).toLocaleTimeString() }}</div>
              </div>
              <v-chip size="small" :color="statusColor(order.status)" variant="tonal">{{ order.status }}</v-chip>
            </div>

            <v-divider class="my-2" />

            <div v-for="item in order.orderItems" :key="item.id" class="d-flex justify-space-between text-body-2">
              <span>{{ item.quantity }} &times; {{ item.menuItem?.name }}</span>
              <span>{{ $formatPrice(item.total) }}</span>
            </div>

            <v-divider class="my-2" />

            <div class="d-flex justify-space-between font-weight-bold">
              <span>Total</span>
              <span>{{ $formatPrice(order.totalAmount) }}</span>
            </div>

            <div v-if="waitingMessage(order)" class="text-caption text-medium-emphasis mt-2 d-flex align-center ga-1">
              <v-icon size="14">mdi-clock-outline</v-icon>{{ waitingMessage(order) }}
            </div>
          </div>

          <div class="d-flex align-center px-5 pb-4">
            <v-btn v-if="canCancel(order)" size="small" color="error" variant="text" @click="updateStatus(order, 'CANCELLED')">
              Cancel
            </v-btn>
            <v-spacer />
            <v-btn v-if="primaryAction(order)" size="small" color="primary" :loading="busyId === order.id"
              @click="updateStatus(order, primaryAction(order).status)">
              {{ primaryAction(order).label }}
            </v-btn>
          </div>

          <v-expansion-panels v-if="order.auditLogs?.length" variant="accordion" flat>
            <v-expansion-panel>
              <v-expansion-panel-title class="text-caption py-1">History</v-expansion-panel-title>
              <v-expansion-panel-text>
                <div v-for="log in order.auditLogs" :key="log.id" class="text-caption text-medium-emphasis mb-1">
                  <template v-if="log.entityType === 'KITCHEN_TICKET'">
                    Kitchen ({{ log.note || 'ticket' }}): {{ log.fromStatus }} → {{ log.toStatus }}
                  </template>
                  <template v-else>
                    {{ log.fromStatus ? `${log.fromStatus} → ${log.toStatus}` : log.toStatus }}
                  </template>
                  <span v-if="log.role"> &middot; {{ log.role }}</span>
                  <span v-else-if="log.note"> &middot; {{ log.note }}</span>
                  &middot; {{ new Date(log.createdAt).toLocaleTimeString() }}
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </v-col>
    </v-row>

    <div v-if="!filteredOrders.length" class="text-center text-medium-emphasis py-12">
      No orders in this view
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useOrdersStore } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'
import { useBranchSelector } from '@/composables/useBranchSelector'

const orders = useOrdersStore()
const auth = useAuthStore()
const toast = useToast()
const { isSuperAdmin, selectedBranchId, branchOptions } = useBranchSelector()
const { $socket } = useNuxtApp()

const statusFilter = ref('')
const busyId = ref(null)

const statusTabs = [
  { value: '', label: 'All' },
  { value: 'PLACED', label: 'Placed' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'PREPARING', label: 'Preparing' },
  { value: 'READY', label: 'Ready' },
  { value: 'SERVED', label: 'Served' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

// Mirrors the backend's ORDER_TRANSITION_ROLES in orderService.js - kept in sync
// deliberately so the UI never offers a button the server would reject, but the
// server is what actually enforces this (see orderService.updateOrderStatus).
const ROLES_BY_TARGET = {
  ACCEPTED: ['SUPERADMIN', 'BRANCHADMIN', 'WAITER', 'CASHIER'],
  CANCELLED: ['SUPERADMIN', 'BRANCHADMIN', 'WAITER', 'CASHIER'],
  SERVED: ['SUPERADMIN', 'BRANCHADMIN', 'WAITER', 'CASHIER'],
  COMPLETED: ['SUPERADMIN', 'BRANCHADMIN', 'WAITER', 'CASHIER', 'ACCOUNTANT'],
}

function canDo(target) {
  return (ROLES_BY_TARGET[target] || []).includes(auth.role)
}

function allHandedOff(order) {
  return order.kitchenTickets?.length > 0 && order.kitchenTickets.every((t) => t.status === 'COMPLETED')
}

function primaryAction(order) {
  if (order.status === 'PLACED' && canDo('ACCEPTED')) return { status: 'ACCEPTED', label: 'Mark Accepted' }
  if (order.status === 'READY' && allHandedOff(order) && canDo('SERVED')) return { status: 'SERVED', label: 'Mark Served' }
  if (order.status === 'SERVED' && canDo('COMPLETED')) return { status: 'COMPLETED', label: 'Mark Completed' }
  return null
}

function waitingMessage(order) {
  if (order.status === 'ACCEPTED') return 'Waiting for the kitchen to start preparing'
  if (order.status === 'PREPARING') return 'Kitchen is preparing this order'
  if (order.status === 'READY' && !allHandedOff(order)) return 'Waiting for the kitchen to hand off'
  return null
}

function canCancel(order) {
  return ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(order.status) && canDo('CANCELLED')
}

function statusColor(status) {
  return {
    PLACED: 'grey', ACCEPTED: 'info', PREPARING: 'warning', READY: 'success',
    SERVED: 'primary', COMPLETED: 'success', CANCELLED: 'error',
  }[status] || 'grey'
}

const filteredOrders = computed(() =>
  statusFilter.value ? orders.orders.filter((o) => o.status === statusFilter.value) : orders.orders
)

async function updateStatus(order, status) {
  busyId.value = order.id
  try {
    const res = await orders.updateStatus(order.id, status)
    if (res.statusCode !== '00') {
      toast.error(res.message || 'That action is not allowed right now')
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'That action is not allowed right now')
  } finally {
    busyId.value = null
  }
}

async function load() {
  if (!selectedBranchId.value) return
  await orders.fetchOrders(selectedBranchId.value)
  $socket.emit('join:branch', selectedBranchId.value)
}

function onOrderEvent(order) {
  if (order.branchId && order.branchId !== selectedBranchId.value) return
  orders.upsertOrder(order)
}

onMounted(() => {
  load()
  $socket.on('order:new', onOrderEvent)
  $socket.on('order:status', onOrderEvent)
  $socket.on('order:updated', onOrderEvent)
})

onBeforeUnmount(() => {
  $socket.off('order:new', onOrderEvent)
  $socket.off('order:status', onOrderEvent)
  $socket.off('order:updated', onOrderEvent)
})

watch(selectedBranchId, (val) => { if (val) load() })
</script>
