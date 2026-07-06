import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orders: [],
    total: 0,
    totalAmount: 0,
    page: 1,
    take: 20,
    selectedOrder: null,
    loading: false,
    error: null,
  }),

  getters: {
    hasMore: (state) => state.orders.length < state.total,
  },

  actions: {
    // options.append: true loads the next page and appends to the existing
    // list (the Live Orders "View More" pagination); false/omitted (the
    // default, used by every existing caller) replaces the list from page 1,
    // exactly as before.
    async fetchOrders(branchId, filters = {}, options = {}) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const page = options.append ? this.page + 1 : 1
      const take = filters.take || this.take

      this.loading = true
      try {
        const res = await $axios.get(`${config.public.API_ENDPOINT}/api/orders`, {
          headers: { Authorization: `Bearer ${auth.token}` },
          params: { branchId, page, take, ...filters },
        })
        if (res.data.statusCode === '00') {
          const newOrders = res.data.data || []
          this.orders = options.append ? [...this.orders, ...newOrders] : newOrders
          this.total = res.data.meta?.total || 0
          this.totalAmount = res.data.meta?.totalAmount || 0
          this.page = res.data.meta?.page || page
          this.take = take
        }
      } catch (err) {
        console.error('Fetch orders failed:', err)
        this.error = err.message
        if (!options.append) this.orders = []
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
