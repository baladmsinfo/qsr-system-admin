<template>
  <div class="mobile-shell-page">
    <MobilePageHeader title="Profit & Loss Report" subtitle="Income, expenses & net profit">
      <v-btn icon="mdi-tune-variant" variant="tonal" color="primary" density="comfortable" @click="filtersOpen = true" />
    </MobilePageHeader>

    <div class="pa-4">
      <div v-if="report">
        <div class="mobile-section-title mb-2">Income</div>
        <div class="app-card mb-5">
          <div v-for="(item, idx) in report.income.accounts" :key="item.accountId"
            class="d-flex justify-space-between px-4 py-3" :style="idx > 0 ? 'border-top: 1px solid #EEE9F7' : ''">
            <span class="text-body-2">{{ item.accountName }}</span>
            <span class="mono-data text-body-2">{{ $formatPrice(item.credit - item.debit) }}</span>
          </div>
          <div class="d-flex justify-space-between px-4 py-3 font-weight-bold" style="border-top: 1px solid #EEE9F7; background: #FBFAFD">
            <span class="text-body-2">Total Income</span>
            <span class="mono-data text-body-2">{{ $formatPrice(report.income.total) }}</span>
          </div>
        </div>

        <div class="mobile-section-title mb-2">Expenses</div>
        <div class="app-card mb-5">
          <div v-for="(item, idx) in report.expenses.accounts" :key="item.accountId"
            class="d-flex justify-space-between px-4 py-3" :style="idx > 0 ? 'border-top: 1px solid #EEE9F7' : ''">
            <span class="text-body-2">{{ item.accountName }}</span>
            <span class="mono-data text-body-2">{{ $formatPrice(item.debit - item.credit) }}</span>
          </div>
          <div class="d-flex justify-space-between px-4 py-3 font-weight-bold" style="border-top: 1px solid #EEE9F7; background: #FBFAFD">
            <span class="text-body-2">Total Expenses</span>
            <span class="mono-data text-body-2">{{ $formatPrice(report.expenses.total) }}</span>
          </div>
        </div>

        <div class="app-card pa-4 d-flex justify-space-between align-center">
          <span class="text-subtitle-1 font-weight-bold">Net Profit / Loss</span>
          <span class="text-subtitle-1 font-weight-bold mono-data" :class="report.summary.isProfit ? 'text-success' : 'text-error'">
            {{ $formatPrice(report.summary.netProfit) }}
          </span>
        </div>
      </div>

      <MobileEmptyState v-else icon="mdi-chart-line" title="No Profit & Loss data found" />
    </div>

    <MobileBottomSheet v-model="filtersOpen" title="Filter by Date">
      <v-text-field v-model="startDate" type="date" label="Start Date" density="comfortable" class="mb-2" />
      <v-text-field v-model="endDate" type="date" label="End Date" density="comfortable" class="mb-3" />
      <v-btn block size="large" color="primary" class="font-weight-bold" :disabled="dashboard.loading"
        @click="loadProfitLoss(); filtersOpen = false">
        Apply Filter
      </v-btn>
    </MobileBottomSheet>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useReportStore } from '~/stores/reports'

const { $formatPrice } = useNuxtApp();

const dashboard = useReportStore()

const startDate = ref(null)
const endDate = ref(null)
const report = ref(null)
const filtersOpen = ref(false)

const loadProfitLoss = async () => {
  report.value = await dashboard.fetchProfitLoss(startDate.value, endDate.value)
}

onMounted(async () => {
  await loadProfitLoss()
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
