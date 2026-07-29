<template>
  <v-container fluid class="pa-6">
    <div class="app-header-bar d-flex flex-wrap align-center justify-space-between mb-6 px-5 py-4 ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-0">Printers</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Manage POS terminal printers - Network, USB, Bluetooth, WebUSB, WebSerial and System/AirPrint
        </p>
      </div>
      <div class="d-flex ga-2">
        <v-btn variant="tonal" prepend-icon="mdi-tune" @click="profilesDialog = true">Printer Profiles</v-btn>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">Add Printer</v-btn>
      </div>
    </div>

    <v-row>
      <v-col cols="12" md="6" lg="4" v-for="p in store.printers" :key="p.id">
        <div class="app-card pa-5">
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="font-weight-bold text-subtitle-1">{{ p.name }}</span>
            <div class="d-flex ga-1">
              <v-chip v-if="p.isDefault" color="primary" size="small" variant="tonal">Default</v-chip>
              <v-chip :color="p.isActive ? 'success' : 'default'" size="small" variant="tonal">{{ p.isActive ? 'Active' : 'Disabled' }}</v-chip>
            </div>
          </div>
          <v-chip size="small" variant="outlined" class="mb-2">{{ p.connectionType }}</v-chip>
          <p class="text-caption text-medium-emphasis mb-1">Profile: {{ p.printerProfile?.name || 'Default (80mm)' }}</p>
          <p class="text-caption text-medium-emphasis mb-3">{{ connectionSummary(p) }}</p>

          <v-alert v-if="testResult[p.id]" :type="testResult[p.id].ok ? 'success' : 'error'" density="compact" variant="tonal" class="mb-3">
            {{ testResult[p.id].message }}
          </v-alert>

          <div class="d-flex flex-wrap ga-2">
            <v-btn
              v-if="needsConnect(p) && !connectedDrivers[p.id]"
              size="small"
              variant="tonal"
              :loading="connecting === p.id"
              @click="connectDevice(p)"
            >
              Connect Device
            </v-btn>
            <v-btn size="small" color="primary" variant="tonal" :loading="testingId === p.id" :disabled="needsConnect(p) && !connectedDrivers[p.id]" @click="testPrint(p)">
              Test Print
            </v-btn>
            <v-btn size="small" variant="text" @click="openDialog(p)">Edit</v-btn>
            <v-btn size="small" variant="text" color="error" @click="remove(p)">Remove</v-btn>
          </div>
        </div>
      </v-col>

      <v-col v-if="!store.loading && store.printers.length === 0" cols="12">
        <div class="app-card pa-10 text-center text-medium-emphasis">
          No printers configured yet.
        </div>
      </v-col>
    </v-row>

    <div class="d-flex justify-center mt-6" v-if="store.loading">
      <v-progress-circular indeterminate size="36" />
    </div>

    <!-- Add/Edit Printer -->
    <v-dialog v-model="dialog" width="560">
      <v-card class="pa-4">
        <v-card-title class="font-weight-bold text-h6">{{ form.id ? 'Edit Printer' : 'Add Printer' }}</v-card-title>
        <v-divider class="my-2" />
        <v-card-text>
          <v-text-field v-model="form.name" label="Printer Name" variant="outlined" />
          <v-select v-model="form.connectionType" :items="CONNECTION_TYPES" label="Connection Type" variant="outlined" />

          <template v-if="form.connectionType === 'NETWORK'">
            <v-text-field v-model="form.connectionConfig.ip" label="IP Address" variant="outlined" placeholder="192.168.1.50" />
            <v-text-field v-model.number="form.connectionConfig.port" label="Port" variant="outlined" type="number" placeholder="9100" />
          </template>

          <template v-if="form.connectionType === 'BLUETOOTH'">
            <v-alert type="info" density="compact" variant="tonal" class="mb-3">
              Bluetooth printers have no universal service UUID - find these values in your printer's manual/spec sheet.
            </v-alert>
            <v-text-field v-model="form.connectionConfig.serviceUuid" label="GATT Service UUID" variant="outlined" />
            <v-text-field v-model="form.connectionConfig.characteristicUuid" label="GATT Characteristic UUID" variant="outlined" />
          </template>

          <v-select v-model="form.printerProfileId" :items="profileItems" label="Printer Profile" variant="outlined" clearable />
          <v-switch v-model="form.isDefault" label="Set as default printer" color="primary" />
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="submit">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Printer Profiles -->
    <v-dialog v-model="profilesDialog" width="640">
      <v-card class="pa-4">
        <v-card-title class="font-weight-bold text-h6 d-flex justify-space-between align-center">
          Printer Profiles
          <v-btn size="small" color="primary" variant="tonal" prepend-icon="mdi-plus" @click="openProfileDialog()">Add</v-btn>
        </v-card-title>
        <v-divider class="my-2" />
        <v-card-text>
          <v-list>
            <v-list-item v-for="prof in store.profiles" :key="prof.id">
              <v-list-item-title>{{ prof.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ prof.paperWidthMm }}mm - {{ prof.charsPerLine }} chars/line</v-list-item-subtitle>
              <template #append>
                <v-btn size="small" variant="text" @click="openProfileDialog(prof)">Edit</v-btn>
                <v-btn size="small" variant="text" color="error" @click="removeProfile(prof)">Remove</v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="profileDialog" width="480">
      <v-card class="pa-4">
        <v-card-title class="font-weight-bold text-h6">{{ profileForm.id ? 'Edit Profile' : 'Add Profile' }}</v-card-title>
        <v-divider class="my-2" />
        <v-card-text>
          <v-text-field v-model="profileForm.name" label="Profile Name" variant="outlined" />
          <v-select v-model="profileForm.paperWidthMm" :items="[58, 80]" label="Paper Width (mm)" variant="outlined" />
          <v-text-field v-model.number="profileForm.charsPerLine" label="Characters Per Line" variant="outlined" type="number" />
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
          <v-btn variant="text" @click="profileDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="savingProfile" @click="submitProfile">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { usePrinterStore } from '@/stores/printers'
import { usePrintHistoryStore } from '@/stores/printHistory'
import { getDriverFor, isDriverSupported } from '@/composables/printerDrivers'

const CONNECTION_TYPES = ['NETWORK', 'USB', 'BLUETOOTH', 'WEBUSB', 'WEBSERIAL', 'SYSTEM']

const store = usePrinterStore()
const historyStore = usePrintHistoryStore()

const dialog = ref(false)
const saving = ref(false)
const form = ref(emptyForm())

const profilesDialog = ref(false)
const profileDialog = ref(false)
const savingProfile = ref(false)
const profileForm = ref({ id: null, name: '', paperWidthMm: 80, charsPerLine: 48 })

const testingId = ref(null)
const connecting = ref(null)
const testResult = reactive({})
const connectedDrivers = reactive({})

const profileItems = computed(() => store.profiles.map((p) => ({ title: p.name, value: p.id })))

function emptyForm() {
  return { id: null, name: '', connectionType: 'NETWORK', connectionConfig: {}, printerProfileId: null, isDefault: false }
}

function connectionSummary(p) {
  if (p.connectionType === 'NETWORK') return `${p.connectionConfig?.ip || '?'}:${p.connectionConfig?.port || 9100}`
  if (p.connectionType === 'BLUETOOTH') return p.connectionConfig?.serviceUuid ? 'GATT service configured' : 'Not configured'
  return 'Configured via device picker on this device'
}

function needsConnect(p) {
  return ['USB', 'WEBUSB', 'WEBSERIAL', 'BLUETOOTH'].includes(p.connectionType)
}

function openDialog(printer) {
  form.value = printer
    ? { id: printer.id, name: printer.name, connectionType: printer.connectionType, connectionConfig: { ...printer.connectionConfig }, printerProfileId: printer.printerProfileId, isDefault: printer.isDefault }
    : emptyForm()
  dialog.value = true
}

async function submit() {
  if (!form.value.name) return alert('Printer name is required')
  saving.value = true
  try {
    await store.savePrinter(form.value)
    dialog.value = false
  } catch (err) {
    alert(err.message || 'Failed to save printer')
  }
  saving.value = false
}

async function remove(p) {
  if (!confirm(`Remove "${p.name}"?`)) return
  try {
    await store.removePrinter(p.id)
  } catch (err) {
    alert(err.message || 'Failed to remove printer')
  }
}

function openProfileDialog(profile) {
  profileForm.value = profile ? { ...profile } : { id: null, name: '', paperWidthMm: 80, charsPerLine: 48 }
  profileDialog.value = true
}

async function submitProfile() {
  if (!profileForm.value.name) return alert('Profile name is required')
  savingProfile.value = true
  try {
    await store.saveProfile(profileForm.value)
    profileDialog.value = false
  } catch (err) {
    alert(err.message || 'Failed to save profile')
  }
  savingProfile.value = false
}

async function removeProfile(profile) {
  if (!confirm(`Remove profile "${profile.name}"?`)) return
  try {
    await store.removeProfile(profile.id)
  } catch (err) {
    alert(err.message || 'Failed to remove profile')
  }
}

// Client-held connection types need a real device picker gesture before any
// print can happen - see composables/printerDrivers/README-shaped comments
// in webBluetoothDriver.js/webUsbDriver.js for why this can't be automated.
async function connectDevice(p) {
  if (!isDriverSupported(p.connectionType)) {
    testResult[p.id] = { ok: false, message: 'This browser/platform does not support this connection type.' }
    return
  }
  connecting.value = p.id
  try {
    const driver = getDriverFor(p)
    const target = await driver.requestNewDevice(p.connectionConfig)
    await driver.connect(target, p.connectionConfig)
    connectedDrivers[p.id] = driver
    testResult[p.id] = { ok: true, message: `Connected to ${target.name || 'device'}.` }
  } catch (err) {
    testResult[p.id] = { ok: false, message: err.message || 'Failed to connect' }
  }
  connecting.value = null
}

async function testPrint(p) {
  testingId.value = p.id
  try {
    const result = await store.testPrint(p.id)
    if (result.mode === 'server') {
      testResult[p.id] = { ok: true, message: 'Test print sent to the printer.' }
    } else {
      const driver = connectedDrivers[p.id] || getDriverFor(p)
      const bytes = Uint8Array.from(atob(result.payload), (c) => c.charCodeAt(0))
      await driver.print(bytes)
      testResult[p.id] = { ok: true, message: 'Test print sent locally.' }
      await historyStore.reportResult({ printerId: p.id, format: 'ESC_POS', status: 'SUCCESS' })
    }
  } catch (err) {
    testResult[p.id] = { ok: false, message: err.message || 'Test print failed' }
    await historyStore.reportResult({ printerId: p.id, format: 'ESC_POS', status: 'FAILED', errorMessage: err.message }).catch(() => {})
  }
  testingId.value = null
}

onMounted(() => {
  store.fetchPrinters()
  store.fetchProfiles()
})
</script>
