<template>
  <v-container fluid class="pa-6">
    <v-card elevation="2" class="rounded-lg">
      <!-- 🔹 Header -->
      <v-card-title class="text-h6 d-flex align-center justify-space-between">
        <div>
          Ledger Report
          <p class="text-body-2 text-medium-emphasis mt-1 mb-0">
            View transactions for all or specific accounts
          </p>
        </div>

        <div class="d-flex align-center">
          <v-autocomplete
            v-model="selectedAccount"
            :items="accountOptions"
            item-title="name"
            item-value="id"
            label="Select Account"
            density="compact"
            hide-details
            clearable
            variant="outlined"
            class="mr-2"
            style="max-width: 300px"
            :loading="reports.loading"
            @update:model-value="onAccountSelect"
          />
          <v-btn
            color="primary"
            variant="flat"
            @click="loadLedger"
            :disabled="reports.loading"
          >
            REFRESH
          </v-btn>
        </div>
      </v-card-title>

      <v-divider />

      <!-- 📋 Ledger Table -->
      <div v-if="reports.ledger?.length" class="ledger-table-container">
        <table class="ledger-table">
          <thead>
            <tr>
              <th style="width: 10%">Date</th>
              <th style="width: 40%">Description</th>
              <th style="width: 15%" class="text-end">Debit</th>
              <th style="width: 15%" class="text-end">Credit</th>
              <th style="width: 20%" class="text-end">Running Balance</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(item, index) in reports.ledger" :key="index">
              <!-- 🧾 Account Header -->
              <tr v-if="item.isHeader" class="account-header-row">
                <td colspan="5">{{ item.accountName }}</td>
              </tr>

              <!-- 💰 Transaction Row -->
              <tr v-else>
                <td class="text-no-wrap">
                  {{ formatDate(item.date) }}
                </td>
                <td>{{ item.description }}</td>
                <td class="text-end">
                  {{ $formatPrice(item.debit) }}
                </td>
                <td class="text-end">
                  {{ $formatPrice(item.credit) }}
                </td>
                <td
                  class="text-end font-weight-medium"
                  :class="item.runningBalance >= 0 ? 'text-success' : 'text-error'"
                >
                  {{ $formatPrice(item.runningBalance) }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- ℹ️ Empty State -->
      <v-alert v-else type="info" variant="tonal" border="start" class="ma-4">
        No ledger data found.
      </v-alert>
    </v-card>
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
.ledger-table-container {
  width: 100%;
  overflow-x: auto;
}

.ledger-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.ledger-table thead th {
  background-color: #fafafa;
  font-weight: 600;
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid #ddd;
  color: #555;
}

.ledger-table tbody td {
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}

.account-header-row td {
  background-color: #f5f5f5 !important;
  font-weight: 600;
  color: #424242;
  border-top: 2px solid #e0e0e0;
}

.text-end {
  text-align: right !important;
}

.text-no-wrap {
  white-space: nowrap;
}

.text-success {
  color: #2e7d32 !important;
}

.text-error {
  color: #c62828 !important;
}

.v-alert {
  border-radius: 8px;
}
</style>