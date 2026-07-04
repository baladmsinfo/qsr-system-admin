import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    cashflow: { timeline: { labels: [], inflow: [], outflow: [] } },
    sales: { paid: 0, unpaid: 0 },
    purchases: { total: 0 },
    loading: false,
    error: null,
    profitloss: {
      labels: [],
      values: [],
    },
  }),

  actions: {
    async fetchProfitLoss(period = 'thisYear') {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      this.loading = true
      try {
        if (!auth.userInfo && !auth.token) {
          await auth.fetchMe();
          await auth.restoreToken();

          console.log("User role if", auth.role);
        }

        const isAdmin = computed(() => auth.userInfo?.role === "SUPERADMIN");

        const res = await $axios.get(
          `${config.public.API_ENDPOINT}/reports/dashboard/profit-loss`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
            params: { period , branchId: isAdmin.value ? null : auth.userInfo?.branchId },
          }
        )

        if (res.data.statusCode === '00') {
          const rows = res.data.data || []

          // Format for chart
          this.profitloss = {
            labels: rows.map(r =>
              new Date(r.date).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
              })
            ),
            values: rows.map(r => r.profitLoss),
          }
        }
      } catch (err) {
        console.error('❌ ProfitLoss fetch error:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async fetchCashflow(period = 'thisMonth') {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      this.loading = true
      try {

        if (!auth.userInfo && !auth.token) {
          await auth.fetchMe();
          await auth.restoreToken();

          console.log("User role if", auth.role);
        }

        const isAdmin = computed(() => auth.userInfo?.role === "SUPERADMIN");

        const res = await $axios.get(
          `${config.public.API_ENDPOINT}/reports/dashboard/cashflow`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
            params: { period , branchId: isAdmin.value ? null : auth.userInfo?.branchId },
          }
        )

        if (res.data.statusCode === '00') {
          const rows = res.data.data || []

          // ✅ Format the timeline data for chart
          this.cashflow.timeline = {
            labels: rows.map(r =>
              new Date(r.date).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
              })
            ),
            inflow: rows.map(r => r.inflow),
            outflow: rows.map(r => r.outflow),
          }
        } else {
          this.error = 'Failed to load cashflow data'
        }
      } catch (err) {
        console.error('❌ Cashflow fetch error:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async fetchSales(period = 'thisYear') {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()
      this.loading = true
      try {

        if (!auth.userInfo && !auth.token) {
          await auth.fetchMe();
          await auth.restoreToken();

          console.log("User role if", auth.role);
        }

        const isAdmin = computed(() => auth.userInfo?.role === "SUPERADMIN");

        const res = await $axios.get(
          `${config.public.API_ENDPOINT}/reports/dashboard/sales`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
            params: { period, branchId: isAdmin.value ? null : auth.userInfo?.branchId },
          }
        )
        if (res.data.statusCode === '00') this.sales = res.data.data
      } catch (err) {
        console.error('❌ Sales fetch error:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async fetchPurchases(period = 'thisYear') {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()
      this.loading = true
      try {

        if (!auth.userInfo && !auth.token) {
          await auth.fetchMe();
          await auth.restoreToken();

          console.log("User role if", auth.role);
        }

        const isAdmin = computed(() => auth.userInfo?.role === "SUPERADMIN");

        const res = await $axios.get(
          `${config.public.API_ENDPOINT}/reports/dashboard/purchases`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
            params: { period,  branchId: isAdmin.value ? null : auth.userInfo?.branchId },
          }
        )
        if (res.data.statusCode === '00') this.purchases = res.data.data
      } catch (err) {
        console.error('❌ Purchases fetch error:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
  },
})
