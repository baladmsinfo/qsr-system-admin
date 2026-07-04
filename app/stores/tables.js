import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useTableStore = defineStore('tables', {
  state: () => ({
    tables: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchTables(branchId) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      this.loading = true
      try {
        const res = await $axios.get(`${config.public.API_ENDPOINT}/api/tables`, {
          headers: { Authorization: `Bearer ${auth.token}` },
          params: { branchId },
        })
        if (res.data.statusCode === '00') this.tables = res.data.data || []
      } catch (err) {
        console.error('Fetch tables failed:', err)
        this.error = err.message
        this.tables = []
      } finally {
        this.loading = false
      }
    },

    async createTable(branchId, payload) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.post(`${config.public.API_ENDPOINT}/api/tables`, { ...payload, branchId }, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      await this.fetchTables(branchId)
      return res.data
    },

    async updateTable(id, payload) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.put(`${config.public.API_ENDPOINT}/api/tables/${id}`, payload, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      const updated = this.tables.find((t) => t.id === id)
      if (updated) Object.assign(updated, payload)
      return res.data
    },

    async regenerateQr(id, branchId) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.post(`${config.public.API_ENDPOINT}/api/tables/${id}/regenerate-qr`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      await this.fetchTables(branchId)
      return res.data
    },

    async deleteTable(id, branchId) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.delete(`${config.public.API_ENDPOINT}/api/tables/${id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      this.tables = this.tables.filter((t) => t.id !== id)
      return res.data
    },
  },
})
