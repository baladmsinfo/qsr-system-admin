'use strict'
import { defineStore } from 'pinia'
import { useRuntimeConfig, useNuxtApp } from '#app'
import { useAuthStore } from '@/stores/auth'

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    plans: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchPlans() {
      this.loading = true
      this.error = null

      try {
        const auth = useAuthStore()
        const { $axios } = useNuxtApp()
        const config = useRuntimeConfig()

        const res = await $axios.get(
          `${config.public.API_ENDPOINT}/subscriptions/plans`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        )
        console.log(res.data.plans);
        
        this.plans = res.data.plans || []
        return this.plans
      } catch (err) {
        console.error('Failed to fetch subscription plans:', err)
        this.error = err
      } finally {
        this.loading = false
      }
    },
  },
})
