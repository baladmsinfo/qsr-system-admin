<template>
  <div class="mobile-shell-page">
    <MobilePageHeader title="Print History" subtitle="Every receipt/KOT print attempt">
      <v-select v-model="statusFilter" :items="['', 'SUCCESS', 'FAILED', 'QUEUED', 'PROCESSING']" label="Status"
        variant="outlined" density="compact" hide-details @update:model-value="load" />
    </MobilePageHeader>

    <MobileLoading v-if="store.loading && !store.history.length" :count="4" type="list-item-two-line" />

    <div v-else class="pa-4">
      <MobileEmptyState v-if="!store.history.length" icon="mdi-printer-outline" title="No print history yet" />

      <div v-for="item in store.history" :key="item.id" class="app-card pa-4 mb-3">
        <div class="d-flex justify-space-between align-start mb-2">
          <div class="font-weight-bold text-body-2">{{ item.printer?.name || '-' }}</div>
          <MobileStatusChip :status="item.status" :color="statusHex(item.status)" size="small" />
        </div>
        <div class="text-caption text-medium-emphasis mb-1">Template: {{ item.receiptTemplate?.name || '-' }} · {{ item.format }}</div>
        <div class="text-caption text-medium-emphasis mb-1">{{ new Date(item.createdAt).toLocaleString() }}</div>
        <div v-if="item.errorMessage" class="text-caption text-error mt-1">{{ item.errorMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePrintHistoryStore } from '@/stores/printHistory'

const store = usePrintHistoryStore()
const statusFilter = ref('')

function statusHex(status) {
  return { SUCCESS: '#16A34A', FAILED: '#DC2626', QUEUED: '#D97706', PROCESSING: '#0EA5E9' }[status] || '#8B8599'
}

function load() {
  store.fetchHistory({ status: statusFilter.value || undefined, limit: 100 })
}

onMounted(load)
</script>
