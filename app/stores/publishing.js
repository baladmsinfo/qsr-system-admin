import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const usePublishingStore = defineStore('publishing', {
    state: () => ({
        deployments: [],
        domains: [],
        latestStatus: null,
        publishing: false,
    }),

    actions: {
        _headers() {
            const auth = useAuthStore()
            return { Authorization: `Bearer ${auth.token}` }
        },

        _api() {
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()
            return { $axios, base: `${config.public.API_ENDPOINT}/api/builder` }
        },

        async publish() {
            const { $axios, base } = this._api()
            this.publishing = true
            try {
                const res = await $axios.post(`${base}/publish`, {}, { headers: this._headers() })
                if (res.data.statusCode !== '00') throw new Error(res.data.message)
                this.latestStatus = res.data.data
                return res.data.data
            } finally {
                this.publishing = false
            }
        },

        async fetchPublishStatus() {
            const { $axios, base } = this._api()
            const res = await $axios.get(`${base}/publish-status`, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            this.latestStatus = res.data.data
            return res.data.data
        },

        async fetchDeployments() {
            const { $axios, base } = this._api()
            const res = await $axios.get(`${base}/deployments`, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            this.deployments = res.data.data
            return res.data.data
        },

        async rollback(deploymentId) {
            const { $axios, base } = this._api()
            const res = await $axios.post(`${base}/deployments/${deploymentId}/rollback`, {}, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            await this.fetchDeployments()
            return res.data.data
        },

        async fetchDomains() {
            const { $axios, base } = this._api()
            const res = await $axios.get(`${base}/domains`, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            this.domains = res.data.data
            return res.data.data
        },

        async addDomain(hostname) {
            const { $axios, base } = this._api()
            const res = await $axios.post(`${base}/domains`, { hostname }, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            await this.fetchDomains()
            return res.data.data
        },

        async removeDomain(id) {
            const { $axios, base } = this._api()
            const res = await $axios.delete(`${base}/domains/${id}`, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            await this.fetchDomains()
        },

        async setPrimaryDomain(id) {
            const { $axios, base } = this._api()
            const res = await $axios.post(`${base}/domains/${id}/set-primary`, {}, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            await this.fetchDomains()
        },

        async verifyDomain(id) {
            const { $axios, base } = this._api()
            const res = await $axios.post(`${base}/domains/${id}/verify`, {}, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            await this.fetchDomains()
            return res.data.data
        },
    },
})
