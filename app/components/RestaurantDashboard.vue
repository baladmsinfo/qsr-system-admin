<template>
  <v-container fluid class="pa-6">
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h2 class="text-h5 font-weight-bold mb-1">Dashboard</h2>
        <p class="text-body-2 text-medium-emphasis mb-0">{{ companyName }} &middot; {{ roleLabel }}</p>
      </div>
      <v-select v-if="isSuperAdmin" v-model="selectedBranchId" :items="branchOptions" label="Branch"
        density="compact" variant="outlined" hide-details style="max-width: 220px" />
    </div>

    <!-- KPI ROW -->
    <v-row class="mb-2">
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 rounded-xl" elevation="2">
          <div class="text-caption text-medium-emphasis">Orders Today</div>
          <h3 class="text-h5 font-weight-bold">{{ ordersToday.length }}</h3>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 rounded-xl" elevation="2">
          <div class="text-caption text-medium-emphasis">Revenue Today</div>
          <h3 class="text-h5 font-weight-bold">{{ $formatPrice(revenueToday) }}</h3>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 rounded-xl" elevation="2">
          <div class="text-caption text-medium-emphasis">Active Orders</div>
          <h3 class="text-h5 font-weight-bold">{{ activeOrders.length }}</h3>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 rounded-xl" elevation="2">
          <div class="text-caption text-medium-emphasis">Awaiting Billing</div>
          <h3 class="text-h5 font-weight-bold">{{ servedOrders.length }}</h3>
        </v-card>
      </v-col>
    </v-row>

    <!-- RECENT ORDERS -->
    <v-card class="rounded-xl mb-6" elevation="1">
      <v-card-title class="text-subtitle-1 font-weight-bold">Recent Orders</v-card-title>
      <v-divider />
      <v-list density="compact">
        <v-list-item v-for="order in recentOrders" :key="order.id">
          <v-list-item-title>
            {{ order.table?.tableNo || 'Takeaway' }} &middot; {{ $formatPrice(order.totalAmount) }}
          </v-list-item-title>
          <template #append>
            <v-chip size="small" variant="tonal">{{ order.status }}</v-chip>
          </template>
        </v-list-item>
        <v-list-item v-if="!recentOrders.length">
          <v-list-item-title class="text-medium-emphasis">No orders yet today</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- ACCOUNTING CHARTS (SUPERADMIN / BRANCHADMIN / ACCOUNTANT) -->
    <template v-if="canSeeAccounting">
      <v-row>
        <v-col cols="12">
          <v-card elevation="2" class="pa-4">
            <div class="d-flex justify-space-between align-center mb-4">
              <h3 class="text-h6 font-weight-bold">Cashflow Overview</h3>
              <v-select v-model="periods.cashflow" :items="periodOptions" density="compact" hide-details
                variant="outlined" style="max-width: 160px" @update:modelValue="loadCashflow" />
            </div>
            <client-only>
              <apexchart type="line" height="320" :options="chartOptions" :series="cashflowSeries" />
            </client-only>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card elevation="2" class="pa-4">
            <div class="d-flex justify-space-between align-center mb-3">
              <h3 class="text-h6 font-weight-bold">Sales</h3>
              <v-select v-model="periods.sales" :items="periodOptions" density="compact" hide-details
                variant="outlined" style="max-width: 140px" @update:modelValue="loadSales" />
            </div>
            <div class="text-h5 font-weight-bold">{{ $formatPrice(dashboard.sales.paid) }}</div>
            <div class="text-caption text-medium-emphasis">Unpaid: {{ $formatPrice(dashboard.sales.unpaid) }}</div>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card elevation="2" class="pa-4">
            <div class="d-flex justify-space-between align-center mb-3">
              <h3 class="text-h6 font-weight-bold">Purchases</h3>
              <v-select v-model="periods.purchases" :items="periodOptions" density="compact" hide-details
                variant="outlined" style="max-width: 140px" @update:modelValue="loadPurchases" />
            </div>
            <div class="text-h5 font-weight-bold">{{ $formatPrice(dashboard.purchases.total || 0) }}</div>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card elevation="2" class="pa-4" height="450">
            <div class="d-flex justify-space-between align-center mb-4">
              <h3 class="text-h6 font-weight-bold">Profit &amp; Loss</h3>
              <v-select v-model="periods.profitloss" :items="periodOptions" density="compact" hide-details
                variant="outlined" style="max-width: 160px" @update:modelValue="loadProfitLoss" />
            </div>
            <client-only>
              <apexchart type="bar" height="320" :options="profitLossOptions" :series="profitLossSeries" />
            </client-only>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card elevation="2" class="pa-4" height="450">
            <div class="d-flex justify-space-between align-center mb-4">
              <h3 class="text-h6 font-weight-bold">Expense Breakdown</h3>
              <v-select v-model="periods.expense" :items="periodOptions" density="compact" hide-details
                variant="outlined" style="max-width: 140px" @update:modelValue="loadExpenseChart" />
            </div>
            <client-only>
              <apexchart type="donut" height="300" :options="expenseChartOptions" :series="expenseSeries" />
            </client-only>
            <div class="text-center mt-2 text-body-2">Total: <b>{{ $formatPrice(expense.chartTotal || 0) }}</b></div>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import { useExpenseStore } from '@/stores/expense'
import { useOrdersStore } from '@/stores/orders'
import { storeToRefs } from 'pinia'
import { useBranchSelector } from '@/composables/useBranchSelector'

const Auth = useAuthStore()
const { userInfo, role } = storeToRefs(Auth)
const dashboard = useDashboardStore()
const expense = useExpenseStore()
const orders = useOrdersStore()
const { isSuperAdmin, selectedBranchId, branchOptions } = useBranchSelector()

const companyName = computed(() => userInfo.value?.company?.name || 'My Restaurant')
const roleLabels = {
  SUPERADMIN: 'Super Admin', BRANCHADMIN: 'Branch Admin', KITCHEN: 'Kitchen',
  CASHIER: 'Cashier', WAITER: 'Waiter', ACCOUNTANT: 'Accountant',
}
const roleLabel = computed(() => roleLabels[role.value] || '')
const canSeeAccounting = computed(() => ['SUPERADMIN', 'BRANCHADMIN', 'ACCOUNTANT'].includes(role.value))

const recentOrders = computed(() => orders.orders.slice(0, 8))
const ordersToday = computed(() => {
  const today = new Date().toDateString()
  return orders.orders.filter((o) => new Date(o.createdAt).toDateString() === today)
})
const activeOrders = computed(() => orders.orders.filter((o) => !['COMPLETED', 'CANCELLED'].includes(o.status)))
const servedOrders = computed(() => orders.orders.filter((o) => o.status === 'SERVED'))
const revenueToday = computed(() =>
  ordersToday.value.filter((o) => o.status === 'COMPLETED').reduce((s, o) => s + o.totalAmount, 0)
)

const periods = ref({ cashflow: 'thisMonth', sales: 'thisYear', purchases: 'thisYear', profitloss: 'thisYear', expense: 'thisYear' })
const periodOptions = [
  { title: 'This Year', value: 'thisYear' },
  { title: 'This Quarter', value: 'thisQuarter' },
  { title: 'This Month', value: 'thisMonth' },
  { title: 'Year to Date', value: 'yearToDate' },
]

const loadCashflow = async () => await dashboard.fetchCashflow(periods.value.cashflow)
const loadSales = async () => await dashboard.fetchSales(periods.value.sales)
const loadPurchases = async () => await dashboard.fetchPurchases(periods.value.purchases)
const loadProfitLoss = async () => await dashboard.fetchProfitLoss(periods.value.profitloss)
const loadExpenseChart = async () => await expense.fetchExpenseChart(periods.value.expense)

const { $formatPrice } = useNuxtApp()

const expenseSeries = computed(() => expense.chartData?.map((i) => i.total) ?? [])
const expenseChartOptions = computed(() => ({
  labels: expense.chartData?.map((i) => i.category) ?? [],
  chart: { type: 'donut', toolbar: { show: false } },
  legend: { position: 'bottom' },
  dataLabels: { enabled: true },
}))

const profitLossSeries = computed(() => [{ name: 'Profit / Loss', data: dashboard.profitloss.values }])
const profitLossOptions = computed(() => ({
  chart: { toolbar: { show: false } },
  plotOptions: { bar: { columnWidth: '45%', colors: { ranges: [{ from: 0, to: 999999999, color: 'green' }, { from: -999999999, to: -1, color: 'red' }] } } },
  xaxis: { categories: dashboard.profitloss.labels, labels: { style: { fontSize: '12px' } } },
  dataLabels: { enabled: false },
  tooltip: { y: { formatter: (val) => `${$formatPrice(val)}` } },
}))

const cashflowSeries = computed(() => {
  const timeline = dashboard.cashflow?.timeline
  if (!timeline) return []
  return [
    { name: 'Inflow (Payments)', data: timeline.inflow ?? [] },
    { name: 'Outflow (Purchases)', data: timeline.outflow ?? [] },
  ]
})
const chartOptions = computed(() => {
  const timeline = dashboard.cashflow?.timeline
  return {
    chart: { toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: 'smooth', width: 3 },
    colors: ['#2196F3', '#E91E63'],
    xaxis: { categories: timeline?.labels ?? [] },
    legend: { position: 'top' },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (val) => `${$formatPrice(val)}` } },
  }
})

async function loadOrders() {
  if (!selectedBranchId.value) return
  await orders.fetchOrders(selectedBranchId.value, { take: 50 })
}

onMounted(async () => {
  await loadOrders()
  if (canSeeAccounting.value) {
    await loadCashflow()
    await loadSales()
    await loadPurchases()
    await loadProfitLoss()
    await loadExpenseChart()
  }
})

watch(selectedBranchId, (val) => { if (val) loadOrders() })
</script>
