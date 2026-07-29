import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

// Printer registry + printer profiles - same shape as stores/paymentGateways.js.
export const usePrinterStore = defineStore('printers', {
    state: () => ({
        printers: [],
        profiles: [],
        loading: false,
        testPrinting: false,
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

        async fetchPrinters(branchId) {
            const { $axios, base } = this._api('/api/printers')
            this.loading = true
            try {
                const res = await $axios.get(base, { headers: this._headers(), params: branchId ? { branchId } : {} })
                if (res.data.statusCode !== '00') throw new Error(res.data.message)
                this.printers = res.data.data
                return res.data.data
            } finally {
                this.loading = false
            }
        },

        async savePrinter(printer) {
            const { $axios, base } = this._api('/api/printers')
            const res = printer.id
                ? await $axios.put(`${base}/${printer.id}`, printer, { headers: this._headers() })
                : await $axios.post(base, printer, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            await this.fetchPrinters()
            return res.data.data
        },

        async removePrinter(id) {
            const { $axios, base } = this._api('/api/printers')
            const res = await $axios.delete(`${base}/${id}`, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            await this.fetchPrinters()
        },

        // Returns { mode: 'server' } once the backend has actually printed
        // (NETWORK printers), or { mode: 'client', payload } for the caller
        // to hand to a client-side driver (drivers/index.js) - see
        // routes/printers.js's /:id/test-print for the server side of this.
        async testPrint(id) {
            const { $axios, base } = this._api('/api/printers')
            this.testPrinting = true
            try {
                const res = await $axios.post(`${base}/${id}/test-print`, {}, { headers: this._headers() })
                if (res.data.statusCode !== '00') throw new Error(res.data.message)
                return res.data.data?.payload ? { mode: 'client', payload: res.data.data.payload } : { mode: 'server' }
            } finally {
                this.testPrinting = false
            }
        },

        async fetchProfiles() {
            const { $axios, base } = this._api('/api/printer-profiles')
            const res = await $axios.get(base, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            this.profiles = res.data.data
            return res.data.data
        },

        async saveProfile(profile) {
            const { $axios, base } = this._api('/api/printer-profiles')
            const res = profile.id
                ? await $axios.put(`${base}/${profile.id}`, profile, { headers: this._headers() })
                : await $axios.post(base, profile, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            await this.fetchProfiles()
            return res.data.data
        },

        async removeProfile(id) {
            const { $axios, base } = this._api('/api/printer-profiles')
            const res = await $axios.delete(`${base}/${id}`, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            await this.fetchProfiles()
        },

        // Main print entry point - resolves to either { mode: 'queued' }
        // (NETWORK, backend already handled it) or { mode: 'client', format,
        // payload } for a client-side driver to actually print.
        async requestPrint({ printerId, receiptTemplateId, orderId, format, templateType }) {
            const { $axios, base } = this._api('/api/print')
            const res = await $axios.post(base, { printerId, receiptTemplateId, orderId, format, templateType }, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            return res.data.data
        },
    },
})
