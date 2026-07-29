import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useReceiptTemplateStore = defineStore('receiptTemplates', {
    state: () => ({
        templates: [],
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

        async fetchTemplates(type) {
            const { $axios, base } = this._api('/api/receipt-templates')
            this.loading = true
            try {
                const res = await $axios.get(base, { headers: this._headers(), params: type ? { type } : {} })
                if (res.data.statusCode !== '00') throw new Error(res.data.message)
                this.templates = res.data.data
                return res.data.data
            } finally {
                this.loading = false
            }
        },

        async fetchTemplate(id) {
            const { $axios, base } = this._api('/api/receipt-templates')
            const res = await $axios.get(`${base}/${id}`, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            return res.data.data
        },

        async saveTemplate(template) {
            const { $axios, base } = this._api('/api/receipt-templates')
            const res = template.id
                ? await $axios.put(`${base}/${template.id}`, template, { headers: this._headers() })
                : await $axios.post(base, template, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            await this.fetchTemplates()
            return res.data.data
        },

        async removeTemplate(id) {
            const { $axios, base } = this._api('/api/receipt-templates')
            const res = await $axios.delete(`${base}/${id}`, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            await this.fetchTemplates()
        },

        // Fetches the rendered preview HTML as a string (not a bare URL) -
        // this backend's global auth hook only ever reads the Authorization
        // HEADER (see server.js), never a query param, so a plain <iframe
        // src="...">/new-tab link to this endpoint would 401 before
        // rendering anything. Bind the result to <iframe :srcdoc="html">
        // instead, same as any other authenticated fetch in this app.
        async fetchPreviewHtml(id, orderId) {
            const { $axios, base } = this._api('/api/receipt-templates')
            const res = await $axios.get(`${base}/${id}/preview`, { headers: this._headers(), params: orderId ? { orderId } : {} })
            return res.data
        },

        // Same rendering pipeline as fetchPreviewHtml, but for the Designer's
        // in-progress layoutJson that hasn't been saved as a template yet.
        async fetchDraftPreviewHtml(layoutJson, orderId) {
            const { $axios, base } = this._api('/api/receipt-templates')
            const res = await $axios.post(`${base}/preview`, { layoutJson, orderId }, { headers: this._headers() })
            return res.data
        },
    },
})
