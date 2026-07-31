<template>
  <v-container fluid class="pa-4 pa-md-6">
    <div class="app-header-bar d-flex flex-wrap align-center justify-space-between mb-6 px-5 py-4 ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-0">Inventory</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">Stock levels for quantity-based menu items - tracked per branch</p>
      </div>
      <v-select v-if="isSuperAdmin" v-model="selectedBranchId" :items="branchOptions" label="Branch"
        density="compact" hide-details style="max-width: 220px" />
    </div>

    <!-- Summary tiles -->
    <div class="summary-grid mb-6">
      <div v-for="tile in summaryTiles" :key="tile.label" class="app-card summary-tile pa-4">
        <div class="summary-tile-icon" :style="{ background: tile.color }">
          <v-icon color="white" size="20">{{ tile.icon }}</v-icon>
        </div>
        <div>
          <div class="text-h5 font-weight-bold mono-data">{{ tile.value }}</div>
          <div class="text-caption text-medium-emphasis">{{ tile.label }}</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="d-flex flex-wrap align-center ga-3 mb-5">
      <v-text-field v-model="search" placeholder="Search items..." prepend-inner-icon="mdi-magnify"
        density="comfortable" hide-details clearable style="max-width: 280px" />
      <div class="d-flex flex-wrap ga-2 status-filter-scroll">
        <v-chip v-for="f in statusFilters" :key="f.value" :color="statusFilter === f.value ? f.color || 'primary' : undefined"
          :variant="statusFilter === f.value ? 'flat' : 'tonal'" class="font-weight-medium" @click="statusFilter = f.value">
          {{ f.label }}
        </v-chip>
      </div>
    </div>

    <div v-if="inventory.loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-row v-else>
      <v-col v-for="item in filteredItems" :key="item.id" cols="12" sm="6" md="4" lg="3">
        <div class="app-card pa-4 h-100 d-flex flex-column inventory-card" :class="`inventory-card--${item.stockStatus.toLowerCase()}`">
          <div class="d-flex justify-space-between align-start mb-1">
            <div class="font-weight-bold text-body-1">{{ item.name }}</div>
            <v-chip size="x-small" :color="statusColor(item.stockStatus)" variant="tonal" class="flex-shrink-0 ms-2">
              {{ statusLabel(item.stockStatus) }}
            </v-chip>
          </div>
          <div class="d-flex align-center ga-1 mb-3">
            <span class="text-caption text-medium-emphasis">{{ item.category?.name || '—' }}</span>
            <span class="unit-pill">{{ unitShortLabel(item) }}</span>
          </div>

          <v-spacer />

          <template v-if="item.trackInventory">
            <div class="d-flex align-end justify-space-between mb-1">
              <span class="text-h4 font-weight-bold mono-data">{{ item.quantityAvailable }}</span>
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
      </v-col>

      <v-col v-if="!filteredItems.length" cols="12">
        <div class="app-card pa-10 text-center text-medium-emphasis">
          <template v-if="!inventory.items.length">
            No quantity-based items yet - mark an item "Sold by unit" in Menu Management to track its stock here.
          </template>
          <template v-else>No items match your search/filter</template>
        </div>
      </v-col>
    </v-row>

    <!-- Stock history dialog -->
    <v-dialog v-model="historyDialog" max-width="480">
      <v-card class="pa-4">
        <div class="d-flex justify-space-between align-center mb-1">
          <h3 class="text-h6 font-weight-bold">Stock History</h3>
          <v-btn icon="mdi-close" variant="text" size="small" @click="historyDialog = false" />
        </div>
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
      </v-card>
    </v-dialog>
  </v-container>
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
    { label: 'Tracked Items', value: s.total, icon: 'mdi-clipboard-list-outline', color: '#7C3AED' },
    { label: 'In Stock', value: s.inStock, icon: 'mdi-check-circle-outline', color: '#16A34A' },
    { label: 'Low Stock', value: s.lowStock, icon: 'mdi-alert-outline', color: '#D97706' },
    { label: 'Out of Stock', value: s.outOfStock, icon: 'mdi-close-circle-outline', color: '#DC2626' },
    { label: 'Unlimited', value: s.unlimited, icon: 'mdi-infinity', color: '#2563EB' },
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

function statusColor(status) {
  return { IN_STOCK: 'success', LOW_STOCK: 'warning', OUT_OF_STOCK: 'error', UNLIMITED: 'info' }[status] || 'grey'
}
function statusLabel(status) {
  return { IN_STOCK: 'In Stock', LOW_STOCK: 'Low Stock', OUT_OF_STOCK: 'Out of Stock', UNLIMITED: 'Unlimited' }[status] || status
}
function stockBarWidth(item) {
  // Purely visual reference scale (not tied to a configurable max) - fills
  // up to 20 units' worth so low/healthy stock is easy to scan at a glance.
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
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}
.summary-tile {
  display: flex;
  align-items: center;
  gap: 12px;
}
.summary-tile-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.status-filter-scroll {
  overflow-x: auto;
  flex-wrap: nowrap;
}

.inventory-card {
  border-top: 3px solid #E5E0F0 !important;
}
.inventory-card--in_stock {
  border-top-color: #16A34A !important;
}
.inventory-card--low_stock {
  border-top-color: #D97706 !important;
}
.inventory-card--out_of_stock {
  border-top-color: #DC2626 !important;
}
.inventory-card--unlimited {
  border-top-color: #2563EB !important;
}

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
.stock-bar-fill--in_stock {
  background: #16A34A;
}
.stock-bar-fill--low_stock {
  background: #D97706;
}
.stock-bar-fill--out_of_stock {
  background: #DC2626;
}

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
.history-delta--up {
  background: #DCFCE7;
  color: #16A34A;
}
.history-delta--down {
  background: #FEE2E2;
  color: #DC2626;
}

@media (max-width: 600px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
