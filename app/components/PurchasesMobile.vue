<template>
  <div class="mobile-shell-page">
    <MobilePageHeader title="Purchases" subtitle="Ingredient & supply purchases" />

    <div class="pa-4">
      <MobileEmptyState v-if="!displayedPurchases.length" icon="mdi-cart-arrow-down" title="No purchases recorded yet"
        description="Tap Record Purchase below to log your first purchase.">
        <template #action>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">Record Purchase</v-btn>
        </template>
      </MobileEmptyState>

      <MobileOrderCard v-for="p in displayedPurchases" :key="p.id" :title="p.vendor?.name || '—'"
        :subtitle="new Date(p.date).toLocaleDateString()" class="mb-3">
        <template #status>
          <v-btn size="small" variant="text" icon="mdi-delete" color="error" @click="confirmDelete(p)" />
        </template>
        <span v-if="p.note">{{ p.note }}</span>
        <div class="d-flex justify-space-between align-center mt-2">
          <span class="text-caption text-medium-emphasis">Amount</span>
          <span class="text-subtitle-1 font-weight-bold mono-data">{{ $formatPrice(p.totalAmount) }}</span>
        </div>
      </MobileOrderCard>

      <div v-if="displayedPurchases.length < purchaseStore.total" class="d-flex justify-center mt-2 mb-4">
        <v-btn variant="outlined" class="load-more-btn" :loading="purchaseStore.loading" @click="page += 1">View More</v-btn>
      </div>
    </div>

    <MobileActionBar v-if="displayedPurchases.length">
      <v-btn block size="large" color="primary" prepend-icon="mdi-plus" class="font-weight-bold" @click="openDialog()">
        Record Purchase
      </v-btn>
    </MobileActionBar>

    <MobileBottomSheet v-model="dialog" title="Record Purchase">
      <v-select v-model="form.vendorId" :items="vendorOptions" label="Vendor" class="mb-2" />
      <v-text-field v-model="form.date" label="Date" type="date" class="mb-2" />
      <v-text-field v-model.number="form.amount" label="Amount" type="number" prefix="₹" class="mb-2" />
      <v-select v-model="form.taxRateId" :items="taxOptions" label="Tax Rate (optional)" clearable class="mb-2" />
      <v-textarea v-model="form.note" label="Note" rows="2" class="mb-3" />
      <v-btn block size="large" color="primary" class="font-weight-bold" :loading="purchaseStore.loading" @click="submitForm">Save</v-btn>
    </MobileBottomSheet>

    <MobileBottomSheet v-model="deleteDialog" title="Delete Purchase?">
      <v-btn block size="large" color="error" class="font-weight-bold" @click="performDelete">Delete</v-btn>
    </MobileBottomSheet>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { usePurchaseStore } from '@/stores/purchases'
import { useVendorStore } from '@/stores/vendor'
import { useTaxStore } from '@/stores/tax'

const purchaseStore = usePurchaseStore()
const vendorStore = useVendorStore()
const taxStore = useTaxStore()

const page = ref(1)

const displayedPurchases = ref([])
watch(() => purchaseStore.purchases, (list) => {
  displayedPurchases.value = page.value === 1 ? list : [...displayedPurchases.value, ...list]
})

const vendorOptions = computed(() => vendorStore.vendors.map((v) => ({ title: v.name, value: v.id })))
const taxOptions = computed(() => taxStore.taxes.map((t) => ({ title: `${t.name} (${t.rate}%)`, value: t.id })))

const dialog = ref(false)
const form = ref({ vendorId: null, date: new Date().toISOString().slice(0, 10), amount: 0, taxRateId: null, note: '' })

function openDialog() {
  form.value = { vendorId: null, date: new Date().toISOString().slice(0, 10), amount: 0, taxRateId: null, note: '' }
  dialog.value = true
}

async function submitForm() {
  await purchaseStore.createPurchase(form.value)
  dialog.value = false
}

const deleteDialog = ref(false)
const deleteTarget = ref(null)
function confirmDelete(item) {
  deleteTarget.value = item
  deleteDialog.value = true
}
async function performDelete() {
  await purchaseStore.deletePurchase(deleteTarget.value.id)
  deleteDialog.value = false
}

watch(page, (p) => purchaseStore.fetchPurchases(p, purchaseStore.take))

onMounted(async () => {
  await purchaseStore.fetchPurchases()
  await vendorStore.fetchVendors(1, 100)
  await taxStore.fetchTaxes()
})
</script>
