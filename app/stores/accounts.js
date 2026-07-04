import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useAccountsStore = defineStore('accounts', {
  state: () => ({
    grouped: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchGroupedAccounts() {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      this.loading = true
      this.error = null

      try {
        const res = await $axios.get(`${config.public.API_ENDPOINT}/api/account`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        })

        if (res.data.statusCode === 200 || res.data.statusCode === '00') {
          this.grouped = res.data.data   // object: ASSET, LIABILITY, etc.
        } else {
          throw new Error(res.data.message)
        }
      } catch (err) {
        console.error('Failed to load accounts:', err)
        this.error = err.message
        this.grouped = null
      } finally {
        this.loading = false
      }
    },

    async addAccount(payload) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      try {
        const res = await $axios.post(
          `${config.public.API_ENDPOINT}/api/account`,
          payload,
          {
            headers: { Authorization: `Bearer ${auth.token}` }
          }
        )

        if (res.data.statusCode === 200 || res.data.statusCode === '00') {
          return true
        } else {
          console.error("Add account failed:", res.data.message)
          return false
        }
      } catch (err) {
        console.error("Add account error:", err)
        return false
      }
    },
    
    async deleteAccount(accountId) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      try {
        const res = await $axios.delete(
          `${config.public.API_ENDPOINT}/api/account/${accountId}`,
          { headers: { Authorization: `Bearer ${auth.token}` } }
        )

        return res.data
      } catch (err) {
        console.error("Failed to delete account:", err)
        throw err
      }
    }
  }
})
