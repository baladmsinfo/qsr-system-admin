<template>
  <div class="mobile-shell-page">
    <MobilePageHeader title="Live Orders" subtitle="Real-time dine-in order monitoring">
      <div class="d-flex align-center ga-2">
        <MobileBranchPicker v-if="isSuperAdmin" v-model="selectedBranchId" :items="branchOptions" />
        <v-btn icon="mdi-tune-variant" variant="tonal" color="primary" density="comfortable" @click="filtersOpen = true" />
      </div>
    </MobilePageHeader>

    <div class="mobile-status-row d-flex ga-2 px-4 py-3">
      <v-chip v-for="tab in statusTabs" :key="tab.value" :color="statusFilter === tab.value ? 'primary' : undefined"
        :variant="statusFilter === tab.value ? 'flat' : 'tonal'" size="small" class="font-weight-medium flex-shrink-0"
        @click="statusFilter = tab.value">
        {{ tab.label }}
      </v-chip>
    </div>

    <MobileLoading v-if="orders.loading && !orders.orders.length" :count="3" type="card" />

    <div v-else class="pa-4 pt-0">
      <MobileEmptyState v-if="!orders.orders.length" icon="mdi-receipt-text-clock-outline" title="No orders in this view"
        description="Try a different status filter or date range." />

      <MobileOrderCard v-for="order in orders.orders" :key="order.id"
        :title="order.table?.tableNo || 'Takeaway'"
        :subtitle="`${order.source} · ${new Date(order.createdAt).toLocaleTimeString()}`"
        class="mb-3">
        <template #status>
          <MobileStatusChip :status="order.status" :color="statusHex(order.status)" size="small" />
        </template>

        <div v-for="item in order.orderItems" :key="item.id" class="d-flex align-center ga-2 mb-1">
          <span class="flex-grow-1" :class="{ 'item-cancelled-text': item.status === 'CANCELLED' }">
            {{ item.quantity }} &times; {{ item.menuItem?.name }}
          </span>
          <v-chip v-if="item.status === 'CANCELLED'" size="x-small" color="error" variant="tonal">Cancelled</v-chip>
          <span :class="{ 'item-cancelled-text': item.status === 'CANCELLED' }">{{ $formatPrice(item.total) }}</span>
          <v-btn v-if="canCancelItem(order, item)" icon="mdi-close-circle-outline" size="x-small" variant="text"
            color="error" :loading="cancellingItemId === item.id" @click="cancelSingleItem(order, item)" />
        </div>

        <v-divider class="my-2" />
        <div class="d-flex justify-space-between font-weight-bold text-body-2">
          <span>Total</span>
          <span class="mono-data">{{ $formatPrice(order.totalAmount) }}</span>
        </div>

        <div v-if="waitingMessage(order)" class="text-caption text-medium-emphasis mt-2 d-flex align-center ga-1">
          <v-icon size="14">mdi-clock-outline</v-icon>{{ waitingMessage(order) }}
        </div>

        <v-expansion-panels v-if="order.auditLogs?.length" variant="accordion" flat class="mt-2">
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

        <template #actions>
          <v-btn v-if="canCancel(order)" size="small" color="error" variant="text" class="font-weight-medium"
            @click="updateStatus(order, 'CANCELLED')">
            Cancel
          </v-btn>
          <v-btn v-if="primaryAction(order)" size="small" color="primary" variant="flat" class="font-weight-medium"
            :loading="busyId === order.id" @click="updateStatus(order, primaryAction(order).status)">
            {{ primaryAction(order).label }}
          </v-btn>
        </template>
      </MobileOrderCard>

      <div v-if="orders.hasMore" class="d-flex justify-center mt-2">
        <v-btn variant="outlined" class="load-more-btn" :loading="orders.loading" @click="loadMore">View More</v-btn>
      </div>
    </div>

    <MobileBottomSheet v-model="filtersOpen" title="Filters">
      <v-btn block color="primary" variant="flat" class="font-weight-medium mb-3" @click="cycleDateFilter">
        {{ cycleLabel }}
      </v-btn>
      <v-text-field v-model="fromDate" type="date" label="From" density="compact" class="mb-2"
        @update:model-value="onCustomDateChange" />
      <v-text-field v-model="toDate" type="date" label="To" density="compact"
        @update:model-value="onCustomDateChange" />
    </MobileBottomSheet>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useOrdersStore } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'
import { useBranchSelector } from '@/composables/useBranchSelector'

const orders = useOrdersStore()
const auth = useAuthStore()
const toast = useToast()
const { isSuperAdmin, selectedBranchId, branchOptions } = useBranchSelector()
const { $socket } = useNuxtApp()
const route = useRoute()
const router = useRouter()

const statusFilter = ref(typeof route.query.status === 'string' ? route.query.status : '')
const busyId = ref(null)
const cancellingItemId = ref(null)
const filtersOpen = ref(false)

/* ---------------- Date range filter ---------------- */
function pad(n) { return String(n).padStart(2, '0') }
function toDateStr(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }

const cycleStages = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
]

function shortcutRange(key) {
  const now = new Date()
  const today = toDateStr(now)
  if (key === 'today') return { from: today, to: today }
  if (key === 'week') {
    const day = (now.getDay() + 6) % 7
    const monday = new Date(now)
    monday.setDate(now.getDate() - day)
    return { from: toDateStr(monday), to: today }
  }
  if (key === 'month') {
    const first = new Date(now.getFullYear(), now.getMonth(), 1)
    return { from: toDateStr(first), to: today }
  }
  return { from: '', to: '' }
}

const fromDate = ref(typeof route.query.fromDate === 'string' ? route.query.fromDate : '')
const toDate = ref(typeof route.query.toDate === 'string' ? route.query.toDate : '')
const cycleIndex = ref(0)

if (!route.query.fromDate && !route.query.toDate) {
  const today = shortcutRange('today')
  fromDate.value = today.from
  toDate.value = today.to
}

const cycleLabel = computed(() => cycleStages[cycleIndex.value].label)

function cycleDateFilter() {
  cycleIndex.value = (cycleIndex.value + 1) % cycleStages.length
  const r = shortcutRange(cycleStages[cycleIndex.value].value)
  fromDate.value = r.from
  toDate.value = r.to
  reload()
}

function onCustomDateChange() {
  reload()
}

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

// Mirrors the backend's ORDER_TRANSITION_ROLES in orderService.js - see the
// same note in OrdersMonitor.vue.
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
  return (order.kitchenTickets || []).every((t) => ['COMPLETED', 'CANCELLED'].includes(t.status))
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

function canCancelItem(order, item) {
  return canCancel(order) && !['SERVED', 'CANCELLED'].includes(item.status)
}

async function cancelSingleItem(order, item) {
  cancellingItemId.value = item.id
  try {
    const res = await orders.cancelItems(order.id, [item.id])
    if (res.statusCode !== '00') {
      toast.error(res.message || 'That item could not be cancelled')
    } else {
      toast.success(`${item.menuItem?.name || 'Item'} cancelled`)
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'That item could not be cancelled')
  } finally {
    cancellingItemId.value = null
  }
}

function statusHex(status) {
  return {
    PLACED: '#8B8599', ACCEPTED: '#0EA5E9', PREPARING: '#F59E0B', READY: '#22C55E',
    SERVED: '#7C3AED', COMPLETED: '#22C55E', CANCELLED: '#EF4444',
  }[status] || '#8B8599'
}

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

function currentFilters() {
  return {
    status: statusFilter.value || undefined,
    fromDate: fromDate.value || undefined,
    toDate: toDate.value || undefined,
  }
}

function syncUrl() {
  router.replace({ query: { ...route.query, ...currentFilters() } }).catch(() => {})
}

async function reload() {
  if (!selectedBranchId.value) return
  syncUrl()
  await orders.fetchOrders(selectedBranchId.value, currentFilters())
  $socket.emit('join:branch', selectedBranchId.value)
}

async function loadMore() {
  if (!selectedBranchId.value) return
  await orders.fetchOrders(selectedBranchId.value, currentFilters(), { append: true })
}

function onOrderEvent(order) {
  if (order.branchId && order.branchId !== selectedBranchId.value) return
  orders.upsertOrder(order)
}

onMounted(() => {
  reload()
  $socket.on('order:new', onOrderEvent)
  $socket.on('order:status', onOrderEvent)
  $socket.on('order:updated', onOrderEvent)
})

onBeforeUnmount(() => {
  $socket.off('order:new', onOrderEvent)
  $socket.off('order:status', onOrderEvent)
  $socket.off('order:updated', onOrderEvent)
})

watch(selectedBranchId, (val) => { if (val) reload() })
watch(statusFilter, () => reload())
</script>

<style scoped>
.mobile-status-row {
  overflow-x: auto;
  scrollbar-width: none;
}
.mobile-status-row::-webkit-scrollbar {
  display: none;
}
.item-cancelled-text {
  text-decoration: line-through;
  color: rgba(0, 0, 0, 0.4);
}
</style>
