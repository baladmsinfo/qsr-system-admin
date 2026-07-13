<template>
  <v-container fluid class="pa-6">
    <div class="app-header-bar d-flex flex-wrap align-center justify-space-between mb-6 px-5 py-4 ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-0">Menu Card QR</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">One QR for the whole menu - customers scan it to browse dishes &amp; prices, then order through a waiter</p>
      </div>
      <div class="d-flex ga-3 align-center">
        <v-select v-if="isSuperAdmin" v-model="selectedBranchId" :items="branchOptions" label="Branch"
          density="compact" hide-details style="max-width: 220px" />
      </div>
    </div>

    <v-row v-if="menuQrStore.branch">
      <v-col cols="12" sm="6" md="4" lg="3">
        <div class="app-card pa-4 text-center">
          <h3 class="text-h6 font-weight-bold mb-3">{{ menuQrStore.branch.name }}</h3>

          <v-img :src="qrImage" width="200" height="200" class="mx-auto mb-3 rounded-lg" style="border: 1px solid #EAE6F2" />

          <p class="text-caption text-medium-emphasis mb-3">Table-independent - one QR covers this branch's entire menu</p>

          <div class="d-flex justify-center ga-2">
            <v-btn size="small" variant="tonal" icon="mdi-qrcode-scan" @click="regenerate" />
            <v-btn size="small" variant="tonal" icon="mdi-printer" @click="printQr" />
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row v-else-if="!menuQrStore.loading">
      <v-col cols="12">
        <div class="app-card pa-10 text-center text-medium-emphasis">Select a branch to view its menu QR</div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import QRCode from 'qrcode'
import { useMenuQrStore } from '@/stores/menuQr'
import { useBranchSelector } from '@/composables/useBranchSelector'

const menuQrStore = useMenuQrStore()
const { isSuperAdmin, selectedBranchId, branchOptions } = useBranchSelector()
const config = useRuntimeConfig()

const qrImage = ref(null)

async function buildQrImage() {
  if (!menuQrStore.branch?.menuQrCode) {
    qrImage.value = null
    return
  }
  // Bare /m/:code route on the CUSTOMER app - no table/session segment, since
  // this QR is scoped to the branch's menu, not a specific table.
  const menuUrl = `${config.public.CUSTOMER_URL}/m/${menuQrStore.branch.menuQrCode}`
  qrImage.value = await QRCode.toDataURL(menuUrl, { width: 200, margin: 1 })
}

async function load() {
  if (!selectedBranchId.value) return
  await menuQrStore.fetchMenuQr(selectedBranchId.value)
  await buildQrImage()
}

async function regenerate() {
  await menuQrStore.regenerateMenuQr(selectedBranchId.value)
  await buildQrImage()
}

function printQr() {
  const win = window.open('', '_blank')
  win.document.write(`
    <html><body style="text-align:center;font-family:sans-serif;padding:40px">
      <h2>${menuQrStore.branch.name} - Menu</h2>
      <img src="${qrImage.value}" width="240" />
      <p>Scan to view the menu &amp; order through your waiter</p>
    </body></html>
  `)
  win.document.close()
  win.print()
}

onMounted(load)
watch(selectedBranchId, (val) => { if (val) load() })
</script>
