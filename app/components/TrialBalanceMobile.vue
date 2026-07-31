<template>
  <div class="mobile-shell-page trial-balance-page">
    <MobilePageHeader title="Trial Balance" subtitle="Debit/credit balances by account type">
      <v-btn icon="mdi-printer" variant="tonal" color="primary" density="comfortable" @click="printSection" />
    </MobilePageHeader>

    <div class="pa-4">
      <div class="app-card pa-3 mb-4">
        <v-text-field v-model="filters.fromDate" label="From Date" type="date" density="comfortable" hide-details class="mb-2" />
        <v-text-field v-model="filters.toDate" label="To Date" type="date" density="comfortable" hide-details class="mb-2" />
        <v-btn block color="primary" @click="loadTrialBalance">Apply</v-btn>
      </div>

      <div id="printableArea">
        <template v-if="dashboard.trialBalance.length">
          <div v-for="(group, index) in dashboard.trialBalance" :key="index" class="mb-5">
            <h3 class="mobile-section-title mb-2">{{ group.group }}</h3>

            <div class="app-card tb-group">
              <div v-for="(item, idx) in group.items" :key="idx" class="px-4 py-3 tb-row"
                :style="idx > 0 ? 'border-top: 1px solid #EEE9F7' : ''">
                <div class="tb-cell font-weight-medium text-body-2 mb-1">{{ item.accountName }}</div>
                <div class="d-flex justify-space-between">
                  <span class="text-caption text-medium-emphasis">Debit <span class="mono-data text-body-2 font-weight-medium">{{ $formatPrice(item.debit) }}</span></span>
                  <span class="text-caption text-medium-emphasis">Credit <span class="mono-data text-body-2 font-weight-medium">{{ $formatPrice(item.credit) }}</span></span>
                </div>
              </div>

              <div v-if="!group.items.length" class="text-center text-medium-emphasis py-4 text-body-2">No accounts</div>
            </div>
          </div>
        </template>

        <div class="app-card pa-4">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-body-2 text-medium-emphasis">Total Debit</span>
            <span class="text-body-2 font-weight-medium mono-data">{{ $formatPrice(summary.totalDebit) }}</span>
          </div>
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-body-2 text-medium-emphasis">Total Credit</span>
            <span class="text-body-2 font-weight-medium mono-data">{{ $formatPrice(summary.totalCredit) }}</span>
          </div>
          <v-divider class="my-2" />
          <div class="d-flex justify-end align-center">
            <v-chip :color="summary.isBalanced ? 'success' : 'error'" size="small"
              class="text-white font-weight-medium text-uppercase" variant="flat">
              {{ summary.isBalanced ? 'TALLY' : 'NOT TALLY' }}
            </v-chip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReportStore } from '~/stores/reports'

const { $formatPrice } = useNuxtApp();

const dashboard = useReportStore()

const filters = ref({ fromDate: null, toDate: null })

const summary = computed(() => dashboard.trialBalanceSummary || {
  totalDebit: 0, totalCredit: 0, isBalanced: false,
})

const loadTrialBalance = async () => {
  await dashboard.fetchTrialBalance(filters.value.fromDate, filters.value.toDate)
}

const printSection = () => {
  const printContents = document.getElementById('printableArea').innerHTML
  const printWindow = window.open('', '', 'height=800,width=1000')
  printWindow.document.write(`
    <html>
      <head>
        <title>Trial Balance</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 13px; color: #000; }
          .tb-group { border: 1px solid #ddd; border-radius: 4px; margin-bottom: 16px; }
          .tb-row { padding: 6px 10px; }
          .mobile-section-title { margin-top: 20px; }
          .text-right { text-align: right; }
          .text-end { text-align: right; }
          .text-center { text-align: center; }
        </style>
      </head>
      <body>${printContents}</body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}

onMounted(() => loadTrialBalance())
</script>

<style scoped>
.mobile-section-title {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.9375rem;
  font-weight: 700;
}
</style>
