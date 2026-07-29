import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useNavigationStore = defineStore('navigation', {
    state: () => ({
        navigation: null,
        loading: false,
        saving: false,
        error: null,
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

        async fetchNavigation() {
            const { $axios, base } = this._api()
            this.loading = true
            try {
                const res = await $axios.get(`${base}/navigation`, { headers: this._headers() })
                if (res.data.statusCode !== '00') throw new Error(res.data.message)
                this.navigation = res.data.data
                return res.data.data
            } finally {
                this.loading = false
            }
        },

        async saveNavigation(payload) {
            const { $axios, base } = this._api()
            this.saving = true
            try {
                const res = await $axios.put(`${base}/navigation`, payload, { headers: this._headers() })
                if (res.data.statusCode !== '00') throw new Error(res.data.message)
                this.navigation = res.data.data
                return res.data.data
            } finally {
                this.saving = false
            }
        },
    },
})
