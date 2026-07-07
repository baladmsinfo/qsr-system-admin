import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useKitchenStore = defineStore('kitchen', {
  state: () => ({
    tickets: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchTickets(branchId, filters = {}) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      this.loading = true
      try {
        const res = await $axios.get(`${config.public.API_ENDPOINT}/api/kitchen/tickets`, {
          headers: { Authorization: `Bearer ${auth.token}` },
          params: { branchId, ...filters },
        })
        if (res.data.statusCode === '00') this.tickets = res.data.data || []
      } catch (err) {
        console.error('Fetch kitchen tickets failed:', err)
        this.error = err.message
        this.tickets = []
      } finally {
        this.loading = false
      }
    },

    async updateTicketStatus(id, status, branchId) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.patch(
        `${config.public.API_ENDPOINT}/api/kitchen/tickets/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${auth.token}` }, params: { branchId } }
      )

      const ticket = this.tickets.find((t) => t.id === id)
      if (ticket) ticket.status = status

      return res.data
    },

    async dismissTicket(id, branchId) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.patch(
        `${config.public.API_ENDPOINT}/api/kitchen/tickets/${id}/dismiss`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` }, params: { branchId } }
      )
      if (res.data.statusCode === '00') this.tickets = this.tickets.filter((t) => t.id !== id)
      return res.data
    },

    upsertTicket(ticket) {
      const idx = this.tickets.findIndex((t) => t.id === ticket.id)
      if (idx === -1) this.tickets.unshift(ticket)
      else this.tickets[idx] = ticket
    },
  },
})
