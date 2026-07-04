import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useCustomerStore = defineStore('customer', {
  state: () => ({
    customers: [],
    total: 0,
    page: 1,
    take: 5,
    loading: false,
    error: null,
    selectedCustomer: null,
    orders: [],
    orderLoading: false,
  }),

  actions: {
    async fetchCustomers(page = this.page, take = this.take) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      this.loading = true

      try {
        const res = await $axios.get(
          `${config.public.API_ENDPOINT}/api/customers`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
            params: { page, take },
          }
        )

        if (res.data.statusCode === "00") {
          this.customers = res.data.data
          this.total = res.data.total
          this.page = page
          this.take = take
        }
      } catch (err) {
        this.customers = []
        this.total = 0
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async createCustomer(payload) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      this.loading = true
      this.error = null

      try {
        const res = await $axios.post(`${config.public.API_ENDPOINT}/api/customers`, payload, {
          headers: { Authorization: `Bearer ${auth.token}` },
        })

        await this.fetchCustomers(this.page, this.take)
        return res.data
      } catch (err) {
        console.error('❌ Failed to create customer:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async fetchCustomerById(id) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      this.loading = true
      this.selectedCustomer = null

      try {
        const res = await $axios.get(
          `${config.public.API_ENDPOINT}/api/customers/${id}`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        )

        if (res.data.statusCode === "00") {
          this.selectedCustomer = res.data.data
        }
      } catch (err) {
        console.error("❌ Failed to fetch customer:", err)
      } finally {
        this.loading = false
      }
    },

    async fetchCustomerOrders(customerId, params = {}) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      this.orderLoading = true

      try {
        const res = await $axios.get(
          `${config.public.API_ENDPOINT}/api/customers/${customerId}/orders`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
            params,
          }
        )

        if (res.data.statusCode === '00') {
          this.orders = res.data.data
        }
      } finally {
        this.orderLoading = false
      }
    },

    async updateCustomer(id, payload) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      this.loading = true
      this.error = null

      try {
        const res = await $axios.put(`${config.public.API_ENDPOINT}/api/customers/${id}`, payload, {
          headers: { Authorization: `Bearer ${auth.token}` },
        })

        await this.fetchCustomers(this.page, this.take)
        return res.data
      } catch (err) {
        console.error('❌ Failed to update customer:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async deleteCustomer(id) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      this.loading = true
      this.error = null

      try {
        const res = await $axios.delete(`${config.public.API_ENDPOINT}/api/customers/${id}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        })

        this.customers = this.customers.filter(c => c.id !== id)
        this.total -= 1
        return res.data
      } catch (err) {
        console.error('❌ Failed to delete customer:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
  },
})