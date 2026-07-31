<template>
  <div class="mobile-shell-page">
    <MobilePageHeader title="Kitchen Display" subtitle="Live incoming tickets">
      <MobileBranchPicker v-if="isSuperAdmin" v-model="selectedBranchId" :items="branchOptions" />
    </MobilePageHeader>

    <!-- Cancelled - needs acknowledgment, always pinned above the column tabs -->
    <div v-if="cancelledTickets.length" class="pa-4 pb-0">
      <div class="d-flex align-center ga-2 mb-2">
        <v-icon color="error" size="18">mdi-alert-circle</v-icon>
        <span class="text-caption font-weight-bold text-uppercase text-error" style="letter-spacing: 0.04em">
          Needs Acknowledgment
        </span>
        <v-chip size="x-small" color="error" variant="flat" class="font-weight-bold">{{ cancelledTickets.length }}</v-chip>
      </div>

      <MobileOrderCard v-for="ticket in cancelledTickets" :key="ticket.id" accent
        :title="ticket.token" :subtitle="`${ticket.order?.table?.tableNo || 'Takeaway'} · ${ticket.station}`"
        class="mb-3">
        <template #status>
          <MobileStatusChip status="Cancelled" color="#EF4444" size="small" />
        </template>
        <div v-for="item in ticket.orderItems" :key="item.id" class="item-cancelled-text">
          {{ item.quantity }} &times; {{ item.menuItem?.name }}
        </div>
        <template #actions>
          <v-btn size="small" color="error" variant="tonal" class="font-weight-medium"
            :loading="busyId === ticket.id" @click="dismiss(ticket)">
            Acknowledge &amp; Remove
          </v-btn>
        </template>
      </MobileOrderCard>
    </div>

    <div class="mobile-status-row d-flex ga-2 px-4 py-3">
      <v-chip v-for="col in columns" :key="col.status" :color="activeColumn === col.status ? col.color : undefined"
        :variant="activeColumn === col.status ? 'flat' : 'tonal'" size="small" class="font-weight-bold flex-shrink-0"
        @click="activeColumn = col.status">
        {{ col.label }} ({{ ticketsFor(col.status).length }})
      </v-chip>
    </div>

    <div class="pa-4 pt-0">
      <MobileEmptyState v-if="!ticketsFor(activeColumn).length" icon="mdi-chef-hat" title="No tickets"
        description="Tickets will appear here as orders come in." />

      <MobileOrderCard v-for="ticket in ticketsFor(activeColumn)" :key="ticket.id"
        :title="ticket.token" :subtitle="`${ticket.order?.table?.tableNo || 'Takeaway'} · ${new Date(ticket.createdAt).toLocaleTimeString()}`"
        class="mb-3">
        <template #status>
          <v-chip size="x-small" variant="tonal">{{ ticket.station }}</v-chip>
        </template>

        <div v-for="item in ticket.orderItems" :key="item.id" class="d-flex justify-space-between align-center mb-1">
          <span :class="{ 'item-cancelled-text': item.status === 'CANCELLED' }">{{ item.quantity }} &times; {{ item.menuItem?.name }}</span>
          <v-chip v-if="item.status === 'CANCELLED'" size="x-small" color="error" variant="tonal">Cancelled</v-chip>
        </div>
        <div v-for="item in ticket.orderItems.filter(i => i.remarks && i.status !== 'CANCELLED')" :key="item.id + '-note'" class="text-caption text-error">
          Note: {{ item.remarks }}
        </div>

        <div v-if="readyToServeCount(ticket)" class="ready-to-serve-note mt-2 px-2 py-1 d-flex align-center ga-1">
          <v-icon size="14" color="info">mdi-lightning-bolt</v-icon>
          <span class="text-caption">
            + {{ readyToServeCount(ticket) }} ready-to-serve item{{ readyToServeCount(ticket) > 1 ? 's' : '' }} - already handled
          </span>
        </div>

        <template #actions>
          <v-btn v-if="activeColumn === 'PENDING'" size="small" color="primary" variant="flat" class="font-weight-medium"
            :loading="busyId === ticket.id" @click="advance(ticket, 'PREPARING')">
            Start Preparing
          </v-btn>
          <v-btn v-if="activeColumn === 'PREPARING'" size="small" color="success" variant="flat" class="font-weight-medium"
            :loading="busyId === ticket.id" @click="advance(ticket, 'READY')">
            Mark Ready
          </v-btn>
          <v-btn v-if="activeColumn === 'READY'" size="small" variant="tonal" class="font-weight-medium"
            :loading="busyId === ticket.id" @click="advance(ticket, 'COMPLETED')">
            Handed Off
          </v-btn>
        </template>
      </MobileOrderCard>
    </div>
  </div>
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
const activeColumn = ref('PENDING')

const columns = [
  { status: 'PENDING', label: 'Incoming', color: 'warning' },
  { status: 'PREPARING', label: 'Preparing', color: 'info' },
  { status: 'READY', label: 'Ready', color: 'success' },
]

function ticketsFor(status) {
  return kitchen.tickets.filter((t) => t.status === status)
}

const cancelledTickets = computed(() => kitchen.tickets.filter((t) => t.status === 'CANCELLED' && !t.dismissedAt))

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
.mobile-status-row {
  overflow-x: auto;
  scrollbar-width: none;
}
.mobile-status-row::-webkit-scrollbar {
  display: none;
}
.item-cancelled-text {
  text-decoration: line-through;
  color: rgba(0, 0, 0, 0.4);
}
.ready-to-serve-note {
  background: #EFF6FF;
  border-radius: 8px;
  color: #1D4ED8;
}
</style>
