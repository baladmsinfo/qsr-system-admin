import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useStorefrontContentStore = defineStore('storefrontContent', {
    state: () => ({
        content: null,
        loading: false,
        saving: false,
        error: null,
    }),

    actions: {
        /** 📌 Fetch this company's storefront CMS content (null if never saved) */
        async fetchContent() {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            this.loading = true
            this.error = null

            try {
                const res = await $axios.get(
                    `${config.public.API_ENDPOINT}/api/company/profile/storefront-content`,
                    { headers: { Authorization: `Bearer ${auth.token}` } }
                )

                if (res.data.statusCode === '00') {
                    this.content = res.data.data
                } else {
                    throw new Error(res.data.message || 'Failed to fetch storefront content')
                }
            } catch (err) {
                console.error('❌ Failed to fetch storefront content:', err)
                this.error = err.message
            } finally {
                this.loading = false
            }
        },

        /** 📌 Save (create or update) storefront CMS content */
        async saveContent(payload) {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            this.saving = true
            this.error = null

            try {
                const res = await $axios.put(
                    `${config.public.API_ENDPOINT}/api/company/profile/storefront-content`,
                    payload,
                    { headers: { Authorization: `Bearer ${auth.token}` } }
                )

                if (res.data.statusCode !== '00') {
                    throw new Error(res.data.message || 'Failed to save storefront content')
                }

                this.content = res.data.data
                return res.data
            } catch (err) {
                console.error('❌ Failed to save storefront content:', err)
                this.error = err.message
                throw err
            } finally {
                this.saving = false
            }
        },

        /** 📌 Upload a single image (hero image), reusing the generic upload endpoint */
        async uploadImage(formData) {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            const res = await $axios.post(`${config.public.API_ENDPOINT}/api/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${auth.token}`,
                },
            })

            if (res.data.statusCode === '00') {
                return res.data
            }
            throw new Error(res.data.message || 'Upload failed')
        },
    },
})
