<template>
  <div class="mobile-shell-page">
    <MobilePageHeader title="Journal Entries" subtitle="View all journal transactions">
      <v-btn icon="mdi-tune-variant" variant="tonal" color="primary" density="comfortable" @click="filtersOpen = true" />
    </MobilePageHeader>

    <div class="pa-4">
      <MobileEmptyState v-if="!displayedJournals.length" icon="mdi-notebook-outline" title="No journal entries found" />

      <div v-for="item in displayedJournals" :key="item.id" class="app-card pa-4 mb-3">
        <div class="d-flex justify-space-between align-start mb-2">
          <div>
            <div class="text-caption text-medium-emphasis">{{ new Date(item.date).toLocaleDateString() }}</div>
            <div class="font-weight-bold text-body-2">{{ item.account.name }}</div>
          </div>
        </div>
        <div v-if="item.description" class="text-body-2 text-medium-emphasis mb-2">{{ item.description }}</div>
        <v-divider class="mb-2" />
        <div class="d-flex justify-space-between">
          <div>
            <div class="text-caption text-medium-emphasis">Debit</div>
            <div class="font-weight-medium mono-data">{{ item.debit ? $formatPrice(item.debit.toFixed(2)) : '—' }}</div>
          </div>
          <div class="text-right">
            <div class="text-caption text-medium-emphasis">Credit</div>
            <div class="font-weight-medium mono-data">{{ item.credit ? $formatPrice(item.credit.toFixed(2)) : '—' }}</div>
          </div>
        </div>
      </div>

      <div v-if="displayedJournals.length < journalStore.pagination.total" class="d-flex justify-center mt-2 mb-4">
        <v-btn variant="outlined" class="load-more-btn" :loading="journalStore.loading" @click="loadMore">View More</v-btn>
      </div>
    </div>

    <MobileBottomSheet v-model="filtersOpen" title="Filter by Date">
      <v-text-field v-model="filters.startDate" type="date" label="Start Date" density="comfortable" class="mb-2" />
      <v-text-field v-model="filters.endDate" type="date" label="End Date" density="comfortable" class="mb-3" />
      <v-btn block size="large" color="primary" class="font-weight-bold" :loading="journalStore.loading"
        @click="resetAndFetch(); filtersOpen = false">
        Filter
      </v-btn>
    </MobileBottomSheet>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useJournalStore } from '@/stores/journal'

const { $formatPrice } = useNuxtApp();

const journalStore = useJournalStore()
const { filters } = storeToRefs(journalStore)
const filtersOpen = ref(false)

const displayedJournals = ref([])
watch(() => journalStore.journals, (list) => {
  displayedJournals.value = journalStore.pagination.page === 1 ? list : [...displayedJournals.value, ...list]
})

async function fetchData() {
  if (filters.value.startDate && filters.value.endDate) {
    filters.value.startDate = new Date(filters.value.startDate).toISOString().split('T')[0]
    filters.value.endDate = new Date(filters.value.endDate).toISOString().split('T')[0]
  }
  await journalStore.fetchJournals()
}

function resetAndFetch() {
  journalStore.pagination.page = 1
  fetchData()
}

function loadMore() {
  journalStore.pagination.page += 1
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>
