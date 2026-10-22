<template>
  <div v-if="visible" class="subscription-banner d-flex flex-wrap align-center ga-3 px-4 py-3 mb-4" :class="`subscription-banner--${tone}`">
    <v-icon :color="tone === 'error' ? 'error' : 'warning'">{{ tone === 'error' ? 'mdi-lock-alert-outline' : 'mdi-timer-sand' }}</v-icon>
    <div class="flex-grow-1" style="min-width: 0">
      <div class="text-body-2 font-weight-bold">{{ headline }}</div>
      <div class="text-caption text-medium-emphasis">{{ detail }}</div>
    </div>
    <v-btn v-if="isOwner" size="small" color="primary" variant="flat" to="/admin/subscription/subscription">
      {{ status.mode === 'PAID' ? 'Manage plan' : 'Upgrade' }}
    </v-btn>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSubscriptionStore } from '@/stores/subscription'
import { useAuthStore } from '@/stores/auth'

const store = useSubscriptionStore()
const auth = useAuthStore()

const status = computed(() => store.status)
const isOwner = computed(() => auth.role === 'SUPERADMIN')
const reached = computed(() => (status.value?.resources || []).filter((r) => r.reached))

// The limited resource closest to its limit - the most useful one to show.
const tightest = computed(() =>
  (status.value?.resources || [])
    .filter((r) => r.limit !== null)
    .sort((a, b) => b.used / (b.limit || 1) - a.used / (a.limit || 1))[0] || null
)

const visible = computed(() => {
  if (!status.value) return false
  if (reached.value.length || status.value.inGrace) return true
  return status.value.mode === 'TRIAL' && isOwner.value
})

const tone = computed(() => (reached.value.length ? 'error' : 'warning'))

const headline = computed(() => {
  if (status.value?.inGrace) return 'We could not confirm your subscription renewal'
  if (reached.value.length) return `Limit reached: ${reached.value.map((r) => r.label).join(', ')}`
  return 'You are on the free trial'
})

const detail = computed(() => {
  if (status.value?.inGrace) return 'Your plan stays active for a few days while we retry.'
  const t = tightest.value
  const usage = t ? `${t.used} of ${t.limit} ${t.label} used.` : ''
  if (reached.value.length) return isOwner.value ? `${usage} Upgrade to keep adding more.` : `${usage} Ask your business owner to upgrade.`
  return `${usage} Subscribe to remove trial limits.`
})
</script>

<style scoped>
.subscription-banner {
  border-radius: 14px;
  border: 1px solid;
}
.subscription-banner--warning {
  background: #FFFBEB;
  border-color: #FDE68A;
}
.subscription-banner--error {
  background: #FEF2F2;
  border-color: #FECACA;
}
</style>
