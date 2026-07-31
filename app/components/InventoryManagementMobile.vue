<template>
  <div class="mobile-shell-page">
    <MobilePageHeader title="Inventory" subtitle="Stock levels for quantity-based items">
      <MobileBranchPicker v-if="isSuperAdmin" v-model="selectedBranchId" :items="branchOptions" />
    </MobilePageHeader>

    <div class="pa-4 pb-0">
      <div class="mobile-stat-grid mb-4">
        <MobileStatCard v-for="tile in summaryTiles" :key="tile.label" :label="tile.label" :value="tile.value" />
      </div>
    </div>

    <MobileSearchBar v-model="search" placeholder="Search items..." :sticky="false">
      <template #chips>
        <v-chip v-for="f in statusFilters" :key="f.value" :color="statusFilter === f.value ? (f.color || 'primary') : undefined"
          :variant="statusFilter === f.value ? 'flat' : 'tonal'" size="small" class="font-weight-medium flex-shrink-0"
          @click="statusFilter = f.value">
          {{ f.label }}
        </v-chip>
      </template>
    </MobileSearchBar>

    <MobileLoading v-if="inventory.loading" :count="3" type="card" />

    <div v-else class="pa-4">
      <MobileEmptyState v-if="!filteredItems.length" icon="mdi-clipboard-list-outline"
        :title="!inventory.items.length ? 'No tracked items yet' : 'No items match your search'"
        :description="!inventory.items.length ? 'Mark an item \'Sold by unit\' in Menu Management to track its stock here.' : ''" />

      <div v-for="item in filteredItems" :key="item.id" class="app-card pa-4 mb-3 inventory-card"
        :class="`inventory-card--${item.stockStatus.toLowerCase()}`">
        <div class="d-flex justify-space-between align-start mb-1">
          <div class="font-weight-bold text-body-2">{{ item.name }}</div>
          <MobileStatusChip :status="statusLabel(item.stockStatus)" :color="statusHex(item.stockStatus)" size="small" />
        </div>
        <div class="d-flex align-center ga-1 mb-3">
          <span class="text-caption text-medium-emphasis">{{ item.category?.name || '—' }}</span>
          <span class="unit-pill">{{ unitShortLabel(item) }}</span>
        </div>

        <template v-if="item.trackInventory">
          <div class="d-flex align-end justify-space-between mb-1">
            <span class="text-h5 font-weight-bold mono-data">{{ item.quantityAvailable }}</span>
            <span class="text-caption text-medium-emphasis mb-1">{{ unitShortLabel(item) }} available</span>
          </div>
          <div class="stock-bar mb-3">
            <div class="stock-bar-fill" :class="`stock-bar-fill--${item.stockStatus.toLowerCase()}`"
              :style="{ width: stockBarWidth(item) + '%' }" />
          </div>

          <div class="d-flex align-center ga-2 mb-2">
            <v-text-field v-model.number="draftQty[item.id]" type="number" density="compact" hide-details
              :suffix="unitShortLabel(item)" min="0" style="max-width: 130px" />
            <v-btn size="small" color="primary" :loading="savingId === item.id" @click="save(item)">Save</v-btn>
          </div>
          <v-text-field v-model="draftReason[item.id]" density="compact" hide-details variant="underlined"
            placeholder="Reason (optional)" class="mb-2" />
        </template>

        <template v-else>
          <div class="unlimited-banner mb-3">
            <v-icon color="white" size="18">mdi-infinity</v-icon>
            <span>Unlimited stock</span>
          </div>
        </template>

        <v-divider class="mb-2" />
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center ga-2">
            <v-switch :model-value="item.trackInventory" density="compact" hide-details color="primary"
              :loading="togglingId === item.id" @update:model-value="(v) => toggleTrack(item, v)" />
            <span class="text-caption font-weight-medium">{{ item.trackInventory ? 'Tracked' : 'Unlimited' }}</span>
          </div>
          <v-btn icon="mdi-history" size="small" variant="text" @click="openHistory(item)" />
        </div>
      </div>
    </div>

    <!-- STOCK HISTORY -->
    <MobileBottomSheet v-model="historyDialog" title="Stock History">
      <p class="text-caption text-medium-emphasis mb-4">{{ historyItem?.name }}</p>

      <div v-if="historyLoading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" />
      </div>
      <div v-else-if="!historyEntries.length" class="text-center text-medium-emphasis py-8">
        No stock adjustments yet
      </div>
      <div v-else class="history-list">
        <div v-for="h in historyEntries" :key="h.id" class="history-row">
          <div class="history-delta" :class="h.delta >= 0 ? 'history-delta--up' : 'history-delta--down'">
            {{ h.delta >= 0 ? '+' : '' }}{{ h.delta }}
          </div>
          <div class="flex-grow-1" style="min-width: 0">
            <div class="text-body-2 font-weight-medium mono-data">
              {{ h.previousQty }} &rarr; {{ h.newQty }} {{ historyItem ? unitShortLabel(historyItem) : '' }}
            </div>
            <div class="text-caption text-medium-emphasis text-truncate">
              {{ h.reason || '—' }}<span v-if="h.actor"> &middot; {{ h.actor.name }}</span>
            </div>
          </div>
          <div class="text-caption text-medium-emphasis flex-shrink-0">{{ formatWhen(h.createdAt) }}</div>
        </div>
      </div>
    </MobileBottomSheet>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useInventoryStore } from '@/stores/inventory'
import { useBranchSelector } from '@/composables/useBranchSelector'
import { useUnitLabel } from '@/composables/useUnitLabel'

const inventory = useInventoryStore()
const toast = useToast()
const { isSuperAdmin, selectedBranchId, branchOptions } = useBranchSelector()
const { unitShortLabel } = useUnitLabel()

const draftQty = reactive({})
const draftReason = reactive({})
const savingId = ref(null)
const togglingId = ref(null)

const search = ref('')
const statusFilter = ref('')
const statusFilters = [
  { value: '', label: 'All' },
  { value: 'IN_STOCK', label: 'In Stock', color: 'success' },
  { value: 'LOW_STOCK', label: 'Low Stock', color: 'warning' },
  { value: 'OUT_OF_STOCK', label: 'Out of Stock', color: 'error' },
  { value: 'UNLIMITED', label: 'Unlimited', color: 'info' },
]

const summaryTiles = computed(() => {
  const s = inventory.summary
  return [
    { label: 'Tracked Items', value: s.total },
    { label: 'In Stock', value: s.inStock },
    { label: 'Low Stock', value: s.lowStock },
    { label: 'Out of Stock', value: s.outOfStock },
    { label: 'Unlimited', value: s.unlimited },
  ]
})

const filteredItems = computed(() => {
  let list = inventory.items
  if (statusFilter.value) list = list.filter((i) => i.stockStatus === statusFilter.value)
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    list = list.filter((i) => i.name.toLowerCase().includes(q))
  }
  return list
})

function statusHex(status) {
  return { IN_STOCK: '#16A34A', LOW_STOCK: '#D97706', OUT_OF_STOCK: '#DC2626', UNLIMITED: '#2563EB' }[status] || '#8B8599'
}
function statusLabel(status) {
  return { IN_STOCK: 'In Stock', LOW_STOCK: 'Low Stock', OUT_OF_STOCK: 'Out of Stock', UNLIMITED: 'Unlimited' }[status] || status
}
function stockBarWidth(item) {
  return Math.max(4, Math.min(100, (item.quantityAvailable / 20) * 100))
}

async function load() {
  if (!selectedBranchId.value) return
  await inventory.fetchStock(selectedBranchId.value)
  for (const item of inventory.items) {
    draftQty[item.id] = item.quantityAvailable
    draftReason[item.id] = ''
  }
}

async function save(item) {
  const qty = Number(draftQty[item.id])
  if (Number.isNaN(qty) || qty < 0) {
    toast.error('Enter a valid non-negative quantity')
    return
  }
  savingId.value = item.id
  try {
    const res = await inventory.setStock(item.id, selectedBranchId.value, qty, draftReason[item.id]?.trim() || undefined)
    if (res.statusCode === '00') {
      toast.success(`${item.name} stock updated`)
      draftReason[item.id] = ''
    } else {
      toast.error(res.message || 'Could not update stock')
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'Could not update stock')
  } finally {
    savingId.value = null
  }
}

async function toggleTrack(item, trackInventory) {
  togglingId.value = item.id
  try {
    const res = await inventory.setTrackInventory(item.id, selectedBranchId.value, trackInventory)
    if (res.statusCode === '00') {
      toast.success(`${item.name} is now ${trackInventory ? 'tracked' : 'unlimited'}`)
    } else {
      toast.error(res.message || 'Could not update this item')
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'Could not update this item')
  } finally {
    togglingId.value = null
  }
}

const historyDialog = ref(false)
const historyItem = ref(null)
const historyEntries = ref([])
const historyLoading = ref(false)

async function openHistory(item) {
  historyItem.value = item
  historyDialog.value = true
  historyLoading.value = true
  try {
    historyEntries.value = await inventory.fetchHistory(item.id, selectedBranchId.value)
  } finally {
    historyLoading.value = false
  }
}

function formatWhen(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString([], { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

onMounted(load)
watch(selectedBranchId, (val) => { if (val) load() })
</script>

<style scoped>
.mobile-stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.mobile-stat-grid > * {
  min-width: 0;
}
.inventory-card {
  border-top: 3px solid #E5E0F0 !important;
}
.inventory-card--in_stock { border-top-color: #16A34A !important; }
.inventory-card--low_stock { border-top-color: #D97706 !important; }
.inventory-card--out_of_stock { border-top-color: #DC2626 !important; }
.inventory-card--unlimited { border-top-color: #2563EB !important; }

.unit-pill {
  background: #F3EEFF;
  color: #7C3AED;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 1px 8px;
  border-radius: 999px;
}
.stock-bar {
  height: 6px;
  border-radius: 999px;
  background: #F0EDF5;
  overflow: hidden;
}
.stock-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.2s ease;
}
.stock-bar-fill--in_stock { background: #16A34A; }
.stock-bar-fill--low_stock { background: #D97706; }
.stock-bar-fill--out_of_stock { background: #DC2626; }

.unlimited-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
  color: #fff;
  font-weight: 700;
  font-size: 0.875rem;
}
.history-list {
  max-height: 360px;
  overflow-y: auto;
}
.history-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 4px;
  border-bottom: 1px solid #F0EDF5;
}
.history-row:last-child {
  border-bottom: none;
}
.history-delta {
  min-width: 48px;
  text-align: center;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 4px 6px;
  border-radius: 8px;
  flex-shrink: 0;
}
.history-delta--up { background: #DCFCE7; color: #16A34A; }
.history-delta--down { background: #FEE2E2; color: #DC2626; }
</style>
