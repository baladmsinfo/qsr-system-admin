<template>
  <v-container fluid class="pa-6">
    <div class="app-header-bar d-flex flex-wrap align-center justify-space-between mb-6 px-5 py-4 ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-0">Print History</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">Every receipt/KOT print attempt, including retries and failures</p>
      </div>
      <v-select
        v-model="statusFilter"
        :items="['', 'SUCCESS', 'FAILED', 'QUEUED', 'PROCESSING']"
        label="Status"
        variant="outlined"
        density="compact"
        style="max-width: 200px"
        @update:model-value="load"
      />
    </div>

    <div class="app-card">
      <v-data-table :headers="headers" :items="store.history" :loading="store.loading" item-value="id">
        <template #item.printer="{ item }">{{ item.printer?.name || '-' }}</template>
        <template #item.receiptTemplate="{ item }">{{ item.receiptTemplate?.name || '-' }}</template>
        <template #item.status="{ item }">
          <v-chip size="small" :color="statusColor(item.status)" variant="tonal">{{ item.status }}</v-chip>
        </template>
        <template #item.createdAt="{ item }">{{ new Date(item.createdAt).toLocaleString() }}</template>
        <template #item.errorMessage="{ item }">
          <span class="text-error text-caption">{{ item.errorMessage || '' }}</span>
        </template>
      </v-data-table>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePrintHistoryStore } from '@/stores/printHistory'

const store = usePrintHistoryStore()
const statusFilter = ref('')

const headers = [
  { title: 'Printer', key: 'printer' },
  { title: 'Template', key: 'receiptTemplate' },
  { title: 'Format', key: 'format' },
  { title: 'Status', key: 'status' },
  { title: 'When', key: 'createdAt' },
  { title: 'Error', key: 'errorMessage' },
]

function statusColor(status) {
  return { SUCCESS: 'success', FAILED: 'error', QUEUED: 'warning', PROCESSING: 'info' }[status] || 'default'
}

function load() {
  store.fetchHistory({ status: statusFilter.value || undefined, limit: 100 })
}

onMounted(load)
</script>
