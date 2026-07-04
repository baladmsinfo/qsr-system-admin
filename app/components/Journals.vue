<template>
    <v-container fluid class="pa-6">
        <!-- Header -->
        <div class="app-header-bar d-flex flex-wrap align-center justify-space-between mb-6 px-5 py-4 ga-3">
            <!-- Title Section -->
            <div>
                <h1 class="text-h5 font-weight-bold mb-0">Journal Entries</h1>
                <p class="text-body-2 text-medium-emphasis mb-0">
                    View all journal transactions
                </p>
            </div>

            <!-- Filters Section -->
            <div class="d-flex align-center flex-wrap ga-3">
                <v-text-field v-model="filters.startDate" type="date" label="Start Date" density="comfortable"
                    hide-details style="max-width: 180px;" />
                <v-text-field v-model="filters.endDate" type="date" label="End Date" density="comfortable" hide-details
                    style="max-width: 180px;" />
                <v-btn color="primary" @click="resetAndFetch" :loading="journalStore.loading" height="44">
                    Filter
                </v-btn>
            </div>
        </div>

        <!-- Journal Entry Cards -->
        <div class="app-card">
            <div v-for="(item, idx) in displayedJournals" :key="item.id"
                class="d-flex flex-wrap justify-space-between align-center px-5 py-4 ga-3"
                :style="idx > 0 ? 'border-top: 1px solid #EAE6F2' : ''">
                <div style="min-width: 160px">
                    <div class="text-caption text-medium-emphasis">{{ new Date(item.date).toLocaleDateString() }}</div>
                    <div class="font-weight-bold">{{ item.account.name }}</div>
                </div>
                <div class="flex-grow-1 text-body-2 text-medium-emphasis" style="min-width: 200px">
                    {{ item.description }}
                </div>
                <div class="d-flex ga-6">
                    <div class="text-right" style="min-width: 90px">
                        <div class="text-caption text-medium-emphasis">Debit</div>
                        <div class="font-weight-medium mono-data">{{ item.debit ? $formatPrice(item.debit.toFixed(2)) : '—' }}</div>
                    </div>
                    <div class="text-right" style="min-width: 90px">
                        <div class="text-caption text-medium-emphasis">Credit</div>
                        <div class="font-weight-medium mono-data">{{ item.credit ? $formatPrice(item.credit.toFixed(2)) : '—' }}</div>
                    </div>
                </div>
            </div>

            <div v-if="!displayedJournals.length" class="text-center text-medium-emphasis py-10">
                No journal entries found
            </div>
        </div>

        <div v-if="displayedJournals.length < journalStore.pagination.total" class="d-flex justify-center mt-6">
            <v-btn variant="outlined" class="load-more-btn" :loading="journalStore.loading" @click="loadMore">View More</v-btn>
        </div>
    </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useJournalStore } from '@/stores/journal'

const { $formatPrice } = useNuxtApp();

const journalStore = useJournalStore()
const { filters } = storeToRefs(journalStore)

const displayedJournals = ref([])
watch(() => journalStore.journals, (list) => {
    displayedJournals.value = journalStore.pagination.page === 1 ? list : [...displayedJournals.value, ...list]
})

async function fetchData() {
    // ✅ Ensure ISO format before calling the API
    if (filters.value.startDate && filters.value.endDate) {
        filters.value.startDate = new Date(filters.value.startDate)
            .toISOString()
            .split('T')[0]
        filters.value.endDate = new Date(filters.value.endDate)
            .toISOString()
            .split('T')[0]
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