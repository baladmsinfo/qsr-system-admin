// stores/reports.js
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useReportStore = defineStore('reports', {
    state: () => ({
        trialBalance: [],
        trialBalanceSummary: null,
        ledger: [],
        loading: false,
        error: null,
    }),

    actions: {
        async fetchTrialBalance(startDate = null, endDate = null) {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            try {
                const res = await $axios.get(`${config.public.API_ENDPOINT}/api/reports/trial-balance`, {
                    headers: { Authorization: `Bearer ${auth.token}` },
                    params: { startDate, endDate },
                })

                if (res.data.statusCode === '00') {
                    this.trialBalance = res.data.data
                    this.trialBalanceSummary = res.data.summary
                } else {
                    throw new Error(res.data.message)
                }
            } catch (err) {
                console.error('Failed to fetch trial balance:', err)
                this.error = err.message
            }
        },
        async fetchProfitLoss(startDate = null, endDate = null) {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            this.loading = true
            this.error = null

            try {
                const res = await $axios.get(`${config.public.API_ENDPOINT}/api/reports/profit-loss`, {
                    headers: { Authorization: `Bearer ${auth.token}` },
                    params: { startDate, endDate },
                })

                if (res.data.statusCode === '00') {
                    return res.data.data   // return full P&L object
                } else {
                    throw new Error(res.data.message)
                }
            } catch (err) {
                console.error('Failed to fetch Profit & Loss:', err)
                this.error = err.message
                return null
            } finally {
                this.loading = false
            }
        },

        async fetchAccounts() {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            this.loading = true
            this.error = null

            try {
                const res = await $axios.get(`${config.public.API_ENDPOINT}/api/account`, {
                    headers: { Authorization: `Bearer ${auth.token}` },
                })

                console.log("accounts", res);


                if (res.data.statusCode === 200 || res.data.statusCode === '00') {
                    return res.data.data
                } else {
                    throw new Error(res.data.message)
                }
            } catch (err) {
                console.error('Failed to fetch accounts:', err)
                this.error = err.message
                return []
            } finally {
                this.loading = false
            }
        },

        async fetchTaxReport(startDate = null, endDate = null) {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            this.loading = true
            this.error = null

            try {
                const body = {
                    fromDate: startDate || "1970-01-01",
                    toDate: endDate || new Date().toISOString().slice(0, 10)
                }

                const res = await $axios.post(
                    `${config.public.API_ENDPOINT}/api/tax-rates/tax`,
                    body,
                    { headers: { Authorization: `Bearer ${auth.token}` } }
                )

                if (res.data.statusCode === "00") {
                    return res.data.data 
                } else {
                    throw new Error(res.data.message)
                }
            } catch (err) {
                console.error("Failed to fetch tax report:", err)
                this.error = err.message
                return null
            } finally {
                this.loading = false
            }
        },

        async fetchAccountsOptions() {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            this.loading = true
            this.error = null

            try {
                const res = await $axios.get(`${config.public.API_ENDPOINT}/api/account/options`, {
                    headers: { Authorization: `Bearer ${auth.token}` },
                })

                console.log("accounts options", res);


                if (res.data.statusCode === 200 || res.data.statusCode === '00') {
                    return res.data.data
                } else {
                    throw new Error(res.data.message)
                }
            } catch (err) {
                console.error('Failed to fetch accounts:', err)
                this.error = err.message
                return []
            } finally {
                this.loading = false
            }
        },

        async fetchLedger(accountId = null, startDate = null, endDate = null) {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            this.loading = true
            this.error = null

            try {
                const url = accountId
                    ? `${config.public.API_ENDPOINT}/api/reports/ledger/${accountId}`
                    : `${config.public.API_ENDPOINT}/api/reports/ledger`

                const res = await $axios.get(url, {
                    headers: { Authorization: `Bearer ${auth.token}` },
                    params: { startDate, endDate },
                })

                console.log("ledger", res);


                if (res.data.statusCode === '00') {
                    this.ledger = res.data.data
                } else {
                    throw new Error(res.data.message)
                }
            } catch (err) {
                console.error('Failed to fetch ledger:', err)
                this.error = err.message
            } finally {
                this.loading = false
            }
        }
    },
})