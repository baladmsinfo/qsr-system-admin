import { defineStore } from 'pinia'
import { useRuntimeConfig, useNuxtApp } from '#app'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    userInfo: null,
    company: null,
    branch: null,
    role: null,
    currencies: [],
  }),

  getters: {
    isSuperAdmin: (state) => state.role === 'SUPERADMIN',
    isBranchAdmin: (state) => state.role === 'BRANCHADMIN',
    canManageBranch: (state) => ['SUPERADMIN', 'BRANCHADMIN'].includes(state.role),
    canManageAccounting: (state) => ['SUPERADMIN', 'ACCOUNTANT'].includes(state.role),
  },

  actions: {
    restoreToken() {
      if (process.client) {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('userInfo')
        if (storedToken) this.token = storedToken
        if (storedUser) this.userInfo = JSON.parse(storedUser)
        this.role = this.userInfo?.role || null
      }
    },

    setToken(token) {
      this.token = token
      if (process.client) {
        console.log('Setting token:', token)
        localStorage.setItem('token', token)
        console.log('Token in storage:', localStorage.getItem('token'))
      }
    },

    setUser(user) {
      this.userInfo = user
      this.role = user.role
      this.company = user.company || null
      this.branch = user.branch || null
      if (process.client) {
        localStorage.setItem('userInfo', JSON.stringify(user))
      }
    },

    async checkTenantAvailability(tenant) {
      try {
        const { $axios } = useNuxtApp()
        const config = useRuntimeConfig()

        const res = await $axios.get(
          `${config.public.API_ENDPOINT}/api/users/check-tenant`,
          { params: { tenant } }
        )

        return res.data
      } catch (err) {
        return { available: false }
      }
    },

    async logout() {
      this.token = null
      this.userInfo = null
      this.company = null
      this.branch = null
      this.role = null
      if (process.client) {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        const { $socket } = useNuxtApp()
        $socket?.disconnect()
      }
    },

    async register(payload) {
      try {
        const { $axios } = useNuxtApp()
        const config = useRuntimeConfig()

        const response = await $axios.post(
          config.public.API_ENDPOINT + '/api/users/register',
          payload
        )

        console.log("store register", response);

        const res = response.data
        return res
      } catch (error) {
        console.error('Register failed:', error)
        return error
      }
    },

    async fetchCurrencies() {
      try {
        this.loading = true
        const { $axios } = useNuxtApp()
        const config = useRuntimeConfig()

        const response = await $axios.get(
          config.public.API_ENDPOINT + '/api/users/currencies'
        )

        const res = response.data

        if (res.statusCode === 200) {
          this.currencies = res.data   // ← store currency list
        }

        return res
      } catch (error) {
        console.error('Fetch currencies failed:', error)
        this.error = error
        return { success: false, error }
      } finally {
        this.loading = false
      }
    },

    async login(payload) {
      try {
        const { $axios } = useNuxtApp()
        const config = useRuntimeConfig()

        const response = await $axios.post(
          config.public.API_ENDPOINT + '/api/users/login',
          payload
        )

        const res = response.data
        const token = res.token
        const user = res.user

        if (!token || !user) throw new Error('Invalid login response')

        this.setToken(token)
        this.setUser(user)

        if (process.client) {
          const { $socket } = useNuxtApp()
          $socket?.disconnect()
          $socket?.connect()
        }

        return res;
      } catch (error) {
        console.error('Login failed:', error)
        return { success: false, error }
      }
    },

    async fetchMe() {
      if (!this.token) this.restoreToken()
      if (!this.token) return
      try {
        const { $axios } = useNuxtApp()
        const config = useRuntimeConfig()

        const response = await $axios.get(
          config.public.API_ENDPOINT + '/api/users/me',
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          }
        )

        const user = response.data.user || response.data
        this.setUser(user)
        this.currencies = user.company.currency

        const cookie = useCookie("code");
        cookie.value = user.company.currency.code;

        return user
      } catch (error) {
        console.error('Fetch /me failed:', error)
      }
    },
  },
})
