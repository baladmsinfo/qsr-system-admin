<template>
  <v-container fluid class="pa-6">
    <div class="app-header-bar d-flex flex-wrap align-center justify-space-between mb-6 px-5 py-4 ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-0">Kitchen Display</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">Live incoming tickets</p>
      </div>
      <v-select v-if="isSuperAdmin" v-model="selectedBranchId" :items="branchOptions" label="Branch"
        density="compact" hide-details style="max-width: 220px" />
    </div>

    <!-- Cancelled orders/tickets needing acknowledgment - kept clearly separate
         and prominent so the kitchen never misses that work should stop. -->
    <div v-if="cancelledTickets.length" class="mb-6">
      <div class="d-flex align-center ga-2 mb-3 px-1">
        <v-icon color="error" size="20">mdi-alert-circle</v-icon>
        <span class="text-subtitle-2 font-weight-bold text-uppercase text-error" style="letter-spacing: 0.04em">
          Cancelled - Needs Acknowledgment
        </span>
        <v-chip size="small" color="error" variant="flat" class="font-weight-bold">{{ cancelledTickets.length }}</v-chip>
      </div>

      <v-row>
        <v-col v-for="ticket in cancelledTickets" :key="ticket.id" cols="12" sm="6" md="4">
          <div class="app-card cancelled-ticket-card">
            <div class="pa-5">
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="font-weight-bold mono-data">{{ ticket.token }}</span>
                <v-chip size="small" color="error" variant="flat" class="font-weight-bold">ORDER CANCELLED</v-chip>
              </div>
              <div class="text-caption text-medium-emphasis mb-2">
                {{ ticket.order?.table?.tableNo || 'Takeaway' }} &middot; {{ ticket.station }}
              </div>

              <v-divider class="mb-2" />

              <div v-for="item in ticket.orderItems" :key="item.id" class="d-flex justify-space-between text-body-2 mb-1 item-cancelled-text">
                <span>{{ item.quantity }} &times; {{ item.menuItem?.name }}</span>
              </div>
            </div>
            <div class="d-flex align-center px-5 pb-4">
              <v-spacer />
              <v-btn size="small" color="error" variant="tonal" :loading="busyId === ticket.id" @click="dismiss(ticket)">
                Acknowledge &amp; Remove
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>
    </div>

    <v-row>
      <v-col v-for="col in columns" :key="col.status" cols="12" md="4">
        <div class="d-flex justify-space-between align-center mb-3 px-1">
          <span class="text-subtitle-2 font-weight-bold text-uppercase" :style="{ color: `rgb(var(--v-theme-${col.color}))`, letterSpacing: '0.04em' }">{{ col.label }}</span>
          <v-chip size="small" :color="col.color" variant="tonal" class="font-weight-bold">{{ ticketsFor(col.status).length }}</v-chip>
        </div>

        <div v-for="ticket in ticketsFor(col.status)" :key="ticket.id" class="app-card mb-3">
          <div class="pa-5">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="font-weight-bold mono-data">{{ ticket.token }}</span>
              <v-chip size="small" variant="tonal">{{ ticket.station }}</v-chip>
            </div>
            <div class="text-caption text-medium-emphasis mb-2">
              {{ ticket.order?.table?.tableNo || 'Takeaway' }} &middot;
              {{ new Date(ticket.createdAt).toLocaleTimeString() }}
            </div>

            <v-divider class="mb-2" />

            <div v-for="item in ticket.orderItems" :key="item.id" class="d-flex justify-space-between align-center text-body-2 mb-1">
              <span :class="{ 'item-cancelled-text': item.status === 'CANCELLED' }">{{ item.quantity }} &times; {{ item.menuItem?.name }}</span>
              <v-chip v-if="item.status === 'CANCELLED'" size="x-small" color="error" variant="tonal">Cancelled</v-chip>
            </div>
            <div v-for="item in ticket.orderItems.filter(i => i.remarks && i.status !== 'CANCELLED')" :key="item.id + '-note'" class="text-caption text-error">
              Note: {{ item.remarks }}
            </div>

            <div v-if="readyToServeCount(ticket)" class="ready-to-serve-note mt-2 px-2 py-1 d-flex align-center ga-1">
              <v-icon size="14" color="info">mdi-lightning-bolt</v-icon>
              <span class="text-caption">
                + {{ readyToServeCount(ticket) }} ready-to-serve item{{ readyToServeCount(ticket) > 1 ? 's' : '' }} on this order - already handled
              </span>
            </div>
          </div>
          <div class="d-flex align-center px-5 pb-4">
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
          </div>
        </div>

        <div v-if="!ticketsFor(col.status).length" class="text-center text-medium-emphasis py-6">
          No tickets
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
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

// Fully cancelled (whole order, or every item on this ticket) - stays
// visible until the kitchen explicitly dismisses it (see dismiss()).
const cancelledTickets = computed(() => kitchen.tickets.filter((t) => t.status === 'CANCELLED' && !t.dismissedAt))

// Ready-to-serve items never get a ticket of their own (see
// orderService.createKitchenTickets) - this surfaces them as a note on
// whichever ticket(s) their order DOES have, so the kitchen has full
// context of the order even though they're not on this station's list.
function readyToServeCount(ticket) {
  return (ticket.order?.orderItems || []).filter(
    (i) => i.menuItem?.preparationType === 'READY_TO_SERVE' && i.status !== 'CANCELLED'
  ).length
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

async function dismiss(ticket) {
  busyId.value = ticket.id
  try {
    await kitchen.dismissTicket(ticket.id, selectedBranchId.value)
  } catch (err) {
    toast.error(err.response?.data?.message || 'Could not dismiss this ticket')
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
  // Completed tickets, and any ticket the kitchen has already dismissed
  // (e.g. acknowledged from a different KDS screen), drop off the board;
  // CANCELLED-but-undismissed tickets stay so they surface in the
  // acknowledgment section above.
  if (ticket.status === 'COMPLETED' || ticket.dismissedAt) {
    kitchen.tickets = kitchen.tickets.filter((t) => t.id !== ticket.id)
  } else {
    kitchen.upsertTicket(ticket)
  }
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

<style scoped>
.item-cancelled-text {
  text-decoration: line-through;
  color: rgba(0, 0, 0, 0.4);
}
.ready-to-serve-note {
  background: #EFF6FF;
  border-radius: 8px;
  color: #1D4ED8;
}
.cancelled-ticket-card {
  border: 1px solid rgb(var(--v-theme-error)) !important;
}
</style>
