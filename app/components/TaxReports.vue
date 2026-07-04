<template>
  <v-container fluid class="pa-6">
    <v-card elevation="2" class="rounded-lg">

      <!-- 🔹 Header -->
      <v-card-title class="text-h6 d-flex align-center justify-space-between">
        <div>
          Tax Report
          <p class="text-body-2 text-medium-emphasis mt-1 mb-0">
            View order-wise tax breakup
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
          <v-btn color="primary" variant="flat"
                 @click="loadTaxReport"
                 :disabled="reportStore.loading">
            APPLY FILTER
          </v-btn>
        </div>
      </v-card-title>

      <v-divider />

      <!-- 📊 Tax Report Body -->
      <div v-if="report?.length" class="pa-4">
        <table class="pl-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Customer</th>
              <th class="text-end">Tax Type</th>
              <th class="text-end">Rate %</th>
              <th class="text-end">Tax Amount</th>
              <th class="text-end">Order Total</th>
            </tr>
          </thead>

          <tbody>
            <template v-for="order in report" :key="order.orderId">
              <tr v-for="tx in order.taxes" :key="tx.taxName + order.orderId">
                <td>{{ order.orderId.slice(0, 8) }}</td>
                <td>{{ formatDate(order.date) }}</td>
                <td>{{ order.customerName }}</td>
                <td class="text-end">{{ tx.taxType }}</td>
                <td class="text-end">{{ tx.rate }}%</td>
                <td class="text-end">{{ $formatPrice(tx.amount) }}</td>
                <td class="text-end">{{ $formatPrice(order.totalAmount) }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- ℹ️ Empty State -->
      <v-alert v-else type="info" variant="tonal" border="start" class="ma-4">
        No Tax Report found.
      </v-alert>

    </v-card>
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
</style>