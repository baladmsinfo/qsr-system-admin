import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    categories: [],
    items: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchCategories() {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      this.loading = true
      try {
        const res = await $axios.get(`${config.public.API_ENDPOINT}/api/menu-categories`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        })
        if (res.data.statusCode === '00') this.categories = res.data.data || []
      } catch (err) {
        console.error('Fetch menu categories failed:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async createCategory(payload) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.post(`${config.public.API_ENDPOINT}/api/menu-categories`, payload, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      await this.fetchCategories()
      return res.data
    },

    async updateCategory(id, payload) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.put(`${config.public.API_ENDPOINT}/api/menu-categories/${id}`, payload, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      await this.fetchCategories()
      return res.data
    },

    async deleteCategory(id) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.delete(`${config.public.API_ENDPOINT}/api/menu-categories/${id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      await this.fetchCategories()
      return res.data
    },

    async createSubCategory(categoryId, payload) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.post(
        `${config.public.API_ENDPOINT}/api/menu-categories/${categoryId}/sub-categories`,
        payload,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      )
      await this.fetchCategories()
      return res.data
    },

    async deleteSubCategory(id) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.delete(`${config.public.API_ENDPOINT}/api/menu-categories/sub-categories/${id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      await this.fetchCategories()
      return res.data
    },

    async fetchItems(branchId, filters = {}) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      this.loading = true
      try {
        const res = await $axios.get(`${config.public.API_ENDPOINT}/api/menu-items`, {
          headers: { Authorization: `Bearer ${auth.token}` },
          params: { branchId, ...filters },
        })
        if (res.data.statusCode === '00') this.items = res.data.data || []
        else this.error = res.data.message
      } catch (err) {
        console.error('Fetch menu items failed:', err)
        this.error = err.message
        this.items = []
      } finally {
        this.loading = false
      }
    },

    async createItem(payload) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.post(`${config.public.API_ENDPOINT}/api/menu-items`, payload, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      return res.data
    },

    async updateItem(id, payload) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.put(`${config.public.API_ENDPOINT}/api/menu-items/${id}`, payload, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      return res.data
    },

    async updateAvailability(id, availability) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.patch(
        `${config.public.API_ENDPOINT}/api/menu-items/${id}/availability`,
        { availability },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      )

      const updated = this.items.find((i) => i.id === id)
      if (updated) updated.availability = availability

      return res.data
    },

    async updatePrice(id, price) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.patch(
        `${config.public.API_ENDPOINT}/api/menu-items/${id}/price`,
        { price },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      )

      const updated = this.items.find((i) => i.id === id)
      if (updated) updated.price = price

      return res.data
    },

    async deleteItem(id) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.delete(`${config.public.API_ENDPOINT}/api/menu-items/${id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      this.items = this.items.filter((i) => i.id !== id)
      return res.data
    },

    async uploadImage(formData) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()

      const res = await $axios.post(`${config.public.API_ENDPOINT}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${auth.token}` },
      })
      return res.data
    },
  },
})
