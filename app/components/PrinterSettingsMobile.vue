<template>
  <div class="mobile-shell-page">
    <MobilePageHeader title="Printers" subtitle="Network, USB, Bluetooth, WebUSB, WebSerial & System">
      <v-btn icon="mdi-tune" variant="tonal" color="primary" density="comfortable" @click="profilesDialog = true" />
    </MobilePageHeader>

    <div class="pa-4">
      <MobileEmptyState v-if="!store.loading && store.printers.length === 0" icon="mdi-printer-outline" title="No printers configured yet">
        <template #action>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">Add Printer</v-btn>
        </template>
      </MobileEmptyState>

      <div v-for="p in store.printers" :key="p.id" class="app-card pa-4 mb-3">
        <div class="d-flex align-center justify-space-between mb-2">
          <span class="font-weight-bold text-body-2">{{ p.name }}</span>
          <div class="d-flex ga-1">
            <v-chip v-if="p.isDefault" color="primary" size="x-small" variant="tonal">Default</v-chip>
            <v-chip :color="p.isActive ? 'success' : 'default'" size="x-small" variant="tonal">{{ p.isActive ? 'Active' : 'Disabled' }}</v-chip>
          </div>
        </div>
        <v-chip size="x-small" variant="outlined" class="mb-2">{{ p.connectionType }}</v-chip>
        <p class="text-caption text-medium-emphasis mb-1">Profile: {{ p.printerProfile?.name || 'Default (80mm)' }}</p>
        <p class="text-caption text-medium-emphasis mb-3">{{ connectionSummary(p) }}</p>

        <v-alert v-if="testResult[p.id]" :type="testResult[p.id].ok ? 'success' : 'error'" density="compact" variant="tonal" class="mb-3">
          {{ testResult[p.id].message }}
        </v-alert>

        <div class="d-flex flex-wrap ga-2">
          <v-btn v-if="needsConnect(p) && !connectedDrivers[p.id]" size="small" variant="tonal"
            :loading="connecting === p.id" @click="connectDevice(p)">
            Connect Device
          </v-btn>
          <v-btn size="small" color="primary" variant="tonal" :loading="testingId === p.id"
            :disabled="needsConnect(p) && !connectedDrivers[p.id]" @click="testPrint(p)">
            Test Print
          </v-btn>
          <v-btn size="small" variant="text" @click="openDialog(p)">Edit</v-btn>
          <v-btn size="small" variant="text" color="error" @click="remove(p)">Remove</v-btn>
        </div>
      </div>

      <div class="d-flex justify-center mt-2" v-if="store.loading">
        <v-progress-circular indeterminate size="36" />
      </div>
    </div>

    <MobileActionBar v-if="store.printers.length">
      <v-btn block size="large" color="primary" prepend-icon="mdi-plus" class="font-weight-bold" @click="openDialog()">
        Add Printer
      </v-btn>
    </MobileActionBar>

    <!-- ADD/EDIT PRINTER -->
    <MobileBottomSheet v-model="dialog" :title="form.id ? 'Edit Printer' : 'Add Printer'">
      <v-text-field v-model="form.name" label="Printer Name" variant="outlined" class="mb-2" />
      <v-select v-model="form.connectionType" :items="CONNECTION_TYPES" label="Connection Type" variant="outlined" class="mb-2" />

      <template v-if="form.connectionType === 'NETWORK'">
        <v-text-field v-model="form.connectionConfig.ip" label="IP Address" variant="outlined" placeholder="192.168.1.50" class="mb-2" />
        <v-text-field v-model.number="form.connectionConfig.port" label="Port" variant="outlined" type="number" placeholder="9100" class="mb-2" />
      </template>

      <template v-if="form.connectionType === 'BLUETOOTH'">
        <v-alert type="info" density="compact" variant="tonal" class="mb-3">
          Bluetooth printers have no universal service UUID - find these values in your printer's manual/spec sheet.
        </v-alert>
        <v-text-field v-model="form.connectionConfig.serviceUuid" label="GATT Service UUID" variant="outlined" class="mb-2" />
        <v-text-field v-model="form.connectionConfig.characteristicUuid" label="GATT Characteristic UUID" variant="outlined" class="mb-2" />
      </template>

      <v-select v-model="form.printerProfileId" :items="profileItems" label="Printer Profile" variant="outlined" clearable class="mb-2" />
      <v-switch v-model="form.isDefault" label="Set as default printer" color="primary" hide-details class="mb-3" />
      <v-btn block size="large" color="primary" class="font-weight-bold" :loading="saving" @click="submit">Save</v-btn>
    </MobileBottomSheet>

    <!-- PRINTER PROFILES -->
    <MobileBottomSheet v-model="profilesDialog" title="Printer Profiles">
      <v-btn variant="tonal" color="primary" prepend-icon="mdi-plus" class="mb-3" @click="openProfileDialog()">Add Profile</v-btn>
      <div v-for="prof in store.profiles" :key="prof.id" class="d-flex justify-space-between align-center pa-3 mb-2 profile-row">
        <div>
          <div class="font-weight-medium text-body-2">{{ prof.name }}</div>
          <div class="text-caption text-medium-emphasis">{{ prof.paperWidthMm }}mm · {{ prof.charsPerLine }} chars/line</div>
        </div>
        <div class="flex-shrink-0">
          <v-btn size="small" variant="text" @click="openProfileDialog(prof)">Edit</v-btn>
          <v-btn size="small" variant="text" color="error" @click="removeProfile(prof)">Remove</v-btn>
        </div>
      </div>
    </MobileBottomSheet>

    <MobileBottomSheet v-model="profileDialog" :title="profileForm.id ? 'Edit Profile' : 'Add Profile'">
      <v-text-field v-model="profileForm.name" label="Profile Name" variant="outlined" class="mb-2" />
      <v-select v-model="profileForm.paperWidthMm" :items="[58, 80]" label="Paper Width (mm)" variant="outlined" class="mb-2" />
      <v-text-field v-model.number="profileForm.charsPerLine" label="Characters Per Line" variant="outlined" type="number" class="mb-3" />
      <v-btn block size="large" color="primary" class="font-weight-bold" :loading="savingProfile" @click="submitProfile">Save</v-btn>
    </MobileBottomSheet>
  </div>
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

<style scoped>
.profile-row {
  background: #FBFAFD;
  border: 1px solid #EEE9F7;
  border-radius: 12px;
}
</style>
