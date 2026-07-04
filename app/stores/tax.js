'use strict'
import { defineStore } from 'pinia'
import { useRuntimeConfig, useNuxtApp } from '#app'
import { useAuthStore } from '@/stores/auth'

export const useTaxStore = defineStore('tax', {
  state: () => ({
    taxes: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchTaxes() {
      this.loading = true
      this.error = null
      try {
        const auth = useAuthStore()
        const { $axios } = useNuxtApp()
        const config = useRuntimeConfig()

        const res = await $axios.get(`${config.public.API_ENDPOINT}/api/tax-rates`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        })

        this.taxes = res.data.data || []
        return this.taxes
      } catch (err) {
        console.error('Fetch taxes failed:', err)
        this.error = err
      } finally {
        this.loading = false
      }
    },

    async addTax(payload) {
      try {
        const auth = useAuthStore()
        const { $axios } = useNuxtApp()
        const config = useRuntimeConfig()

        const res = await $axios.post(`${config.public.API_ENDPOINT}/api/tax-rates`, payload, {
          headers: { Authorization: `Bearer ${auth.token}` },
        })

        await this.fetchTaxes()
        return res.data
      } catch (err) {
        console.error('Add tax failed:', err)
        this.error = err
      }
    },

    async updateTax(id, payload) {
      try {
        const auth = useAuthStore()
        const { $axios } = useNuxtApp()
        const config = useRuntimeConfig()

        const res = await $axios.put(`${config.public.API_ENDPOINT}/api/tax-rates/${id}`, payload, {
          headers: { Authorization: `Bearer ${auth.token}` },
        })

        await this.fetchTaxes()
        return res.data
      } catch (err) {
        console.error('Update tax failed:', err)
        this.error = err
      }
    },

    async deleteTax(id) {
      try {
        const auth = useAuthStore()
        const { $axios } = useNuxtApp()
        const config = useRuntimeConfig()

        const res = await $axios.delete(`${config.public.API_ENDPOINT}/api/tax-rates/${id}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        })

        this.taxes = this.taxes.filter((t) => t.id !== id)
        return res.data
      } catch (err) {
        console.error('Delete tax failed:', err)
        this.error = err
      }
    },
  },
})