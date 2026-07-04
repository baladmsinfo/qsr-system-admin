<template>
  <v-container fluid class="pa-6">
    <div class="app-header-bar d-flex flex-wrap align-center justify-space-between mb-6 px-5 py-4 ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-0">Tables &amp; QR Codes</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">Each table has its own QR - customers scan it to open the menu</p>
      </div>
      <div class="d-flex ga-3 align-center">
        <v-select v-if="isSuperAdmin" v-model="selectedBranchId" :items="branchOptions" label="Branch"
          density="compact" hide-details style="max-width: 220px" />
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">Add Table</v-btn>
      </div>
    </div>

    <v-row>
      <v-col v-for="table in tableStore.tables" :key="table.id" cols="12" sm="6" md="4" lg="3">
        <div class="app-card pa-4 text-center">
          <div class="d-flex justify-space-between align-start mb-2">
            <v-chip size="small" :color="table.active ? 'success' : 'grey'" variant="tonal">
              {{ table.active ? 'Active' : 'Inactive' }}
            </v-chip>
            <span class="text-caption text-medium-emphasis">Seats {{ table.capacity || '-' }}</span>
          </div>

          <h3 class="text-h6 font-weight-bold mb-3">{{ table.tableNo }}</h3>

          <v-img :src="qrImages[table.id]" width="160" height="160" class="mx-auto mb-3 rounded-lg" style="border: 1px solid #EAE6F2" />

          <div class="d-flex justify-center ga-2">
            <v-btn size="small" variant="tonal" icon="mdi-pencil" @click="openDialog(table)" />
            <v-btn size="small" variant="tonal" icon="mdi-qrcode-scan" @click="regenerate(table)" />
            <v-btn size="small" variant="tonal" icon="mdi-printer" @click="printQr(table)" />
            <v-btn size="small" variant="tonal" color="error" icon="mdi-delete" @click="confirmDelete(table)" />
          </div>
        </div>
      </v-col>

      <v-col v-if="!tableStore.tables.length" cols="12">
        <div class="app-card pa-10 text-center text-medium-emphasis">No tables yet</div>
      </v-col>
    </v-row>

    <!-- ADD/EDIT DIALOG -->
    <v-dialog v-model="dialog" max-width="420">
      <v-card>
        <v-card-title>{{ form.id ? 'Edit Table' : 'Add Table' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.tableNo" label="Table Number / Name" />
          <v-text-field v-model.number="form.capacity" label="Seating Capacity" type="number" />
          <v-switch v-if="form.id" v-model="form.active" label="Active" color="success" />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="tableStore.loading" @click="submitForm">
            {{ form.id ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DELETE CONFIRM -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Delete Table?</v-card-title>
        <v-card-text>This will also disable its QR code.</v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="performDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
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
