import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useMenuQrStore = defineStore('menuQr', {
  state: () => ({
    branch: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchMenuQr(branchId) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      this.loading = true
      try {
        const res = await $axios.get(`${config.public.API_ENDPOINT}/api/menu-qr`, {
          headers: { Authorization: `Bearer ${auth.token}` },
          params: { branchId },
        })
        if (res.data.statusCode === '00') this.branch = res.data.data
      } catch (err) {
        console.error('Fetch menu QR failed:', err)
        this.error = err.message
        this.branch = null
      } finally {
        this.loading = false
      }
    },

    async regenerateMenuQr(branchId) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.post(`${config.public.API_ENDPOINT}/api/menu-qr/regenerate`, { branchId }, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      await this.fetchMenuQr(branchId)
      return res.data
    },
  },
})
