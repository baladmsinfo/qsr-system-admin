<template>
  <div class="mobile-shell-page">
    <MobilePageHeader title="Dashboard" :subtitle="`${companyName} · ${roleLabel}`">
      <MobileBranchPicker v-if="isSuperAdmin" v-model="selectedBranchId" :items="branchOptions" />
    </MobilePageHeader>

    <MobileLoading v-if="loading" :count="4" type="card" />

    <div v-else class="pa-4">
      <!-- HERO GREETING -->
      <div class="mobile-dashboard-hero mb-5">
        <div class="mobile-dashboard-hero-glow" />
        <div class="mobile-dashboard-hero-eyebrow">Welcome back</div>
        <div class="text-h6 font-weight-bold mb-1">{{ companyName }}</div>
        <div class="d-flex align-center ga-1 text-body-2 mobile-dashboard-hero-sub">
          <v-icon size="16" color="white">mdi-trending-up</v-icon>
          <span>Revenue today &middot; {{ $formatPrice(revenueToday) }}</span>
        </div>
      </div>

      <!-- KPI GRID -->
      <div class="mobile-stat-grid mb-6">
        <MobileStatCard label="Orders Today" :value="ordersToday.length" />
        <MobileStatCard label="Revenue Today" :value="$formatPrice(revenueToday)" />
        <MobileStatCard label="Active Orders" :value="activeOrders.length" />
        <MobileStatCard label="Awaiting Billing" :value="servedOrders.length" />
      </div>

      <!-- CHARTS -->
      <template v-if="canSeeAccounting">
        <div class="mobile-section-title mb-3">Cashflow Overview</div>

        <div class="app-card pa-4 mb-4">
          <div class="d-flex justify-space-between align-center mb-3 ga-2">
            <span class="text-subtitle-2 font-weight-bold">Payments vs Purchases</span>
            <v-select v-model="periods.cashflow" :items="periodOptions" density="compact" hide-details
              style="max-width: 130px" @update:modelValue="loadCashflow" />
          </div>
          <client-only>
            <apexchart type="line" height="220" :options="chartOptions" :series="cashflowSeries" />
          </client-only>
        </div>

        <div class="app-card pa-4 mb-4">
          <div class="d-flex justify-space-between align-center mb-2 ga-2">
            <span class="text-subtitle-2 font-weight-bold">Sales</span>
            <v-select v-model="periods.sales" :items="periodOptions" density="compact" hide-details
              style="max-width: 130px" @update:modelValue="loadSales" />
          </div>
          <div class="mobile-stat-value">{{ $formatPrice(dashboard.sales.paid) }}</div>
          <div class="text-caption text-medium-emphasis">Unpaid: {{ $formatPrice(dashboard.sales.unpaid) }}</div>
        </div>

        <div class="app-card pa-4 mb-4">
          <div class="d-flex justify-space-between align-center mb-2 ga-2">
            <span class="text-subtitle-2 font-weight-bold">Purchases</span>
            <v-select v-model="periods.purchases" :items="periodOptions" density="compact" hide-details
              style="max-width: 130px" @update:modelValue="loadPurchases" />
          </div>
          <div class="mobile-stat-value">{{ $formatPrice(dashboard.purchases.total || 0) }}</div>
        </div>

        <div class="app-card pa-4 mb-4">
          <div class="d-flex justify-space-between align-center mb-3 ga-2">
            <span class="text-subtitle-2 font-weight-bold">Profit &amp; Loss</span>
            <v-select v-model="periods.profitloss" :items="periodOptions" density="compact" hide-details
              style="max-width: 130px" @update:modelValue="loadProfitLoss" />
          </div>
          <client-only>
            <apexchart type="bar" height="220" :options="profitLossOptions" :series="profitLossSeries" />
          </client-only>
        </div>

        <div class="app-card pa-4 mb-4">
          <div class="d-flex justify-space-between align-center mb-3 ga-2">
            <span class="text-subtitle-2 font-weight-bold">Expense Breakdown</span>
            <v-select v-model="periods.expense" :items="periodOptions" density="compact" hide-details
              style="max-width: 130px" @update:modelValue="loadExpenseChart" />
          </div>
          <client-only>
            <apexchart type="donut" height="240" :options="expenseChartOptions" :series="expenseSeries" />
          </client-only>
          <div class="text-center mt-2 text-body-2">Total: <b>{{ $formatPrice(expense.chartTotal || 0) }}</b></div>
        </div>
      </template>

      <!-- RECENT ORDERS -->
      <div class="d-flex justify-space-between align-center mb-3">
        <div class="mobile-section-title mb-0">Recent Orders</div>
        <NuxtLink to="/admin/orders" class="text-caption font-weight-medium" style="color: rgb(var(--v-theme-primary)); text-decoration: none">
          View All &rarr;
        </NuxtLink>
      </div>

      <MobileEmptyState v-if="!recentOrders.length" icon="mdi-receipt-text-outline" title="No orders yet today"
        description="Orders placed today will show up here." />

      <MobileOrderCard v-for="order in recentOrders" :key="order.id"
        :title="order.table?.tableNo || 'Takeaway'" :subtitle="`#${order.id.slice(0, 8).toUpperCase()}`"
        class="mb-3">
        <template #status>
          <MobileStatusChip :status="order.status" :color="statusHex(order.status)" size="small" />
        </template>
        <span class="text-subtitle-1 font-weight-bold mono-data">{{ $formatPrice(order.totalAmount) }}</span>
      </MobileOrderCard>
    </div>
  </div>
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

const loading = ref(true)

const companyName = computed(() => userInfo.value?.company?.name || 'My Business')
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

function statusHex(status) {
  return {
    PLACED: '#8B8599', ACCEPTED: '#0EA5E9', PREPARING: '#F59E0B', READY: '#22C55E',
    SERVED: '#7C3AED', COMPLETED: '#22C55E', CANCELLED: '#EF4444',
  }[status] || '#8B8599'
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
  xaxis: { categories: dashboard.profitloss.labels, labels: { style: { fontSize: '11px' } } },
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
    colors: ['#7C3AED', '#F59E0B'],
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
  loading.value = true
  await loadOrders()
  if (canSeeAccounting.value) {
    await loadCashflow()
    await loadSales()
    await loadPurchases()
    await loadProfitLoss()
    await loadExpenseChart()
  }
  loading.value = false
})

watch(selectedBranchId, (val) => { if (val) loadOrders() })
</script>

<style scoped>
.mobile-dashboard-hero {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  padding: 20px 18px;
  background: linear-gradient(135deg, #7C3AED 0%, #DB2777 100%);
  box-shadow: 0 14px 32px -10px rgba(124, 58, 237, 0.45);
  color: #fff;
}
.mobile-dashboard-hero-glow {
  position: absolute;
  top: -40px;
  right: -30px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
}
.mobile-dashboard-hero-eyebrow {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.85;
  margin-bottom: 4px;
}
.mobile-dashboard-hero-sub {
  opacity: 0.92;
}

.mobile-stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.mobile-stat-grid > * {
  min-width: 0;
}

.mobile-section-title {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.9375rem;
  font-weight: 700;
}

.mobile-stat-value {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #1A1626;
}
</style>
