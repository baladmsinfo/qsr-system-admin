<template>
  <div class="app-card pa-5 d-flex flex-column h-100 plan-card"
    :class="{ 'plan-card--popular': plan.isPopular, 'plan-card--current': current }">
    <div class="d-flex align-start justify-space-between mb-2 ga-2">
      <span class="text-subtitle-1 font-weight-bold">{{ plan.name }}</span>
      <v-chip v-if="current" size="small" color="success" variant="flat" class="font-weight-bold">Current plan</v-chip>
      <v-chip v-else-if="plan.isPopular" size="small" color="primary" variant="flat" class="font-weight-bold">Most popular</v-chip>
    </div>

    <div v-if="plan.isCustom" class="text-h5 font-weight-bold text-primary mb-3">Let's talk</div>
    <div v-else class="d-flex align-baseline ga-1 mb-3">
      <span class="text-h4 font-weight-bold mono-data">{{ formattedPrice }}</span>
      <span class="text-body-2 text-medium-emphasis">{{ intervalLabel }}</span>
    </div>

    <p v-if="plan.description" class="text-body-2 text-medium-emphasis mb-4">{{ plan.description }}</p>

    <div class="flex-grow-1 mb-5">
      <div v-for="(feature, i) in enabledFeatures" :key="i" class="d-flex align-start ga-2 mb-2">
        <v-icon icon="mdi-check-circle" size="18" color="primary" class="mt-1 flex-shrink-0" />
        <span class="text-body-2">{{ feature.text }}</span>
      </div>
      <div v-for="line in limitLines" :key="line" class="d-flex align-start ga-2 mb-2">
        <v-icon icon="mdi-check-circle" size="18" color="primary" class="mt-1 flex-shrink-0" />
        <span class="text-body-2">{{ line }}</span>
      </div>
      <div v-if="!enabledFeatures.length && !limitLines.length" class="text-caption text-medium-emphasis">
        Everything in QSR, without trial limits.
      </div>
    </div>

    <v-btn v-if="plan.isCustom" block size="large" variant="outlined" color="primary" :href="mailtoHref">
      {{ plan.ctaText || 'Contact us' }}
    </v-btn>
    <v-btn v-else block size="large" color="primary" :disabled="current || disabled" :loading="loading"
      @click="$emit('subscribe', plan)">
      {{ current ? 'Subscribed' : plan.ctaText || 'Subscribe' }}
    </v-btn>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  plan: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  current: { type: Boolean, default: false },
})
defineEmits(['subscribe'])

const LIMIT_NAMES = { BRANCHES: 'branches', STAFF_USERS: 'staff accounts', MENU_ITEMS: 'menu items', TABLES: 'tables', ORDERS: 'orders' }

const enabledFeatures = computed(() => (props.plan.features || []).filter((f) => f && f.enabled !== false))

// Only limited resources are worth calling out; unlimited is the default.
const limitLines = computed(() =>
  Object.entries(props.plan.limits || {})
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([k, v]) => `Up to ${v} ${LIMIT_NAMES[k] || k.toLowerCase()}`)
)

const formattedPrice = computed(() => {
  const value = Number(props.plan.price) || 0
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: props.plan.currency || 'INR', maximumFractionDigits: 0 }).format(value)
  } catch {
    return `${props.plan.currency || 'INR'} ${value.toLocaleString()}`
  }
})

const intervalLabel = computed(() => ({ monthly: '/ month', yearly: '/ year' })[props.plan.interval] || '')

const mailtoHref = computed(() => `mailto:support@bucksbox.in?subject=${encodeURIComponent(`Enquiry about the ${props.plan.name || 'Custom'} plan`)}`)
</script>

<style scoped>
.plan-card {
  border: 1.5px solid transparent;
  transition: border-color 0.15s ease;
}
.plan-card--popular {
  border-color: rgb(var(--v-theme-primary));
}
.plan-card--current {
  border-color: rgb(var(--v-theme-success));
}
</style>
