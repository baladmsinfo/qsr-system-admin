<template>
  <v-dialog :model-value="Boolean(prompt)" max-width="440" @update:model-value="(v) => !v && store.clearLimitPrompt()">
    <div v-if="prompt" class="app-card pa-6 text-center">
      <div class="limit-icon d-flex align-center justify-center mx-auto mb-4">
        <v-icon size="30" color="white">mdi-lock-outline</v-icon>
      </div>
      <h3 class="text-h6 font-weight-bold mb-2">{{ title }}</h3>
      <p class="text-body-2 text-medium-emphasis mb-5">{{ message }}</p>
      <v-btn v-if="isOwner" color="primary" block size="large" class="mb-2" @click="goToPlans">
        {{ prompt.mode === 'PAID' ? 'Upgrade plan' : 'View plans' }}
      </v-btn>
      <v-btn block variant="text" @click="store.clearLimitPrompt()">{{ isOwner ? 'Not now' : 'OK' }}</v-btn>
    </div>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscriptionStore } from '@/stores/subscription'
import { useAuthStore } from '@/stores/auth'

const store = useSubscriptionStore()
const auth = useAuthStore()
const router = useRouter()

const prompt = computed(() => store.limitPrompt)
const isOwner = computed(() => auth.role === 'SUPERADMIN')

const title = computed(() => {
  const label = prompt.value?.label
  return label ? `You've reached your ${label} limit` : 'Plan limit reached'
})

const message = computed(() => {
  const p = prompt.value
  if (!p) return ''
  const usage = p.limit !== undefined && p.limit !== null ? ` (${p.used ?? p.limit} of ${p.limit} used)` : ''
  const base = p.message || (p.mode === 'PAID'
    ? `Your ${p.plan || 'current'} plan doesn't allow more ${p.label || 'of these'}${usage}.`
    : `The free trial doesn't allow more ${p.label || 'of these'}${usage}.`)
  return isOwner.value ? base : `${base} Ask your business owner to upgrade the subscription.`
})

function goToPlans() {
  store.clearLimitPrompt()
  router.push('/admin/subscription/subscription')
}
</script>

<style scoped>
.limit-icon {
  width: 60px;
  height: 60px;
  border-radius: 18px;
  background: #7C3AED;
}
</style>
