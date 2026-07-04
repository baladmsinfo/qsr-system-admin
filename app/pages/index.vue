<template>
  <v-container fluid class="d-flex align-center bg-background justify-center">
    <v-row class="w-100" align="center" justify="center">
      <v-col cols="12" md="6" class="d-flex flex-column bg-background align-center justify-center"
        :style="{ color: 'white', minHeight: '100vh' }">
        <v-img src="../assets/banner.png" alt="Billing Illustration" width="100%" height="100vh" cover
          class="d-flex align-center justify-center">
          <div class="d-flex flex-column align-center justify-center text-center ma-4 px-6"
            style="background-color: rgba(0, 0, 0, 0.4); border-radius: 16px; padding: 24px;">
            <h2 class="font-weight-bold text-h5 mb-2">Welcome Back</h2>
            <p class="text-body-2">
              Log in to manage your menu, orders, kitchen and billing.
            </p>
          </div>
        </v-img>
      </v-col>

      <!-- Right Section -->
      <v-col cols="12" md="6" class="d-flex flex-column justify-center pa-10">
        <div class="pa-10 ma-10">
          <h2 class="font-weight-bold mb-4 text-primary">Login</h2>

          <v-form @submit.prevent="handleLogin">
            <v-text-field v-model="email" label="Email" prepend-inner-icon="mdi-account" variant="outlined"
              density="comfortable" color="primary" class="mb-3" />
            <v-text-field v-model="password" label="Password" prepend-inner-icon="mdi-lock"
              :type="showPassword ? 'text' : 'password'" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword" variant="outlined" density="comfortable"
              color="primary" class="mb-2" />

            <!-- <div class="d-flex justify-end mb-4">
              <a href="#" class="text-caption text-primary">Forgot Password?</a>
            </div> -->

            <v-btn block color="primary" type="submit" :loading="loading" class="text-uppercase mb-2 font-weight-bold">
              Login
            </v-btn>

            <v-btn block variant="outlined" color="primary" class="text-uppercase font-weight-bold"
              @click="goToRegister">
              Sign Up
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

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const router = useRouter()
const auth = useAuthStore()

async function handleLogin() {
  loading.value = true
  const res = await auth.login({ email: email.value, password: password.value })
  loading.value = false

  console.log("Login Response:", res);

  if (res.token) {
    router.push('/admin/dashboard')
  } else {
    alert('Login failed! Check your credentials.')
  }
}

function goToRegister() {
  router.push('/register')
}
</script>