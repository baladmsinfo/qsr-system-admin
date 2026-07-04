<template>
    <v-container fluid class="pa-6">
        <!-- Header -->
        <v-sheet class="d-flex flex-wrap align-center justify-space-between mb-6 px-4 py-3 rounded-lg" elevation="1">
            <!-- Title Section -->
            <div class="d-flex flex-column">
                <h2 class="text-h5 font-weight-bold mb-1">Journal Entries</h2>
                <p class="text-body-2 text-medium-emphasis mb-0">
                    View all journal transactions
                </p>
            </div>

            <!-- Filters Section -->
            <div class="d-flex align-center flex-wrap ga-3">
                <v-text-field v-model="filters.startDate" type="date" label="Start Date" density="comfortable"
                    hide-details variant="outlined" style="max-width: 180px;" />
                <v-text-field v-model="filters.endDate" type="date" label="End Date" density="comfortable" hide-details
                    variant="outlined" style="max-width: 180px;" />
                <v-btn color="primary" class="text-none font-weight-medium" @click="fetchData"
                    :loading="journalStore.loading" height="44">
                    Filter
                </v-btn>
            </div>
        </v-sheet>

        <!-- Table -->
        <v-card>
            <v-data-table-server :headers="headers" :items="journalStore.journals" :loading="journalStore.loading"
                v-model:page="journalStore.pagination.page" v-model:items-per-page="journalStore.pagination.take"
                :items-length="journalStore.pagination.total" :items-per-page-options="[5, 10, 20, 50]"
                class="elevation-1" @update:page="onPaginationChange" @update:items-per-page="onItemsPerPageChange">
                <template #item.date="{ item }">
                    {{ new Date(item.date).toLocaleDateString() }}
                </template>

                <template #item.account="{ item }">
                    {{ item.account.name }}
                </template>

                <template #item.debit="{ item }">
                    {{ $formatPrice(item.debit.toFixed(2)) }}
                </template>

                <template #item.credit="{ item }">
                    {{ $formatPrice(item.credit.toFixed(2)) }}
                </template>
            </v-data-table-server>
        </v-card>
    </v-container>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useJournalStore } from '@/stores/journal'

const { $formatPrice } = useNuxtApp();

const journalStore = useJournalStore()
const { filters } = storeToRefs(journalStore)

const headers = [
    { title: 'Date', key: 'date' },
    { title: 'Account', key: 'account' },
    { title: 'Description', key: 'description' },
    { title: 'Debit', key: 'debit', align: 'end' },
    { title: 'Credit', key: 'credit', align: 'end' },
]

function fetchData() {
    // ✅ Ensure ISO format before calling the API
    if (filters.value.startDate && filters.value.endDate) {
        filters.value.startDate = new Date(filters.value.startDate)
            .toISOString()
            .split('T')[0]
        filters.value.endDate = new Date(filters.value.endDate)
            .toISOString()
            .split('T')[0]
    }

    console.log('Fetching journals with filters:', filters.value)
    journalStore.fetchJournals()
}

function onPaginationChange() {
    fetchData()
}

function onItemsPerPageChange() {
    journalStore.pagination.page = 1
    fetchData()
}

onMounted(() => {
    fetchData()
})
</script>