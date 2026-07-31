<template>
  <div class="mobile-shell-page">
    <MobilePageHeader title="Tables & QR Codes" subtitle="Each table has its own QR code">
      <MobileBranchPicker v-if="isSuperAdmin" v-model="selectedBranchId" :items="branchOptions" />
    </MobilePageHeader>

    <div class="pa-4">
      <MobileEmptyState v-if="!tableStore.tables.length" icon="mdi-table-chair" title="No tables yet"
        description="Add your first table to generate its QR code.">
        <template #action>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">Add Table</v-btn>
        </template>
      </MobileEmptyState>

      <div v-else class="mobile-table-grid">
        <div v-for="table in tableStore.tables" :key="table.id" class="app-card pa-3 text-center">
          <div class="d-flex justify-space-between align-start mb-2">
            <MobileStatusChip :status="table.active ? 'Active' : 'Inactive'" :color="table.active ? '#16A34A' : '#6B7280'" size="small" />
            <span class="text-caption text-medium-emphasis">Seats {{ table.capacity || '-' }}</span>
          </div>

          <h3 class="text-subtitle-1 font-weight-bold mb-2">{{ table.tableNo }}</h3>

          <v-img :src="qrImages[table.id]" width="100" height="100" class="mx-auto mb-3 rounded-lg" style="border: 1px solid #EEE9F7" />

          <div class="d-flex justify-center ga-1 flex-wrap">
            <v-btn size="x-small" variant="tonal" icon="mdi-pencil" @click="openDialog(table)" />
            <v-btn size="x-small" variant="tonal" icon="mdi-qrcode-scan" @click="regenerate(table)" />
            <v-btn size="x-small" variant="tonal" icon="mdi-printer" @click="printQr(table)" />
            <v-btn size="x-small" variant="tonal" color="error" icon="mdi-delete" @click="confirmDelete(table)" />
          </div>
        </div>
      </div>
    </div>

    <MobileActionBar v-if="tableStore.tables.length">
      <v-btn block size="large" color="primary" prepend-icon="mdi-plus" class="font-weight-bold" @click="openDialog()">
        Add Table
      </v-btn>
    </MobileActionBar>

    <!-- ADD/EDIT -->
    <MobileBottomSheet v-model="dialog" :title="form.id ? 'Edit Table' : 'Add Table'">
      <v-text-field v-model="form.tableNo" label="Table Number / Name" class="mb-2" />
      <v-text-field v-model.number="form.capacity" label="Seating Capacity" type="number" class="mb-2" />
      <v-switch v-if="form.id" v-model="form.active" label="Active" color="success" hide-details class="mb-3" />
      <v-btn block size="large" color="primary" class="font-weight-bold" :loading="tableStore.loading" @click="submitForm">
        {{ form.id ? 'Update' : 'Create' }}
      </v-btn>
    </MobileBottomSheet>

    <!-- DELETE CONFIRM -->
    <MobileBottomSheet v-model="deleteDialog" title="Delete Table?">
      <p class="text-body-2 text-medium-emphasis mb-4">This will also disable its QR code.</p>
      <v-btn block size="large" color="error" class="font-weight-bold" @click="performDelete">Delete</v-btn>
    </MobileBottomSheet>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import QRCode from 'qrcode'
import { useTableStore } from '@/stores/tables'
import { useBranchSelector } from '@/composables/useBranchSelector'

const tableStore = useTableStore()
const { isSuperAdmin, selectedBranchId, branchOptions } = useBranchSelector()
const config = useRuntimeConfig()

const qrImages = reactive({})

async function buildQrImages() {
  for (const table of tableStore.tables) {
    const menuUrl = `${config.public.CUSTOMER_URL}/t/${table.qrCode}`
    qrImages[table.id] = await QRCode.toDataURL(menuUrl, { width: 200, margin: 1 })
  }
}

async function load() {
  if (!selectedBranchId.value) return
  await tableStore.fetchTables(selectedBranchId.value)
  await buildQrImages()
}

const dialog = ref(false)
const form = ref({ id: null, tableNo: '', capacity: 4, active: true })

function openDialog(table = null) {
  form.value = table ? { ...table } : { id: null, tableNo: '', capacity: 4, active: true }
  dialog.value = true
}

async function submitForm() {
  if (form.value.id) await tableStore.updateTable(form.value.id, form.value)
  else await tableStore.createTable(selectedBranchId.value, form.value)
  dialog.value = false
  await load()
}

async function regenerate(table) {
  await tableStore.regenerateQr(table.id, selectedBranchId.value)
  await buildQrImages()
}

function printQr(table) {
  const win = window.open('', '_blank')
  win.document.write(`
    <html><body style="text-align:center;font-family:sans-serif;padding:40px">
      <h2>${table.tableNo}</h2>
      <img src="${qrImages[table.id]}" width="240" />
      <p>Scan to view menu &amp; order</p>
    </body></html>
  `)
  win.document.close()
  win.print()
}

const deleteDialog = ref(false)
const deleteTarget = ref(null)
function confirmDelete(table) {
  deleteTarget.value = table
  deleteDialog.value = true
}
async function performDelete() {
  await tableStore.deleteTable(deleteTarget.value.id, selectedBranchId.value)
  deleteDialog.value = false
}

onMounted(load)
watch(selectedBranchId, (val) => { if (val) load() })
</script>

<style scoped>
.mobile-table-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding-bottom: 88px;
}
.mobile-table-grid > * {
  min-width: 0;
}
</style>
