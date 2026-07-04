<template>
  <v-container fluid class="pa-6">
    <v-sheet elevation="0" class="d-flex align-center justify-space-between mb-6 px-4 py-3 bg-surface rounded-lg">
      <div>
        <h2 class="text-h5 font-weight-bold mb-0">Kitchen Display</h2>
        <p class="text-body-2 text-medium-emphasis">Live incoming tickets</p>
      </div>
      <v-select v-if="isSuperAdmin" v-model="selectedBranchId" :items="branchOptions" label="Branch"
        density="compact" variant="outlined" hide-details style="max-width: 220px" />
    </v-sheet>

    <v-row>
      <v-col v-for="col in columns" :key="col.status" cols="12" md="4">
        <v-sheet class="pa-3 rounded-lg mb-3" :color="col.color" variant="tonal">
          <div class="d-flex justify-space-between align-center">
            <span class="font-weight-bold">{{ col.label }}</span>
            <v-chip size="small">{{ ticketsFor(col.status).length }}</v-chip>
          </div>
        </v-sheet>

        <v-card v-for="ticket in ticketsFor(col.status)" :key="ticket.id" class="mb-3 rounded-lg" elevation="2">
          <v-card-text>
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="font-weight-bold">{{ ticket.token }}</span>
              <v-chip size="small" variant="tonal">{{ ticket.station }}</v-chip>
            </div>
            <div class="text-caption text-medium-emphasis mb-2">
              {{ ticket.order?.table?.tableNo || 'Takeaway' }} &middot;
              {{ new Date(ticket.createdAt).toLocaleTimeString() }}
            </div>

            <v-divider class="mb-2" />

            <div v-for="item in ticket.orderItems" :key="item.id" class="d-flex justify-space-between text-body-2 mb-1">
              <span>{{ item.quantity }} &times; {{ item.menuItem?.name }}</span>
            </div>
            <div v-for="item in ticket.orderItems.filter(i => i.remarks)" :key="item.id + '-note'" class="text-caption text-error">
              Note: {{ item.remarks }}
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn v-if="col.status === 'PENDING'" size="small" color="primary" :loading="busyId === ticket.id" @click="advance(ticket, 'PREPARING')">
              Start Preparing
            </v-btn>
            <v-btn v-if="col.status === 'PREPARING'" size="small" color="success" :loading="busyId === ticket.id" @click="advance(ticket, 'READY')">
              Mark Ready
            </v-btn>
            <v-btn v-if="col.status === 'READY'" size="small" variant="tonal" :loading="busyId === ticket.id" @click="advance(ticket, 'COMPLETED')">
              Handed Off
            </v-btn>
          </v-card-actions>
        </v-card>

        <div v-if="!ticketsFor(col.status).length" class="text-center text-medium-emphasis py-6">
          No tickets
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useKitchenStore } from '@/stores/kitchen'
import { useBranchSelector } from '@/composables/useBranchSelector'

const kitchen = useKitchenStore()
const toast = useToast()
const { isSuperAdmin, selectedBranchId, branchOptions } = useBranchSelector()
const { $socket } = useNuxtApp()
const busyId = ref(null)

const columns = [
  { status: 'PENDING', label: 'Incoming', color: 'warning' },
  { status: 'PREPARING', label: 'Preparing', color: 'info' },
  { status: 'READY', label: 'Ready', color: 'success' },
]

function ticketsFor(status) {
  return kitchen.tickets.filter((t) => t.status === status)
}

async function advance(ticket, status) {
  busyId.value = ticket.id
  try {
    await kitchen.updateTicketStatus(ticket.id, status, selectedBranchId.value)
    if (status === 'COMPLETED') kitchen.tickets = kitchen.tickets.filter((t) => t.id !== ticket.id)
  } catch (err) {
    toast.error(err.response?.data?.message || 'That action is not allowed right now')
  } finally {
    busyId.value = null
  }
}

async function load() {
  if (!selectedBranchId.value) return
  await kitchen.fetchTickets(selectedBranchId.value)
  $socket.emit('join:branch', selectedBranchId.value)
}

function onTicketEvent(ticket) {
  if (ticket.order?.branchId && ticket.order.branchId !== selectedBranchId.value) return
  if (ticket.status === 'COMPLETED') kitchen.tickets = kitchen.tickets.filter((t) => t.id !== ticket.id)
  else kitchen.upsertTicket(ticket)
}

function onNewOrder() {
  load()
}

onMounted(() => {
  load()
  $socket.on('kitchen:ticket', onTicketEvent)
  $socket.on('order:new', onNewOrder)
})

onBeforeUnmount(() => {
  $socket.off('kitchen:ticket', onTicketEvent)
  $socket.off('order:new', onNewOrder)
})

watch(selectedBranchId, (val) => { if (val) load() })
</script>
