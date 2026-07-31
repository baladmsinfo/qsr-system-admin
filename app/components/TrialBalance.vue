<template>
  <v-container fluid class="pa-6 trial-balance-page">
    <!-- 🧾 Header -->
    <div class="app-header-bar d-flex flex-wrap align-center justify-space-between mb-6 px-5 py-4 ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-0">Trial Balance</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          View debit and credit balances for all accounts, grouped by type
        </p>
      </div>

      <v-btn variant="tonal" prepend-icon="mdi-printer" color="primary" @click="printSection">
        Print Report
      </v-btn>
    </div>

    <!-- 📅 Date Filters -->
    <v-row class="mb-2 align-center" dense>
      <v-col cols="12" md="8" class="d-flex flex-wrap ga-2 align-center">
        <v-text-field v-model="filters.fromDate" label="From Date" type="date" density="comfortable"
          hide-details class="flex-grow-1" />

        <v-text-field v-model="filters.toDate" label="To Date" type="date" density="comfortable"
          hide-details class="flex-grow-1" />

        <v-btn variant="flat" color="primary" @click="loadTrialBalance" height="50">
          Apply
        </v-btn>
      </v-col>
    </v-row>

    <!-- 📊 Trial Balance Report -->
    <div id="printableArea">
      <template v-if="dashboard.trialBalance.length">
        <div v-for="(group, index) in dashboard.trialBalance" :key="index" class="mb-6">
          <h3 class="text-subtitle-1 font-weight-bold mb-2 tb-group-title">{{ group.group }}</h3>

          <div class="app-card tb-group">
            <div class="d-flex justify-space-between px-5 py-2 tb-row tb-row--head">
              <span class="text-caption font-weight-bold text-medium-emphasis text-uppercase">Account</span>
              <div class="d-flex ga-6">
                <span class="text-caption font-weight-bold text-medium-emphasis text-uppercase text-right" style="min-width: 100px">Debit</span>
                <span class="text-caption font-weight-bold text-medium-emphasis text-uppercase text-right" style="min-width: 100px">Credit</span>
              </div>
            </div>

            <div v-for="(item, idx) in group.items" :key="idx" class="d-flex justify-space-between px-5 py-3 tb-row"
              style="border-top: 1px solid #EEE9F7">
              <span class="tb-cell">{{ item.accountName }}</span>
              <div class="d-flex ga-6">
                <span class="text-right mono-data tb-cell" style="min-width: 100px">{{ $formatPrice(item.debit) }}</span>
                <span class="text-right mono-data tb-cell" style="min-width: 100px">{{ $formatPrice(item.credit) }}</span>
              </div>
            </div>

            <div v-if="!group.items.length" class="text-center text-medium-emphasis py-4">No accounts</div>
          </div>
        </div>
      </template>

      <!-- 📋 Overall Totals -->
      <v-row class="mt-4 justify-end">
        <v-col cols="12" md="4">
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
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReportStore } from '~/stores/reports'

const { $formatPrice } = useNuxtApp();

const dashboard = useReportStore()

// 📅 Filters
const filters = ref({
  fromDate: null,
  toDate: null,
})

// 📋 Summary
const summary = computed(() => dashboard.trialBalanceSummary || {
  totalDebit: 0,
  totalCredit: 0,
  isBalanced: false,
})

// 🚀 Fetch data
const loadTrialBalance = async () => {
  await dashboard.fetchTrialBalance(filters.value.fromDate, filters.value.toDate)
}

// 🖨️ Print only report section
const printSection = () => {
  const printContents = document.getElementById('printableArea').innerHTML
  const printWindow = window.open('', '', 'height=800,width=1000')
  printWindow.document.write(`
    <html>
      <head>
        <title>Trial Balance</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 13px;
            color: #000;
          }
          .tb-group { border: 1px solid #ddd; border-radius: 4px; margin-bottom: 16px; }
          .tb-row { padding: 6px 10px; }
          .tb-row--head { background-color: #f8f8f8; font-weight: 600; }
          .tb-group-title { margin-top: 20px; }
          h3 {
            margin-top: 30px;
          }
          .text-right { text-align: right; }
          .text-end { text-align: right; }
          .text-center { text-align: center; }
        </style>
      </head>
      <body>
        ${printContents}
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}

onMounted(() => loadTrialBalance())
</script>

