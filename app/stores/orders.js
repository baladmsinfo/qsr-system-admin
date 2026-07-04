import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orders: [],
    total: 0,
    selectedOrder: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchOrders(branchId, filters = {}) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      this.loading = true
      try {
        const res = await $axios.get(`${config.public.API_ENDPOINT}/api/orders`, {
          headers: { Authorization: `Bearer ${auth.token}` },
          params: { branchId, ...filters },
        })
        if (res.data.statusCode === '00') {
          this.orders = res.data.data || []
          this.total = res.data.meta?.total || 0
        }
      } catch (err) {
        console.error('Fetch orders failed:', err)
        this.error = err.message
        this.orders = []
      } finally {
        this.loading = false
      }
    },

    async fetchOrderById(id) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.get(`${config.public.API_ENDPOINT}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      if (res.data.statusCode === '00') this.selectedOrder = res.data.data
      return res.data
    },

    async createOrder(payload) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.post(`${config.public.API_ENDPOINT}/api/orders`, payload, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      return res.data
    },

    async updateStatus(id, status) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.patch(
        `${config.public.API_ENDPOINT}/api/orders/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      )
      if (res.data.statusCode === '00') this.upsertOrder(res.data.data)
      return res.data
    },

    async moveTable(id, tableId) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.patch(
        `${config.public.API_ENDPOINT}/api/orders/${id}/table`,
        { tableId },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      )
      if (res.data.statusCode === '00') this.upsertOrder(res.data.data)
      return res.data
    },

    upsertOrder(order) {
      const idx = this.orders.findIndex((o) => o.id === order.id)
      if (idx === -1) this.orders.unshift(order)
      else this.orders[idx] = order
      if (this.selectedOrder?.id === order.id) this.selectedOrder = order
    },
  },
})
