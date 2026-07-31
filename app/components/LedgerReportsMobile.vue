<template>
  <div class="mobile-shell-page">
    <MobilePageHeader title="Ledger Report" subtitle="View transactions for all or specific accounts">
      <div class="d-flex align-center ga-2">
        <v-autocomplete v-model="selectedAccount" :items="accountOptions" item-title="name" item-value="id"
          label="Account" density="compact" hide-details clearable style="max-width: 140px"
          :loading="reports.loading" @update:model-value="onAccountSelect" />
        <v-btn icon="mdi-refresh" variant="tonal" color="primary" density="comfortable" @click="loadLedger" :disabled="reports.loading" />
      </div>
    </MobilePageHeader>

    <div class="pa-4">
      <template v-if="reports.ledger?.length">
        <template v-for="(item, index) in reports.ledger" :key="index">
          <div v-if="item.isHeader" class="mobile-section-title mt-4 mb-2">{{ item.accountName }}</div>

          <div v-else class="app-card pa-3 mb-2">
            <div class="d-flex justify-space-between align-start mb-1">
              <span class="text-caption text-medium-emphasis">{{ formatDate(item.date) }}</span>
              <span class="font-weight-medium mono-data" :class="item.runningBalance >= 0 ? 'text-success' : 'text-error'">
                {{ $formatPrice(item.runningBalance) }}
              </span>
            </div>
            <div class="text-body-2 mb-2">{{ item.description }}</div>
            <div class="d-flex justify-space-between">
              <div><span class="text-caption text-medium-emphasis">Debit </span><span class="mono-data text-body-2">{{ $formatPrice(item.debit) }}</span></div>
              <div><span class="text-caption text-medium-emphasis">Credit </span><span class="mono-data text-body-2">{{ $formatPrice(item.credit) }}</span></div>
            </div>
          </div>
        </template>
      </template>

      <MobileEmptyState v-else icon="mdi-book-open-variant" title="No ledger data found" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useReportStore } from '~/stores/reports'

const { $formatPrice } = useNuxtApp();

const reports = useReportStore()
const selectedAccount = ref(null)
const accountOptions = ref([])

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const loadAccounts = async () => {
  accountOptions.value = await reports.fetchAccountsOptions()
}

const loadLedger = async () => {
  await reports.fetchLedger(selectedAccount.value)
}

const onAccountSelect = async () => {
  await loadLedger()
}

onMounted(async () => {
  await loadAccounts()
  await loadLedger()
})
</script>

<style scoped>
.mobile-section-title {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.9375rem;
  font-weight: 700;
}
.text-success {
  color: #2e7d32 !important;
}
.text-error {
  color: #c62828 !important;
}
</style>
