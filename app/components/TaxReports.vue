<template>
  <v-container fluid class="pa-6">
    <!-- 🔹 Header -->
    <div class="app-header-bar d-flex flex-wrap align-center justify-space-between mb-6 px-5 py-4 ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-0">Tax Report</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          View order-wise tax breakup
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
        <v-btn color="primary" @click="loadTaxReport" :disabled="reportStore.loading">
          Apply Filter
        </v-btn>
      </div>
    </div>

    <!-- 📊 Tax Report Cards -->
    <v-row v-if="report?.length">
      <v-col v-for="order in report" :key="order.orderId" cols="12" md="6">
        <div class="app-card pa-5 h-100">
          <div class="d-flex justify-space-between align-start mb-2">
            <div>
              <div class="font-weight-bold mono-data">#{{ order.orderId.slice(0, 8).toUpperCase() }}</div>
              <div class="text-caption text-medium-emphasis">{{ formatDate(order.date) }} &middot; {{ order.customerName }}</div>
            </div>
            <span class="text-subtitle-1 font-weight-bold mono-data">{{ $formatPrice(order.totalAmount) }}</span>
          </div>
          <v-divider class="my-2" />
          <div v-for="tx in order.taxes" :key="tx.taxName" class="d-flex justify-space-between text-body-2 py-1">
            <span>{{ tx.taxType }} ({{ tx.rate }}%)</span>
            <span class="mono-data">{{ $formatPrice(tx.amount) }}</span>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- ℹ️ Empty State -->
    <div v-else class="app-card pa-10 text-center text-medium-emphasis">
      No Tax Report found.
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useReportStore } from "~/stores/reports"

const { $formatPrice } = useNuxtApp();

const reportStore = useReportStore()

const startDate = ref(null)
const endDate = ref(null)
const report = ref([])

const loadTaxReport = async () => {
  report.value = await reportStore.fetchTaxReport(startDate.value, endDate.value)
}

const formatDate = (date) => new Date(date).toLocaleDateString("en-IN")

onMounted(async () => {
  await loadTaxReport()    // default: load full report
})
</script>

