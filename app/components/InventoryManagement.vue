<template>
  <v-container fluid class="pa-6">
    <div class="app-header-bar d-flex flex-wrap align-center justify-space-between mb-6 px-5 py-4 ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-0">Inventory</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">Stock levels for quantity-based menu items - tracked per branch</p>
      </div>
      <v-select v-if="isSuperAdmin" v-model="selectedBranchId" :items="branchOptions" label="Branch"
        density="compact" hide-details style="max-width: 220px" />
    </div>

    <v-row>
      <v-col v-for="item in inventory.items" :key="item.id" cols="12" sm="6" md="4" lg="3">
        <div class="app-card pa-4 h-100 d-flex flex-column">
          <div class="d-flex justify-space-between align-start mb-1">
            <div class="font-weight-bold">{{ item.name }}</div>
            <v-chip size="x-small" :color="stockColor(item)" variant="tonal">{{ stockLabel(item) }}</v-chip>
          </div>
          <div class="text-caption text-medium-emphasis mb-3">{{ item.category?.name || '—' }}</div>

          <v-spacer />

          <div class="d-flex align-center ga-2">
            <v-text-field v-model.number="draftQty[item.id]" type="number" density="compact" hide-details
              :suffix="unitShortLabel(item)" min="0" />
            <v-btn size="small" color="primary" :loading="savingId === item.id" @click="save(item)">Save</v-btn>
          </div>
        </div>
      </v-col>

      <v-col v-if="!inventory.loading && !inventory.items.length" cols="12">
        <div class="app-card pa-10 text-center text-medium-emphasis">
          No quantity-based items yet - mark an item "Sold by unit" in Menu Management to track its stock here.
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useInventoryStore } from '@/stores/inventory'
import { useBranchSelector } from '@/composables/useBranchSelector'
import { useUnitLabel } from '@/composables/useUnitLabel'

const inventory = useInventoryStore()
const toast = useToast()
const { isSuperAdmin, selectedBranchId, branchOptions } = useBranchSelector()
const { unitShortLabel } = useUnitLabel()

const draftQty = reactive({})
const savingId = ref(null)

function stockLabel(item) {
  if (item.quantityAvailable <= 0) return 'Out of stock'
  if (item.quantityAvailable < 5) return 'Low stock'
  return 'In stock'
}
function stockColor(item) {
  if (item.quantityAvailable <= 0) return 'error'
  if (item.quantityAvailable < 5) return 'warning'
  return 'success'
}

async function load() {
  if (!selectedBranchId.value) return
  await inventory.fetchStock(selectedBranchId.value)
  for (const item of inventory.items) draftQty[item.id] = item.quantityAvailable
}

async function save(item) {
  const qty = Number(draftQty[item.id])
  if (Number.isNaN(qty) || qty < 0) {
    toast.error('Enter a valid non-negative quantity')
    return
  }
  savingId.value = item.id
  try {
    const res = await inventory.setStock(item.id, selectedBranchId.value, qty)
    if (res.statusCode === '00') toast.success(`${item.name} stock updated`)
    else toast.error(res.message || 'Could not update stock')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Could not update stock')
  } finally {
    savingId.value = null
  }
}

onMounted(load)
watch(selectedBranchId, (val) => { if (val) load() })
</script>
