<template>
  <v-container fluid class="pa-4 pa-md-8">
    <div class="d-flex flex-wrap justify-space-between align-center mb-8 ga-3">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Dashboard</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">{{ companyName }} &middot; {{ roleLabel }}</p>
      </div>
      <v-select v-if="isSuperAdmin" v-model="selectedBranchId" :items="branchOptions" label="Branch"
        density="compact" hide-details style="max-width: 220px" />
    </div>

    <!-- KPI ROW (Bento) -->
    <v-row class="mb-2">
      <v-col cols="6" md="3">
        <div class="stat-tile">
          <div class="stat-label mb-2">Orders Today</div>
          <div class="stat-value">{{ ordersToday.length }}</div>
        </div>
      </v-col>
      <v-col cols="6" md="3">
        <div class="stat-tile">
          <div class="stat-label mb-2">Revenue Today</div>
          <div class="stat-value">{{ $formatPrice(revenueToday) }}</div>
        </div>
      </v-col>
      <v-col cols="6" md="3">
        <div class="stat-tile">
          <div class="stat-label mb-2">Active Orders</div>
          <div class="stat-value">{{ activeOrders.length }}</div>
        </div>
      </v-col>
      <v-col cols="6" md="3">
        <div class="stat-tile">
          <div class="stat-label mb-2">Awaiting Billing</div>
          <div class="stat-value">{{ servedOrders.length }}</div>
        </div>
      </v-col>
    </v-row>

    <!-- ACCOUNTING CHARTS (SUPERADMIN / BRANCHADMIN / ACCOUNTANT) -->
    <template v-if="canSeeAccounting">
      <h2 class="text-h6 font-weight-bold mt-10 mb-5">Cashflow Overview</h2>
      <v-row>
        <v-col cols="12">
          <div class="app-card pa-5">
            <div class="d-flex justify-space-between align-center mb-4">
              <span class="text-subtitle-1 font-weight-bold">Payments vs Purchases</span>
              <v-select v-model="periods.cashflow" :items="periodOptions" density="compact" hide-details
                style="max-width: 160px" @update:modelValue="loadCashflow" />
            </div>
            <client-only>
              <apexchart type="line" height="320" :options="chartOptions" :series="cashflowSeries" />
            </client-only>
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <div class="app-card pa-5">
            <div class="d-flex justify-space-between align-center mb-3">
              <span class="text-subtitle-1 font-weight-bold">Sales</span>
              <v-select v-model="periods.sales" :items="periodOptions" density="compact" hide-details
                style="max-width: 140px" @update:modelValue="loadSales" />
            </div>
            <div class="stat-value" style="font-size: 26px">{{ $formatPrice(dashboard.sales.paid) }}</div>
            <div class="text-caption text-medium-emphasis">Unpaid: {{ $formatPrice(dashboard.sales.unpaid) }}</div>
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <div class="app-card pa-5">
            <div class="d-flex justify-space-between align-center mb-3">
              <span class="text-subtitle-1 font-weight-bold">Purchases</span>
              <v-select v-model="periods.purchases" :items="periodOptions" density="compact" hide-details
                style="max-width: 140px" @update:modelValue="loadPurchases" />
            </div>
            <div class="stat-value" style="font-size: 26px">{{ $formatPrice(dashboard.purchases.total || 0) }}</div>
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <div class="app-card pa-5" style="height: 450px">
            <div class="d-flex justify-space-between align-center mb-4">
              <span class="text-subtitle-1 font-weight-bold">Profit &amp; Loss</span>
              <v-select v-model="periods.profitloss" :items="periodOptions" density="compact" hide-details
                style="max-width: 160px" @update:modelValue="loadProfitLoss" />
            </div>
            <client-only>
              <apexchart type="bar" height="320" :options="profitLossOptions" :series="profitLossSeries" />
            </client-only>
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <div class="app-card pa-5" style="height: 450px">
            <div class="d-flex justify-space-between align-center mb-4">
              <span class="text-subtitle-1 font-weight-bold">Expense Breakdown</span>
              <v-select v-model="periods.expense" :items="periodOptions" density="compact" hide-details
                style="max-width: 140px" @update:modelValue="loadExpenseChart" />
            </div>
            <client-only>
              <apexchart type="donut" height="300" :options="expenseChartOptions" :series="expenseSeries" />
            </client-only>
            <div class="text-center mt-2 text-body-2">Total: <b>{{ $formatPrice(expense.chartTotal || 0) }}</b></div>
          </div>
        </v-col>
      </v-row>
    </template>

        <!-- RECENT ORDERS -->
    <div class="d-flex justify-space-between align-center mt-10 mb-5">
      <h2 class="text-h6 font-weight-bold mb-0">Recent Orders</h2>
      <NuxtLink to="/admin/orders" class="text-body-2 font-weight-medium" style="color: rgb(var(--v-theme-primary)); text-decoration: none">
        View All &rarr;
      </NuxtLink>
    </div>

    <v-row>
      <v-col v-for="order in recentOrders" :key="order.id" cols="12" sm="6" lg="4">
        <div class="app-card pa-5 h-100 d-flex flex-column ga-3">
          <div class="d-flex justify-space-between align-start">
            <div>
              <div class="text-subtitle-1 font-weight-bold">{{ order.table?.tableNo || 'Takeaway' }}</div>
              <div class="text-caption text-medium-emphasis mono-data">#{{ order.id.slice(0, 8).toUpperCase() }}</div>
            </div>
            <v-chip size="small" :color="statusColor(order.status)" variant="tonal" class="text-uppercase font-weight-bold" style="font-size: 10px">
              {{ order.status }}
            </v-chip>
          </div>
          <div class="d-flex justify-space-between align-center mt-auto">
            <span class="text-h6 font-weight-bold mono-data">{{ $formatPrice(order.totalAmount) }}</span>
          </div>
        </div>
      </v-col>

      <v-col v-if="!recentOrders.length" cols="12">
        <div class="app-card pa-10 text-center text-medium-emphasis">No orders yet today</div>
      </v-col>
    </v-row>
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

function statusColor(status) {
  return {
    PLACED: 'grey', ACCEPTED: 'info', PREPARING: 'warning', READY: 'success',
    SERVED: 'primary', COMPLETED: 'success', CANCELLED: 'error',
  }[status] || 'grey'
}

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
    colors: ['#6D28D9', '#F59E0B'],
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
