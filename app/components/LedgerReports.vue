<template>
  <v-container fluid class="pa-6">
    <!-- 🔹 Header -->
    <div class="app-header-bar d-flex flex-wrap align-center justify-space-between mb-6 px-5 py-4 ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-0">Ledger Report</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          View transactions for all or specific accounts
        </p>
      </div>

      <div class="d-flex align-center ga-2">
        <v-autocomplete
          v-model="selectedAccount"
          :items="accountOptions"
          item-title="name"
          item-value="id"
          label="Select Account"
          density="compact"
          hide-details
          clearable
          style="max-width: 300px"
          :loading="reports.loading"
          @update:model-value="onAccountSelect"
        />
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-refresh"
          @click="loadLedger"
          :disabled="reports.loading"
        >
          Refresh
        </v-btn>
      </div>
    </div>

    <!-- 📋 Ledger Cards -->
    <div v-if="reports.ledger?.length" class="app-card">
      <template v-for="(item, index) in reports.ledger">
        <!-- 🧾 Account Header -->
        <div v-if="item.isHeader" :key="'h' + index" class="px-5 py-3 font-weight-bold"
          :style="{ background: '#FBFAFD', borderTop: index > 0 ? '1px solid #EAE6F2' : 'none' }">
          {{ item.accountName }}
        </div>

        <!-- 💰 Transaction Row -->
        <div v-else :key="index" class="d-flex flex-wrap justify-space-between align-center px-5 py-3 ga-3"
          style="border-top: 1px solid #EAE6F2">
          <div style="min-width: 110px" class="text-caption text-medium-emphasis">{{ formatDate(item.date) }}</div>
          <div class="flex-grow-1 text-body-2" style="min-width: 180px">{{ item.description }}</div>
          <div class="d-flex ga-6">
            <div class="text-right mono-data" style="min-width: 90px">{{ $formatPrice(item.debit) }}</div>
            <div class="text-right mono-data" style="min-width: 90px">{{ $formatPrice(item.credit) }}</div>
            <div class="text-right font-weight-medium mono-data" style="min-width: 100px"
              :class="item.runningBalance >= 0 ? 'text-success' : 'text-error'">
              {{ $formatPrice(item.runningBalance) }}
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- ℹ️ Empty State -->
    <div v-else class="app-card pa-10 text-center text-medium-emphasis">
      No ledger data found.
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useReportStore } from '~/stores/reports'

const { $formatPrice } = useNuxtApp();

const reports = useReportStore()
const selectedAccount = ref(null)
const accountOptions = ref([])

// 🔹 Format helpers
const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
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
.text-success {
  color: #2e7d32 !important;
}

.text-error {
  color: #c62828 !important;
}
</style>