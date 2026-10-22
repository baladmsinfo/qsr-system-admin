import { defineStore } from 'pinia'

// Company subscription - every call goes to the QSR backend (/api/subscription),
// which talks to the central subscription service server-to-server. The
// frontend never sees the central API key, and never decides on its own that
// a subscription is active: `status` always comes from the backend.
export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    status: null, // { configured, mode, inGrace, subscription, pending, resources[] }
    statusLoading: false,
    statusError: null,
    plans: [],
    plansLoading: false,
    plansError: null,
    history: [],
    // Global upgrade prompt (SubscriptionLimitDialog) - set by guard() or by
    // the axios interceptor when the backend refuses with a limit error.
    limitPrompt: null, // { resource, label, limit, used, mode, plan, message }
  }),

  getters: {
    isPaid: (s) => s.status?.mode === 'PAID',
    resource: (s) => (key) => s.status?.resources?.find((r) => r.key === key) || null,
  },

  actions: {
    _api() {
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()
      return { $axios, base: `${config.public.API_ENDPOINT}/api/subscription` }
    },

    _message(err, fallback) {
      return err?.response?.data?.message || fallback
    },

    async fetchStatus() {
      const { $axios, base } = this._api()
      this.statusLoading = true
      this.statusError = null
      try {
        const res = await $axios.get(`${base}/status`)
        if (res.data.statusCode !== '00') throw new Error(res.data.message)
        this.status = res.data.data
        return this.status
      } catch (err) {
        // Keep the last known status rather than assuming anything - the
        // backend still enforces limits regardless of what is shown here.
        this.statusError = this._message(err, 'Could not load your subscription')
        return null
      } finally {
        this.statusLoading = false
      }
    },

    async fetchPlans() {
      const { $axios, base } = this._api()
      this.plansLoading = true
      this.plansError = null
      try {
        const res = await $axios.get(`${base}/plans`)
        if (res.data.statusCode !== '00') throw new Error(res.data.message)
        this.plans = res.data.data || []
        return this.plans
      } catch (err) {
        this.plansError = this._message(err, 'Unable to load subscription plans')
        return []
      } finally {
        this.plansLoading = false
      }
    },

    async fetchHistory() {
      const { $axios, base } = this._api()
      try {
        const res = await $axios.get(`${base}/history`)
        if (res.data.statusCode === '00') this.history = res.data.data || []
      } catch {
        // History is informational only.
      }
      return this.history
    },

    /** Starts checkout - returns { subscription, checkout } or throws a readable Error. */
    async initiate(planId) {
      const { $axios, base } = this._api()
      try {
        const res = await $axios.post(`${base}/initiate`, { planId })
        if (res.data.statusCode !== '00') throw new Error(res.data.message)
        return res.data.data
      } catch (err) {
        throw new Error(this._message(err, err.message || 'Could not start payment'))
      }
    },

    /** Asks the backend to confirm the payment - returns { result, reason, status }. */
    async verify(subscriptionId) {
      const { $axios, base } = this._api()
      try {
        const res = await $axios.post(`${base}/verify`, { subscriptionId })
        if (res.data.statusCode !== '00') throw new Error(res.data.message)
        this.status = res.data.data.status
        return res.data.data
      } catch (err) {
        throw new Error(this._message(err, 'Could not confirm the payment'))
      }
    },

    showLimitPrompt(details) {
      this.limitPrompt = details
    },

    clearLimitPrompt() {
      this.limitPrompt = null
    },
  },
})
