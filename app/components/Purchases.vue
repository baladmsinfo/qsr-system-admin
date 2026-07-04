<template>
  <v-container fluid class="pa-6">
    <v-sheet elevation="0" class="d-flex align-center justify-space-between mb-6 px-4 py-3 bg-surface rounded-lg">
      <div>
        <h2 class="text-h5 font-weight-bold mb-0">Purchases</h2>
        <p class="text-body-2 text-medium-emphasis">Ingredient &amp; supply purchases from vendors</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">Record Purchase</v-btn>
    </v-sheet>

    <v-data-table-server :headers="headers" :items="purchaseStore.purchases" :items-length="purchaseStore.total"
      v-model:page="page" v-model:items-per-page="purchaseStore.take" :loading="purchaseStore.loading"
      class="elevation-1 rounded-lg">
      <template #item.vendor="{ item }">{{ item.vendor?.name }}</template>
      <template #item.date="{ item }">{{ new Date(item.date).toLocaleDateString() }}</template>
      <template #item.totalAmount="{ item }">{{ $formatPrice(item.totalAmount) }}</template>
      <template #item.actions="{ item }">
        <v-icon size="20" color="error" @click="confirmDelete(item)">mdi-delete</v-icon>
      </template>
    </v-data-table-server>

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

const headers = [
  { title: 'Vendor', key: 'vendor' },
  { title: 'Date', key: 'date' },
  { title: 'Amount', key: 'amount' },
  { title: 'Total', key: 'totalAmount' },
  { title: 'Note', key: 'note' },
  { title: 'Actions', key: 'actions', sortable: false },
]

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
