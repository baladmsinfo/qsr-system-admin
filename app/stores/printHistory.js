import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const usePrintHistoryStore = defineStore('printHistory', {
    state: () => ({
        history: [],
        loading: false,
    }),

    actions: {
        _headers() {
            const auth = useAuthStore()
            return { Authorization: `Bearer ${auth.token}` }
        },

        _api(path) {
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()
            return { $axios, base: `${config.public.API_ENDPOINT}${path}` }
        },

        async fetchHistory({ printerId, status, limit } = {}) {
            const { $axios, base } = this._api('/api/print-history')
            this.loading = true
            try {
                const res = await $axios.get(base, { headers: this._headers(), params: { printerId, status, limit } })
                if (res.data.statusCode !== '00') throw new Error(res.data.message)
                this.history = res.data.data
                return res.data.data
            } finally {
                this.loading = false
            }
        },

        // Called after a CLIENT-driven print (USB/Bluetooth/WebUSB/
        // WebSerial/System) actually runs locally - the backend has no other
        // way to learn whether that print succeeded, since it never touched
        // the printer itself. See drivers/index.js.
        async reportResult({ printerId, receiptTemplateId, orderId, format, status, errorMessage }) {
            const { $axios, base } = this._api('/api/print-history')
            const res = await $axios.post(base, { printerId, receiptTemplateId, orderId, format, status, errorMessage }, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            return res.data.data
        },
    },
})
