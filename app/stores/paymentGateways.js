import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const usePaymentGatewaysStore = defineStore('paymentGateways', {
    state: () => ({
        gateways: [],
        loading: false,
    }),

    actions: {
        _headers() {
            const auth = useAuthStore()
            return { Authorization: `Bearer ${auth.token}` }
        },

        _api() {
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()
            return { $axios, base: `${config.public.API_ENDPOINT}/api/payment-gateways` }
        },

        async fetchGateways() {
            const { $axios, base } = this._api()
            this.loading = true
            try {
                const res = await $axios.get(`${base}/`, { headers: this._headers() })
                if (res.data.statusCode !== '00') throw new Error(res.data.message)
                this.gateways = res.data.data
                return res.data.data
            } finally {
                this.loading = false
            }
        },

        async saveGateway(provider, { keyId, keySecret, webhookSecret, mode }) {
            const { $axios, base } = this._api()
            const res = await $axios.put(`${base}/${provider}`, { keyId, keySecret, webhookSecret, mode }, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            await this.fetchGateways()
            return res.data.data
        },

        async activateGateway(provider) {
            const { $axios, base } = this._api()
            const res = await $axios.post(`${base}/${provider}/activate`, {}, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            await this.fetchGateways()
        },

        async removeGateway(provider) {
            const { $axios, base } = this._api()
            const res = await $axios.delete(`${base}/${provider}`, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            await this.fetchGateways()
        },
    },
})
