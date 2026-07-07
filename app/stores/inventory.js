import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
  }),

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

    async setStock(menuItemId, branchId, quantityAvailable) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.patch(
        `${config.public.API_ENDPOINT}/api/inventory/${menuItemId}`,
        { quantityAvailable },
        { headers: { Authorization: `Bearer ${auth.token}` }, params: { branchId } }
      )
      if (res.data.statusCode === '00') {
        const item = this.items.find((i) => i.id === menuItemId)
        if (item) item.quantityAvailable = quantityAvailable
      }
      return res.data
    },
  },
})
