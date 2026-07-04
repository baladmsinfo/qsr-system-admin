import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const usePurchaseStore = defineStore('purchases', {
  state: () => ({
    purchases: [],
    total: 0,
    page: 1,
    take: 10,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchPurchases(page = this.page, take = this.take, vendorId = null) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      this.loading = true
      try {
        const res = await $axios.get(`${config.public.API_ENDPOINT}/api/purchases`, {
          headers: { Authorization: `Bearer ${auth.token}` },
          params: { page, take, vendorId },
        })
        if (res.data.statusCode === '00') {
          this.purchases = res.data.data
          this.total = res.data.total
          this.page = page
          this.take = take
        }
      } catch (err) {
        console.error('Fetch purchases failed:', err)
        this.error = err.message
        this.purchases = []
      } finally {
        this.loading = false
      }
    },

    async createPurchase(payload) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.post(`${config.public.API_ENDPOINT}/api/purchases`, payload, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      await this.fetchPurchases(this.page, this.take)
      return res.data
    },

    async deletePurchase(id) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.delete(`${config.public.API_ENDPOINT}/api/purchases/${id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      this.purchases = this.purchases.filter((p) => p.id !== id)
      return res.data
    },
  },
})
