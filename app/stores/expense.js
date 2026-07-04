import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useExpenseStore = defineStore('expense', {
    state: () => ({
        expenses: [],

        pagination: {
            page: 1,
            take: 10,
            total: 0,
        },

        filters: {
            category: null,
            fromDate: null,
            toDate: null,
        },

        loading: false,
        error: null,
        expenseOptions: [],
    }),

    actions: {
        // 🔹 FETCH EXPENSE CATEGORY OPTIONS
        async fetchExpenseOptions() {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            try {
                const res = await $axios.get(
                    `${config.public.API_ENDPOINT}/api/expenses/options`,
                    {
                        headers: { Authorization: `Bearer ${auth.token}` },
                    }
                )

                if (res.data.statusCode === '00') {
                    this.expenseOptions = res.data.data || []
                } else {
                    throw new Error(res.data.message || "Failed to fetch expense options")
                }
            } catch (err) {
                console.error("❌ Failed to fetch expense options:", err)
                this.expenseOptions = []
            }
        },

        async fetchExpenseChart(period = "thisYear") {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            try {
                if (!auth.userInfo && !auth.token) {
                    await auth.fetchMe();
                    await auth.restoreToken();

                    console.log("User role if", auth.role);
                }

                const isAdmin = computed(() => auth.userInfo?.role === "SUPERADMIN");

                const res = await $axios.get(
                    `${config.public.API_ENDPOINT}/api/expenses/chart`,
                    {
                        params: { period, branchId: isAdmin.value ? null : auth.userInfo?.branchId },   // ← SEND PERIOD HERE
                        headers: { Authorization: `Bearer ${auth.token}` }
                    }
                )

                if (res.data.statusCode === "00") {
                    this.chartData = res.data.data.items
                    this.chartTotal = res.data.data.total
                }
            } catch (err) {
                console.error("❌ Failed to fetch chart:", err)
            }
        },

        async fetchExpenses() {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            const { page, take } = this.pagination
            const { category, fromDate, toDate } = this.filters

            this.loading = true

            try {
                if (!auth.userInfo && !auth.token) {
                    await auth.fetchMe();
                    await auth.restoreToken();

                    console.log("User role if", auth.role);
                }

                const isAdmin = computed(() => auth.userInfo?.role === "SUPERADMIN");

                const res = await $axios.get(
                    `${config.public.API_ENDPOINT}/api/expenses`,
                    {
                        headers: { Authorization: `Bearer ${auth.token}` },
                        params: {
                            page,
                            take,
                            branchId: isAdmin.value ? null : auth.userInfo?.branchId,
                            category: category || undefined,
                            fromDate: fromDate || undefined,
                            toDate: toDate || undefined,
                        },
                    }
                )

                if (res.data.statusCode === '00') {
                    this.expenses = res.data.data
                    this.pagination.total = res.data.total
                }
            } finally {
                this.loading = false
            }
        },

        setPage(page) {
            this.pagination.page = page
            this.fetchExpenses()
        },

        setItemsPerPage(take) {
            this.pagination.take = take
            this.pagination.page = 1
            this.fetchExpenses()
        },

        applyFilters(filters) {
            this.filters = filters
            this.pagination.page = 1
            this.fetchExpenses()
        },


        async uploadImage(formData) {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            try {
                const res = await $axios.post(`${config.public.API_ENDPOINT}/upload`, formData, {
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

        // 🔹 CREATE EXPENSE
        async createExpense(payload) {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            this.loading = true
            this.error = null

            try {
                const res = await $axios.post(
                    `${config.public.API_ENDPOINT}/api/expenses`,
                    payload,
                    {
                        headers: { Authorization: `Bearer ${auth.token}` },
                    }
                )

                await this.fetchExpenses(this.filters, this.page, this.take)
                return res.data
            } catch (err) {
                console.error('❌ Failed to create expense:', err)
                this.error = err.message
            } finally {
                this.loading = false
            }
        },

        // 🔹 UPDATE EXPENSE
        async updateExpense(id, payload) {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            this.loading = true
            this.error = null

            try {
                const res = await $axios.put(
                    `${config.public.API_ENDPOINT}/api/expenses/${id}`,
                    payload,
                    {
                        headers: { Authorization: `Bearer ${auth.token}` },
                    }
                )

                await this.fetchExpenses(this.filters, this.page, this.take)
                return res.data
            } catch (err) {
                console.error('❌ Failed to update expense:', err)
                this.error = err.message
            } finally {
                this.loading = false
            }
        },

        // 🔹 DELETE EXPENSE
        async deleteExpense(id) {
            const auth = useAuthStore()
            const { $axios } = useNuxtApp()
            const config = useRuntimeConfig()

            this.loading = true
            this.error = null

            try {
                const res = await $axios.delete(
                    `${config.public.API_ENDPOINT}/api/expenses/${id}`,
                    {
                        headers: { Authorization: `Bearer ${auth.token}` },
                    }
                )

                this.expenses = this.expenses.filter(e => e.id !== id)
                this.total -= 1
                return res.data
            } catch (err) {
                console.error('❌ Failed to delete expense:', err)
                this.error = err.message
            } finally {
                this.loading = false
            }
        },
    },
})