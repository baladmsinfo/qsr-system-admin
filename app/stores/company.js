import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useCompanyStore = defineStore('company', {
    state: () => ({
        branches: [],
        banners: [],
        bannerLoading: false,
        meta: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 1
        },
        loading: false,
        error: null
    }),

    actions: {
        /** 📌 Fetch branches list (Paginated for table) */
        async fetchBranches(page = 1, limit = 10, search = '') {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            this.loading = true
            this.error = null

            try {
                const res = await $axios.get(`${config.public.API_ENDPOINT}/api/company/branches`, {
                    headers: { Authorization: `Bearer ${auth.token}` },
                    params: { page, limit, search }
                })

                if (res.data.statusCode === '00') {
                    this.branches = res.data.data || []
                    this.meta = res.data.meta || this.meta
                } else {
                    throw new Error(res.data.message || 'Failed to fetch branches')
                }
            } catch (err) {
                console.error('❌ Failed to fetch branches:', err)
                this.error = err.message
                this.branches = []
            } finally {
                this.loading = false
            }
        },

        /** 📌 Register branch + store admin */
        async registerBranch(payload) {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            this.loading = true
            this.error = null

            try {
                const res = await $axios.post(
                    `${config.public.API_ENDPOINT}/api/company/register/branch`,
                    payload,
                    { headers: { Authorization: `Bearer ${auth.token}` } }
                )

                if (res.data.statusCode !== '00') {
                    throw new Error(res.data.message || 'Failed to register branch')
                }

                // Refresh paginated list after success
                await this.fetchBranches(this.meta.page, this.meta.limit)

                return res.data
            } catch (err) {
                console.error('❌ Failed to register branch:', err)
                this.error = err.message
                throw err
            } finally {
                this.loading = false
            }
        },

        /** 📌 Fetch branch list for dropdown (no pagination) */
        async fetchBranchOptions() {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            try {
                const res = await $axios.get(
                    `${config.public.API_ENDPOINT}/api/company/branches/options`,
                    { headers: { Authorization: `Bearer ${auth.token}` } }
                )

                if (res.data.statusCode === '00') {
                    this.branches = res.data.data || []
                }
            } catch (err) {
                console.error('❌ Failed to fetch branch options:', err)
                this.branches = []
            }
        },

        /** 📌 Update Branch */
        async updateBranch(id, payload) {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            this.loading = true
            this.error = null

            try {
                const res = await $axios.put(
                    `${config.public.API_ENDPOINT}/api/company/branch/${id}`,
                    payload,
                    { headers: { Authorization: `Bearer ${auth.token}` } }
                )

                if (res.data.statusCode !== '00')
                    throw new Error(res.data.message || 'Failed to update branch')

                await this.fetchBranches(this.meta.page, this.meta.limit)
                return res.data

            } catch (err) {
                console.error('❌ Update branch failed:', err)
                this.error = err.message
                throw err
            } finally {
                this.loading = false
            }
        },

        /** 📌 Delete Branch */
        async deleteBranch(id) {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            this.loading = true
            this.error = null

            try {
                const res = await $axios.delete(
                    `${config.public.API_ENDPOINT}/api/company/branch/${id}`,
                    { headers: { Authorization: `Bearer ${auth.token}` } }
                )

                if (res.data.statusCode !== '00')
                    throw new Error(res.data.message || 'Failed to delete branch')

                await this.fetchBranches(this.meta.page, this.meta.limit)
                return res.data

            } catch (err) {
                console.error('❌ Delete branch failed:', err)
                this.error = err.message
                throw err
            } finally {
                this.loading = false
            }
        },

        /** 📌 Fetch branches WITH users (server pagination + search) */
        async fetchBranchesWithUsers(page = 1, limit = 10, search = "") {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            this.loading = true
            this.error = null

            try {
                const res = await $axios.get(
                    `${config.public.API_ENDPOINT}/api/company/branches-with-users`,
                    {
                        params: { page, limit, search },
                        headers: { Authorization: `Bearer ${auth.token}` }
                    }
                )

                if (res.data.statusCode === "00") {
                    this.branches = res.data.data || []
                    this.meta = res.data.meta || { total: 0 }
                } else {
                    throw new Error(res.data.message)
                }
            } catch (err) {
                console.error(err)
                this.error = err.message
                this.branches = []
            } finally {
                this.loading = false
            }
        },

        /** 📌 Create user under a branch */
        async createBranchUser(branchId, payload) {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            try {
                const res = await $axios.post(
                    `${config.public.API_ENDPOINT}/api/company/branch/${branchId}/users`,
                    payload,
                    { headers: { Authorization: `Bearer ${auth.token}` } }
                )

                if (res.data.statusCode !== "00")
                    throw new Error(res.data.message || "Failed to create user")

                // Refresh data
                await this.fetchBranchesWithUsers()

                return res.data

            } catch (err) {
                console.error("❌ Failed to create user:", err)
                throw err
            }
        },

        /** 📌 Delete user under branch */
        async deleteBranchUser(branchId, userId) {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            try {
                const res = await $axios.delete(
                    `${config.public.API_ENDPOINT}/api/company/branch/${branchId}/users/${userId}`,
                    { headers: { Authorization: `Bearer ${auth.token}` } }
                )

                if (res.data.statusCode !== "00")
                    throw new Error(res.data.message || "Failed to delete user")

                // Refresh
                await this.fetchBranchesWithUsers()

                return res.data

            } catch (err) {
                console.error("❌ Failed to delete user:", err)
                throw err
            }
        },

        /** 📌 Fetch banners list */
        async fetchBanners() {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            this.bannerLoading = true
            try {
                const res = await $axios.get(
                    `${config.public.API_ENDPOINT}/api/company/banners`,
                    { headers: { Authorization: `Bearer ${auth.token}` } }
                )

                if (res.data.statusCode === "00") {
                    this.banners = res.data.data || []
                } else {
                    this.banners = []
                    throw new Error(res.data.message)
                }
            } catch (err) {
                console.error("❌ Failed to fetch banners:", err)
                this.banners = []
            } finally {
                this.bannerLoading = false
            }
        },

        /** 📌 Create Banner */
        async addBanner(payload) {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            this.bannerLoading = true
            try {
                const res = await $axios.post(
                    `${config.public.API_ENDPOINT}/api/company/banners`,
                    payload,
                    { headers: { Authorization: `Bearer ${auth.token}` } }
                )

                if (res.data.statusCode !== "00") throw new Error(res.data.message)
                await this.fetchBanners() // refresh list

                return res.data
            } catch (err) {
                console.error("❌ Failed to add banner:", err)
                throw err
            } finally {
                this.bannerLoading = false
            }
        },

        async updateBannerManage(bannerId, manage = true) {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            this.bannerLoading = true
            this.error = null

            try {
                const res = await $axios.put(
                    `${config.public.API_ENDPOINT}/api/company/banners/${bannerId}`,
                    { manage },
                    { headers: { Authorization: `Bearer ${auth.token}` } }
                )

                if (res.data.statusCode !== "00") {
                    throw new Error(res.data.message || "Failed to update banner")
                }

                // 🔄 Refresh banners after update
                await this.fetchBanners()

                return res.data
            } catch (err) {
                console.error("❌ Failed to update banner manage:", err)
                this.error = err.message
                throw err
            } finally {
                this.bannerLoading = false
            }
        },

        async uploadImage(formData) {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            try {
                const res = await $axios.post(`${config.public.API_ENDPOINT}/api/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${auth.token}`
                    }
                })

                console.log(res);

                if (res.data.statusCode === '00') {
                    return res.data
                } else {
                    throw new Error(res.data.message || 'Upload failed')
                }
            } catch (err) {
                console.error('Store upload failed', err)
                throw err
            }
        },

        // SUPERADMIN-only: replace the brand logo shown in the FE sidebar and
        // every CUSTOMER-app page that displays this restaurant.
        async updateCompanyLogo(logoUrl) {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            const res = await $axios.patch(
                `${config.public.API_ENDPOINT}/api/company/profile/logo`,
                { logoUrl },
                { headers: { Authorization: `Bearer ${auth.token}` } }
            )
            return res.data
        },
    }
})