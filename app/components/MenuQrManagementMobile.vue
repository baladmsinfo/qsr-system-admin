<template>
  <div class="mobile-shell-page">
    <MobilePageHeader title="Menu Card QR" subtitle="One QR for the whole menu">
      <MobileBranchPicker v-if="isSuperAdmin" v-model="selectedBranchId" :items="branchOptions" />
    </MobilePageHeader>

    <div class="pa-4">
      <div v-if="menuQrStore.branch" class="app-card pa-5 text-center">
        <h3 class="text-subtitle-1 font-weight-bold mb-3">{{ menuQrStore.branch.name }}</h3>

        <v-img :src="qrImage" width="200" height="200" class="mx-auto mb-3 rounded-lg" style="border: 1px solid #EEE9F7" />

        <p class="text-caption text-medium-emphasis mb-3">Table-independent - one QR covers this branch's entire menu</p>

        <div class="d-flex justify-center ga-2">
          <v-btn size="small" variant="tonal" icon="mdi-qrcode-scan" @click="regenerate" />
          <v-btn size="small" variant="tonal" icon="mdi-printer" @click="printQr" />
        </div>
      </div>

      <MobileEmptyState v-else-if="!menuQrStore.loading" icon="mdi-qrcode" title="Select a branch"
        description="Choose a branch above to view its menu QR." />

      <MobileLoading v-else :count="1" type="card" />
    </div>
  </div>
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
