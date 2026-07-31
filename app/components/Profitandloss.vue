<template>
  <v-container fluid class="pa-6">
    <!-- 🔹 Header -->
    <div class="app-header-bar d-flex flex-wrap align-center justify-space-between mb-6 px-5 py-4 ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-0">Profit &amp; Loss Report</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          View income, expenses, and net profit
        </p>
      </div>

      <!-- 🔹 Date Filters -->
      <div class="d-flex align-center flex-wrap ga-2">
        <v-text-field
          v-model="startDate"
          type="date"
          label="Start Date"
          density="compact"
          hide-details
          style="max-width: 160px"
        />

        <v-text-field
          v-model="endDate"
          type="date"
          label="End Date"
          density="compact"
          hide-details
          style="max-width: 160px"
        />

        <v-btn color="primary" @click="loadProfitLoss" :disabled="dashboard.loading">
          Apply Filter
        </v-btn>
      </div>
    </div>

    <!-- 📊 Profit & Loss Body -->
    <div v-if="report">

      <!-- ⭐ INCOME -->
      <h3 class="text-subtitle-1 font-weight-bold mb-2">Income</h3>
      <div class="app-card mb-6">
        <div v-for="(item, idx) in report.income.accounts" :key="item.accountId"
          class="d-flex justify-space-between px-5 py-3" :style="idx > 0 ? 'border-top: 1px solid #EEE9F7' : ''">
          <span>{{ item.accountName }}</span>
          <span class="mono-data">{{ $formatPrice(item.credit - item.debit) }}</span>
        </div>
        <div class="d-flex justify-space-between px-5 py-3 font-weight-bold" style="border-top: 1px solid #EEE9F7; background: #FBFAFD">
          <span>Total Income</span>
          <span class="mono-data">{{ $formatPrice(report.income.total) }}</span>
        </div>
      </div>

      <!-- ⭐ EXPENSES -->
      <h3 class="text-subtitle-1 font-weight-bold mb-2">Expenses</h3>
      <div class="app-card mb-6">
        <div v-for="(item, idx) in report.expenses.accounts" :key="item.accountId"
          class="d-flex justify-space-between px-5 py-3" :style="idx > 0 ? 'border-top: 1px solid #EEE9F7' : ''">
          <span>{{ item.accountName }}</span>
          <span class="mono-data">{{ $formatPrice(item.debit - item.credit) }}</span>
        </div>
        <div class="d-flex justify-space-between px-5 py-3 font-weight-bold" style="border-top: 1px solid #EEE9F7; background: #FBFAFD">
          <span>Total Expenses</span>
          <span class="mono-data">{{ $formatPrice(report.expenses.total) }}</span>
        </div>
      </div>

      <!-- 💰 NET PROFIT / LOSS -->
      <div class="app-card pa-5 d-flex justify-space-between align-center">
        <span class="text-h6 font-weight-bold">Net Profit / Loss</span>
        <span class="text-h6 font-weight-bold mono-data" :class="report.summary.isProfit ? 'text-success' : 'text-error'">
          {{ $formatPrice(report.summary.netProfit) }}
        </span>
      </div>
    </div>

    <!-- ℹ️ Empty state -->
    <div v-else class="app-card pa-10 text-center text-medium-emphasis">
      No Profit & Loss data found.
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useReportStore } from '~/stores/reports'

const { $formatPrice } = useNuxtApp();

const dashboard = useReportStore()

const startDate = ref(null)
const endDate = ref(null)
const report = ref(null)

const loadProfitLoss = async () => {
  report.value = await dashboard.fetchProfitLoss(startDate.value, endDate.value)
}

onMounted(async () => {
  await loadProfitLoss() 
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