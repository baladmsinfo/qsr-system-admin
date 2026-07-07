import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
  }),

  getters: {
    summary: (state) => ({
      total: state.items.length,
      inStock: state.items.filter((i) => i.stockStatus === 'IN_STOCK').length,
      lowStock: state.items.filter((i) => i.stockStatus === 'LOW_STOCK').length,
      outOfStock: state.items.filter((i) => i.stockStatus === 'OUT_OF_STOCK').length,
      unlimited: state.items.filter((i) => i.stockStatus === 'UNLIMITED').length,
    }),
  },

  actions: {
    async fetchStock(branchId) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      this.loading = true
      try {
        const res = await $axios.get(`${config.public.API_ENDPOINT}/api/inventory`, {
          headers: { Authorization: `Bearer ${auth.token}` },
          params: { branchId },
        })
        if (res.data.statusCode === '00') this.items = res.data.data || []
      } catch (err) {
        console.error('Fetch inventory failed:', err)
        this.error = err.message
        this.items = []
      } finally {
        this.loading = false
      }
    },

    async setStock(menuItemId, branchId, quantityAvailable, reason) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.patch(
        `${config.public.API_ENDPOINT}/api/inventory/${menuItemId}`,
        { quantityAvailable, reason },
        { headers: { Authorization: `Bearer ${auth.token}` }, params: { branchId } }
      )
      if (res.data.statusCode === '00') await this.fetchStock(branchId)
      return res.data
    },

    async setTrackInventory(menuItemId, branchId, trackInventory) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.patch(
        `${config.public.API_ENDPOINT}/api/inventory/${menuItemId}/track`,
        { trackInventory },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      )
      if (res.data.statusCode === '00') await this.fetchStock(branchId)
      return res.data
    },

    async fetchHistory(menuItemId, branchId) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.get(`${config.public.API_ENDPOINT}/api/inventory/${menuItemId}/history`, {
        headers: { Authorization: `Bearer ${auth.token}` },
        params: { branchId },
      })
      return res.data.statusCode === '00' ? res.data.data : []
    },
  },
})
