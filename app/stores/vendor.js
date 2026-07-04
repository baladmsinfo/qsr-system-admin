import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useVendorStore = defineStore('vendor', {
  state: () => ({
    vendors: [],
    total: 0,
    page: 1,
    take: 5,
    loading: false,
    error: null,
    selectedVendor: null,
    purchases: [],
    purchaseLoading: false,
  }),

  actions: {
    async fetchVendors(page = this.page, take = this.take) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      this.loading = true
      this.error = null

      try {
        const res = await $axios.get(
          `${config.public.API_ENDPOINT}/api/vendor/vendors`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
            params: { page, limit: take },
          }
        )

        if (res.data.statusCode === '00') {
          this.vendors = res.data.data
          this.total = res.data.meta.total
          this.page = page
          this.take = take
        } else {
          throw new Error(res.data.error || 'Failed to fetch vendors')
        }
      } catch (err) {
        console.error('❌ Failed to fetch vendors:', err)
        this.error = err.message
        this.vendors = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    async createVendor(payload) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      this.loading = true
      this.error = null

      try {
        const res = await $axios.post(`${config.public.API_ENDPOINT}/api/vendor/vendors`, payload, {
          headers: { Authorization: `Bearer ${auth.token}` },
        })
        await this.fetchVendors(this.page, this.take)
        return res.data
      } catch (err) {
        console.error('❌ Failed to create vendor:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async fetchVendorById(id) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      this.loading = true
      this.error = null

      try {
        const res = await $axios.get(
          `${config.public.API_ENDPOINT}/api/vendor/vendors/${id}`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        )

        if (res.data.statusCode === "00") {
          this.selectedVendor = res.data.data
        } else {
          throw new Error(res.data.error || 'Failed to fetch vendor')
        }
      } catch (err) {
        console.error('❌ Failed to fetch vendor by ID:', err)
        this.error = err.message
        return null
      } finally {
        this.loading = false
      }
    },

    async fetchVendorPurchases(vendorId, params = {}) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      this.purchaseLoading = true

      try {
        const res = await $axios.get(
          `${config.public.API_ENDPOINT}/api/vendor/vendors/${vendorId}/purchases`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
            params,
          }
        )

        if (res.data.statusCode === '00') {
          this.purchases = res.data.data
        }
      } catch (err) {
        console.error('❌ Failed to fetch vendor purchases:', err)
        this.purchases = []
      } finally {
        this.purchaseLoading = false
      }
    },

    async updateVendor(id, payload) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      this.loading = true
      this.error = null

      try {
        const res = await $axios.put(`${config.public.API_ENDPOINT}/api/vendor/vendors/${id}`, payload, {
          headers: { Authorization: `Bearer ${auth.token}` },
        })
        await this.fetchVendors(this.page, this.take)
        return res.data
      } catch (err) {
        console.error('❌ Failed to update vendor:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async deleteVendor(id) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      this.loading = true
      this.error = null

      try {
        const res = await $axios.delete(`${config.public.API_ENDPOINT}/api/vendor/vendors/${id}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        })
        this.vendors = this.vendors.filter(v => v.id !== id)
        this.total -= 1
        return res.data
      } catch (err) {
        console.error('❌ Failed to delete vendor:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
  },
})