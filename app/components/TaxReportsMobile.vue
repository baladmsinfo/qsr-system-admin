<template>
  <div class="mobile-shell-page">
    <MobilePageHeader title="Tax Report" subtitle="Order-wise tax breakup">
      <v-btn icon="mdi-tune-variant" variant="tonal" color="primary" density="comfortable" @click="filtersOpen = true" />
    </MobilePageHeader>

    <div class="pa-4">
      <MobileEmptyState v-if="!report?.length" icon="mdi-receipt-text-outline" title="No Tax Report found" />

      <MobileOrderCard v-for="order in report" :key="order.orderId"
        :title="`#${order.orderId.slice(0, 8).toUpperCase()}`"
        :subtitle="`${formatDate(order.date)} · ${order.customerName}`" class="mb-3">
        <template #status>
          <span class="text-subtitle-2 font-weight-bold mono-data">{{ $formatPrice(order.totalAmount) }}</span>
        </template>
        <div v-for="tx in order.taxes" :key="tx.taxName" class="d-flex justify-space-between py-1">
          <span>{{ tx.taxType }} ({{ tx.rate }}%)</span>
          <span class="mono-data">{{ $formatPrice(tx.amount) }}</span>
        </div>
      </MobileOrderCard>
    </div>

    <MobileBottomSheet v-model="filtersOpen" title="Filter by Date">
      <v-text-field v-model="startDate" type="date" label="Start Date" density="comfortable" class="mb-2" />
      <v-text-field v-model="endDate" type="date" label="End Date" density="comfortable" class="mb-3" />
      <v-btn block size="large" color="primary" class="font-weight-bold" :disabled="reportStore.loading"
        @click="loadTaxReport(); filtersOpen = false">
        Apply Filter
      </v-btn>
    </MobileBottomSheet>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useReportStore } from "~/stores/reports"

const { $formatPrice } = useNuxtApp();

const reportStore = useReportStore()

const startDate = ref(null)
const endDate = ref(null)
const report = ref([])
const filtersOpen = ref(false)

const loadTaxReport = async () => {
  report.value = await reportStore.fetchTaxReport(startDate.value, endDate.value)
}

const formatDate = (date) => new Date(date).toLocaleDateString("en-IN")

onMounted(async () => {
  await loadTaxReport()
})
</script>
