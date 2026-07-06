<template>
  <v-container fluid class="pa-0 fill-height login-page">
    <v-row no-gutters class="fill-height">
      <!-- Brand Panel -->
      <v-col cols="12" md="5" class="d-none d-md-flex flex-column justify-space-between brand-panel pa-12">
        <div class="d-flex align-center ga-3">
          <div class="brand-mark-lg d-flex align-center justify-center">
            <v-icon color="white" size="26">mdi-silverware-fork-knife</v-icon>
          </div>
          <span class="text-h6 font-weight-bold text-white">Bucksbox</span>
        </div>

        <div>
          <h1 class="text-h3 font-weight-bold text-white mb-4" style="max-width: 480px; letter-spacing: -0.02em">
            Run your entire restaurant from one calm, organized place.
          </h1>
          <p class="text-body-1 text-white" style="opacity: 0.75; max-width: 420px">
            Menu, tables, live orders, kitchen display and billing &mdash; all in a single platform built for modern restaurants.
          </p>
        </div>

        <p class="text-caption text-white" style="opacity: 0.5">© {{ new Date().getFullYear() }} Bucksbox. All rights reserved.</p>
      </v-col>

      <!-- Login Form -->
      <v-col cols="12" md="7" class="d-flex align-center justify-center pa-6 pa-md-16">
        <div style="width: 100%; max-width: 400px">
          <h2 class="text-h4 font-weight-bold mb-2">Welcome back</h2>
          <p class="text-body-2 text-medium-emphasis mb-8">
            Log in to manage your menu, orders, kitchen and billing.
          </p>

          <v-form @submit.prevent="handleLogin">
            <v-text-field v-model="email" label="Email" prepend-inner-icon="mdi-email-outline" class="mb-2" />
            <v-text-field v-model="password" label="Password" prepend-inner-icon="mdi-lock-outline"
              :type="showPassword ? 'text' : 'password'" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword" class="mb-2" />

            <v-btn block color="primary" size="large" type="submit" :loading="loading" class="mt-4 mb-3">
              Login
            </v-btn>

            <v-btn block variant="outlined" color="primary" size="large" @click="goToRegister">
              Create a Restaurant Account
            </v-btn>
          </v-form>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

async function handleLogin() {
  loading.value = true
  const res = await auth.login({ email: email.value, password: password.value })
  loading.value = false

  if (res.token) {
    router.push('/admin/dashboard')
  } else {
    toast.error('Login failed. Please check your credentials.')
  }
}

function goToRegister() {
  router.push('/register')
}
</script>

<style scoped>
.login-page {
  background: #fff;
}
.brand-panel {
  background: linear-gradient(160deg, #6D28D9 0%, #5B21B6 100%);
}
.brand-mark-lg {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
}
</style>
