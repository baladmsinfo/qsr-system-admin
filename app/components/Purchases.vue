<template>
  <v-container fluid class="pa-6">
    <div class="app-header-bar d-flex flex-wrap align-center justify-space-between mb-6 px-5 py-4 ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-0">Purchases</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">Ingredient &amp; supply purchases from vendors</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">Record Purchase</v-btn>
    </div>

    <v-row>
      <v-col v-for="p in displayedPurchases" :key="p.id" cols="12" sm="6" lg="4">
        <div class="app-card pa-5 h-100 d-flex flex-column">
          <div class="d-flex justify-space-between align-start mb-2">
            <div>
              <div class="font-weight-bold">{{ p.vendor?.name || '—' }}</div>
              <div class="text-caption text-medium-emphasis">{{ new Date(p.date).toLocaleDateString() }}</div>
            </div>
            <v-btn size="small" variant="text" icon="mdi-delete" color="error" @click="confirmDelete(p)" />
          </div>
          <div v-if="p.note" class="text-body-2 text-medium-emphasis mb-2">{{ p.note }}</div>
          <v-spacer />
          <div class="d-flex justify-space-between align-center mt-2">
            <span class="text-caption text-medium-emphasis">Amount</span>
            <span class="font-weight-bold mono-data">{{ $formatPrice(p.totalAmount) }}</span>
          </div>
        </div>
      </v-col>

      <v-col v-if="!displayedPurchases.length" cols="12">
        <div class="app-card pa-10 text-center text-medium-emphasis">No purchases recorded yet</div>
      </v-col>
    </v-row>

    <div v-if="displayedPurchases.length < purchaseStore.total" class="d-flex justify-center mt-6">
      <v-btn variant="outlined" class="load-more-btn" :loading="purchaseStore.loading" @click="page += 1">View More</v-btn>
    </div>

    <v-dialog v-model="dialog" max-width="480">
      <v-card>
        <v-card-title>Record Purchase</v-card-title>
        <v-card-text>
          <v-select v-model="form.vendorId" :items="vendorOptions" label="Vendor" />
          <v-text-field v-model="form.date" label="Date" type="date" />
          <v-text-field v-model.number="form.amount" label="Amount" type="number" prefix="₹" />
          <v-select v-model="form.taxRateId" :items="taxOptions" label="Tax Rate (optional)" clearable />
          <v-textarea v-model="form.note" label="Note" rows="2" />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="purchaseStore.loading" @click="submitForm">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Delete Purchase?</v-card-title>
        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="performDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
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
