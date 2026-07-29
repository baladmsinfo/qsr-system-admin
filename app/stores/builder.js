import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useBuilderStore = defineStore('builder', {
    state: () => ({
        website: null,
        pages: [],
        currentPage: null,
        versions: [],
        templates: [],
        assets: [],
        globalComponents: [],
        themes: [],
        // Live preview data for dynamic-mode blocks (MenuShowcase/OpeningHours/
        // BranchLocator) - fetched from the SAME public routes the live site
        // uses, so canvas preview matches what actually gets published.
        liveData: { menuCategories: [], branches: [] },
        loading: false,
        saving: false,
        dirty: false,
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

        async fetchWebsite() {
            const { $axios, base } = this._api()
            this.loading = true
            try {
                const res = await $axios.get(`${base}/website`, { headers: this._headers() })
                if (res.data.statusCode !== '00') throw new Error(res.data.message)
                this.website = res.data.data
                this.pages = res.data.data.pages || []
            } catch (err) {
                this.error = err.message
                throw err
            } finally {
                this.loading = false
            }
        },

        async updateWebsite(payload) {
            const { $axios, base } = this._api()
            const res = await $axios.patch(`${base}/website`, payload, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            this.website = { ...this.website, ...res.data.data }
            return res.data.data
        },

        async fetchPages() {
            const { $axios, base } = this._api()
            const res = await $axios.get(`${base}/pages`, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            this.pages = res.data.data
            return res.data.data
        },

        async createPage(payload) {
            const { $axios, base } = this._api()
            const res = await $axios.post(`${base}/pages`, payload, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            await this.fetchPages()
            return res.data.data
        },

        async fetchPage(id) {
            const { $axios, base } = this._api()
            this.loading = true
            try {
                const res = await $axios.get(`${base}/pages/${id}`, { headers: this._headers() })
                if (res.data.statusCode !== '00') throw new Error(res.data.message)
                this.currentPage = res.data.data
                this.dirty = false
                return res.data.data
            } finally {
                this.loading = false
            }
        },

        async savePage(id, blocks) {
            const { $axios, base } = this._api()
            this.saving = true
            try {
                const res = await $axios.put(`${base}/pages/${id}`, { blocks }, { headers: this._headers() })
                if (res.data.statusCode !== '00') throw new Error(res.data.message)
                this.currentPage = res.data.data
                this.dirty = false
                return res.data.data
            } finally {
                this.saving = false
            }
        },

        async deletePage(id) {
            const { $axios, base } = this._api()
            const res = await $axios.delete(`${base}/pages/${id}`, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            await this.fetchPages()
        },

        async updatePageMeta(id, payload) {
            const { $axios, base } = this._api()
            const res = await $axios.put(`${base}/pages/${id}`, payload, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            if (this.currentPage?.id === id) this.currentPage = res.data.data
            await this.fetchPages()
            return res.data.data
        },

        async duplicatePage(id) {
            const { $axios, base } = this._api()
            const res = await $axios.post(`${base}/pages/${id}/duplicate`, {}, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            await this.fetchPages()
            return res.data.data
        },

        async reorderPages(pageIds) {
            const { $axios, base } = this._api()
            const res = await $axios.patch(`${base}/pages/reorder`, { pageIds }, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            await this.fetchPages()
        },

        async setHomePage(id) {
            const { $axios, base } = this._api()
            const res = await $axios.post(`${base}/pages/${id}/set-home`, {}, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            await this.fetchPages()
        },

        async publishPage(id) {
            const { $axios, base } = this._api()
            const res = await $axios.post(`${base}/pages/${id}/publish`, {}, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            this.currentPage = res.data.data
            return res.data.data
        },

        async fetchVersions(pageId) {
            const { $axios, base } = this._api()
            const res = await $axios.get(`${base}/pages/${pageId}/versions`, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            this.versions = res.data.data
            return res.data.data
        },

        async restoreVersion(pageId, versionId) {
            const { $axios, base } = this._api()
            const res = await $axios.post(`${base}/pages/${pageId}/versions/${versionId}/restore`, {}, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            this.currentPage = res.data.data
            return res.data.data
        },

        async fetchTemplates() {
            const { $axios, base } = this._api()
            const res = await $axios.get(`${base}/templates`, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            this.templates = res.data.data
            return res.data.data
        },

        async applyTemplate(pageId, templateId) {
            const { $axios, base } = this._api()
            const res = await $axios.post(`${base}/pages/${pageId}/apply-template`, { templateId }, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            this.currentPage = res.data.data
            return res.data.data
        },

        async fetchAssets() {
            const { $axios, base } = this._api()
            const res = await $axios.get(`${base}/assets`, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            this.assets = res.data.data
            return res.data.data
        },

        async uploadAsset(formData) {
            const { $axios, base } = this._api()
            const res = await $axios.post(`${base}/assets`, formData, {
                headers: { ...this._headers(), 'Content-Type': 'multipart/form-data' },
            })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            await this.fetchAssets()
            return res.data.data
        },

        // Populates `liveData` for dynamic-mode blocks' canvas preview. Calls
        // the tenant's own PUBLIC menu route directly (no auth needed, same
        // route the live customer site uses) for the first branch - multi-
        // branch selection isn't built yet, so the first branch is used as a
        // reasonable default for single-location tenants (the common case).
        async fetchLiveDataPreview() {
            const branches = this.website?.company?.branches || []
            this.liveData.branches = branches
            const branchId = branches[0]?.id
            if (!branchId) return
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()
            try {
                const res = await $axios.get(`${config.public.API_ENDPOINT}/api/public/branches/${branchId}/menu`)
                this.liveData.menuCategories = res.data.data || []
            } catch (err) {
                this.liveData.menuCategories = []
            }
        },

        async fetchGlobalComponents() {
            const { $axios, base } = this._api()
            const res = await $axios.get(`${base}/global-components`, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            this.globalComponents = res.data.data
            return res.data.data
        },

        async fetchGlobalComponent(key) {
            const { $axios, base } = this._api()
            const res = await $axios.get(`${base}/global-components/${key}`, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            return res.data.data
        },

        async saveGlobalComponent(key, blockType, props) {
            const { $axios, base } = this._api()
            const res = await $axios.put(`${base}/global-components/${key}`, { blockType, props }, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            return res.data.data
        },

        async fetchThemes() {
            const { $axios, base } = this._api()
            const res = await $axios.get(`${base}/themes`, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            this.themes = res.data.data
            return res.data.data
        },

        async applyThemePreset(themeId) {
            const { $axios, base } = this._api()
            const res = await $axios.post(`${base}/website/theme/apply-preset`, { themeId }, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            this.website = { ...this.website, theme: res.data.data, themeId: res.data.data.id }
            return res.data.data
        },

        async updateTheme(payload) {
            const { $axios, base } = this._api()
            const res = await $axios.put(`${base}/website/theme`, payload, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            this.website = { ...this.website, theme: res.data.data, themeId: res.data.data.id }
            return res.data.data
        },

        async deleteAsset(id) {
            const { $axios, base } = this._api()
            const res = await $axios.delete(`${base}/assets/${id}`, { headers: this._headers() })
            if (res.data.statusCode !== '00') throw new Error(res.data.message)
            await this.fetchAssets()
        },
    },
})
