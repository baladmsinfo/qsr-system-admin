export const useJournalStore = defineStore('Journal', {
  state: () => ({
    journals: [],
    pagination: {
      page: 1,
      take: 10,
      total: 0,
    },
    filters: {
      startDate: null,
      endDate: null,
    },
    loading: false,
    error: null,
  }),

  actions: {
    async fetchJournals() {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const { page, take } = this.pagination
      const { startDate, endDate } = this.filters

      this.loading = true
      this.error = null

      try {
        const response = await $axios.get(
          `${config.public.API_ENDPOINT}/api/account/journals`,
          {
            params: { page, take, startDate, endDate },
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        )

        this.journals = response.data.data
        this.pagination.total = response.data.total
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      } finally {
        this.loading = false
      }
    },

    /** ✅ when user clicks next / prev */
    setPage(page) {
      this.pagination.page = page
      this.fetchJournals()
    },

    /** ✅ when user changes items per page */
    setItemsPerPage(take) {
      this.pagination.take = take
      this.pagination.page = 1 // reset page
      this.fetchJournals()
    },

    /** ✅ when filter button clicked */
    applyFilters(filters) {
      this.filters = filters
      this.pagination.page = 1
      this.fetchJournals()
    },
  },
})