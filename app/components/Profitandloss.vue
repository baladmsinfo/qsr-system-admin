<template>
  <v-container fluid class="pa-6">
    <v-card elevation="2" class="rounded-lg">

      <!-- 🔹 Header -->
      <v-card-title class="text-h6 d-flex align-center justify-space-between">
        <div>
          Profit & Loss Report
          <p class="text-body-2 text-medium-emphasis mt-1 mb-0">
            View income, expenses, and net profit
          </p>
        </div>

        <!-- 🔹 Date Filters -->
        <div class="d-flex align-center ga-2">
          <v-text-field
            v-model="startDate"
            type="date"
            label="Start Date"
            density="compact"
            hide-details
            variant="outlined"
            style="max-width: 160px"
          />

          <v-text-field
            v-model="endDate"
            type="date"
            label="End Date"
            density="compact"
            hide-details
            variant="outlined"
            style="max-width: 160px"
          />

          <v-btn color="primary" variant="flat" @click="loadProfitLoss" :disabled="dashboard.loading">
            APPLY FILTER
          </v-btn>
        </div>
      </v-card-title>

      <v-divider />

      <!-- 📊 Profit & Loss Body -->
      <div v-if="report" class="pa-4">

        <!-- ⭐ INCOME -->
        <h3 class="text-h6 font-weight-bold mb-2">Income</h3>
        <table class="pl-table">
          <thead>
            <tr>
              <th>Account</th>
              <th class="text-end">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in report.income.accounts" :key="item.accountId">
              <td>{{ item.accountName }}</td>
              <td class="text-end">{{ $formatPrice(item.credit - item.debit) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="font-weight-bold">
              <td>Total Income</td>
              <td class="text-end">{{ $formatPrice(report.income.total) }}</td>
            </tr>
          </tfoot>
        </table>

        <v-divider class="my-4" />

        <!-- ⭐ EXPENSES -->
        <h3 class="text-h6 font-weight-bold mb-2">Expenses</h3>
        <table class="pl-table">
          <thead>
            <tr>
              <th>Account</th>
              <th class="text-end">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in report.expenses.accounts" :key="item.accountId">
              <td>{{ item.accountName }}</td>
              <td class="text-end">{{ $formatPrice(item.debit - item.credit) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="font-weight-bold">
              <td>Total Expenses</td>
              <td class="text-end">{{ $formatPrice(report.expenses.total) }}</td>
            </tr>
          </tfoot>
        </table>

        <v-divider class="my-4" />

        <!-- 💰 NET PROFIT / LOSS -->
        <div class="text-h6 d-flex justify-space-between">
          <span>Net Profit / Loss</span>
          <span :class="report.summary.isProfit ? 'text-success' : 'text-error'">
            {{ $formatPrice(report.summary.netProfit) }}
          </span>
        </div>
      </div>

      <!-- ℹ️ Empty state -->
      <v-alert v-else type="info" variant="tonal" border="start" class="ma-4">
        No Profit & Loss data found.
      </v-alert>

    </v-card>
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
.pl-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.pl-table th {
  background: #fafafa;
  font-weight: 600;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.pl-table td {
  padding: 8px 10px;
  border-bottom: 1px solid #eee;
}

.text-end {
  text-align: right;
}

.text-success {
  color: #2e7d32 !important;
}

.text-error {
  color: #c62828 !important;
}
</style>