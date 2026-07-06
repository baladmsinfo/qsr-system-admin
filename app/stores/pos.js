import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const usePOSStore = defineStore('pos', {
  state: () => ({
    pendingBills: [],
    currentBill: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchPendingBills(branchId) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      this.loading = true
      try {
        const res = await $axios.get(`${config.public.API_ENDPOINT}/api/pos/bills/pending`, {
          headers: { Authorization: `Bearer ${auth.token}` },
          params: { branchId },
        })
        if (res.data.statusCode === '00') this.pendingBills = res.data.data || []
      } catch (err) {
        console.error('Fetch pending bills failed:', err)
        this.error = err.message
        this.pendingBills = []
      } finally {
        this.loading = false
      }
    },

    async fetchBill(orderId) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.get(`${config.public.API_ENDPOINT}/api/pos/bill/${orderId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      if (res.data.statusCode === '00') this.currentBill = res.data.data
      return res.data
    },

    async payOrder(orderId, payload) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      this.loading = true
      try {
        const res = await $axios.post(`${config.public.API_ENDPOINT}/api/pos/orders/${orderId}/pay`, payload, {
          headers: { Authorization: `Bearer ${auth.token}` },
        })
        this.pendingBills = this.pendingBills.filter((o) => o.id !== orderId)
        this.currentBill = null
        return res.data
      } finally {
        this.loading = false
      }
    },

    async createPrepayment(orderId, payload) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.post(`${config.public.API_ENDPOINT}/api/pos/orders/${orderId}/prepay`, payload, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      return res.data
    },

    async refundOrder(orderId, payload) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.post(`${config.public.API_ENDPOINT}/api/pos/orders/${orderId}/refund`, payload, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      return res.data
    },
  },
})
