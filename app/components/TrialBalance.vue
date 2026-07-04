<template>
  <v-container fluid class="pa-6 trial-balance-page">
    <!-- 🧾 Header -->
    <v-row class="align-center justify-space-between mb-4">
      <v-col cols="12" md="6">
        <h2 class="text-h6 mb-1">Trial Balance</h2>
        <p class="text-body-2 text-medium-emphasis mb-0">
          View debit and credit balances for all accounts, grouped by type
        </p>
      </v-col>

      <v-col cols="12" md="4" class="d-flex justify-end align-center">
        <v-btn variant="tonal" prepend-icon="mdi-printer" color="primary" class="text-capitalize" @click="printSection">
          Print Report
        </v-btn>
      </v-col>
    </v-row>

    <!-- 📅 Date Filters -->
    <v-row class="mb-4 align-center" dense>
      <v-col cols="12" md="8" class="d-flex flex-wrap ga-2 align-center">
        <v-text-field v-model="filters.fromDate" label="From Date" type="date" density="comfortable" variant="outlined"
          hide-details class="flex-grow-1" />

        <v-text-field v-model="filters.toDate" label="To Date" type="date" density="comfortable" variant="outlined"
          hide-details class="flex-grow-1" />

        <v-btn variant="flat" color="primary" class="text-capitalize" @click="loadTrialBalance" height="50">
          Apply
        </v-btn>
      </v-col>
    </v-row>

    <!-- 📊 Trial Balance Report -->
    <div id="printableArea">
      <v-row v-if="dashboard.trialBalance.length">
        <v-col v-for="(group, index) in dashboard.trialBalance" :key="index" cols="12" class="mb-6">
          <h3 class="text-body-1 mb-2">{{ group.group }}</h3>

          <v-data-table :headers="trialHeaders" :items="group.items" hide-default-footer class="trial-table"
            density="compact">
            <template #item.debit="{ item }">
              <div class="text-right">{{ $formatPrice(item.debit) }}</div>
            </template>

            <template #item.credit="{ item }">
              <div class="text-right">{{ $formatPrice(item.credit) }}</div>
            </template>
          </v-data-table>
        </v-col>
      </v-row>

      <!-- 📋 Overall Totals -->
      <v-row class="mt-8 justify-end">
        <v-col cols="12" md="4">
          <v-sheet class="pa-4" color="grey-lighten-4" border="sm" style="border-color: #ddd; border-radius: 4px;">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-2 text-medium-emphasis">Total Debit</span>
              <span class="text-body-2 font-weight-medium">{{ $formatPrice(summary.totalDebit) }}</span>
            </div>

            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-2 text-medium-emphasis">Total Credit</span>
              <span class="text-body-2 font-weight-medium">{{ $formatPrice(summary.totalCredit) }}</span>
            </div>

            <v-divider class="my-2" />

            <div class="d-flex justify-end align-center">
              <v-chip :color="summary.isBalanced ? 'success' : 'error'" size="small"
                class="text-white font-weight-medium text-uppercase" variant="flat">
                {{ summary.isBalanced ? 'TALLY' : 'NOT TALLY' }}
              </v-chip>
            </div>
          </v-sheet>
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

// 🧾 Table headers
const trialHeaders = [
  { title: 'Account', key: 'accountName', align: 'start' },
  { title: 'Debit', key: 'debit', align: 'end' },
  { title: 'Credit', key: 'credit', align: 'end' },
]

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
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 6px;
          }
          th {
            background-color: #f8f8f8;
            text-align: left;
          }
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

<style scoped>
.trial-table {
  border: 1px solid #e0e0e0;
}

.v-data-table th {
  background: #f8f8f8 !important;
  font-weight: 500 !important;
  text-transform: none;
}

.v-data-table td {
  vertical-align: middle !important;
}
</style>